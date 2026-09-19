# Aventura Backend — Production Deployment Gate

This document defines the deployment contract for the Aventura Management System backend. It is intentionally provider-neutral so the same backend can run in an approved Saudi-hosted environment without changing business logic.

## Deployment sequence

1. Provision an approved PostgreSQL 17-compatible managed database in the approved Saudi region.
2. Store `DATABASE_URL` and all other credentials in the provider's secret manager or equivalent secure runtime configuration. Never commit secrets to GitHub.
3. Run database migrations as a controlled release step:

   ```sh
   NODE_ENV=production DATABASE_URL='postgresql://...' npm run db:migrate
   ```

4. Run the production preflight against the target database:

   ```sh
   NODE_ENV=production \
   DATABASE_URL='postgresql://...' \
   PUBLIC_REQUESTS_ENABLED=false \
   npm run production:preflight
   ```

   The preflight verifies database connectivity and confirms every migration present in the release image has already been applied.

5. Start the application container.
6. Configure the platform liveness probe to `GET /health`.
7. Configure the traffic/readiness probe to `GET /ready`. Traffic must not be routed to an instance unless `/ready` returns HTTP 200.
8. Keep `PUBLIC_REQUESTS_ENABLED=false` for the first production deployment. This allows admin and operational verification without moving live website forms.
9. Bootstrap the first Owner only through the secure runtime command after the database is ready.
10. Configure SMTP and the notification worker only after the provider and production credentials are approved.
11. Enable live public request ingestion only during the controlled dual-path migration from FormSubmit, with server-side Turnstile, approved hostnames, and explicit browser origins configured.

## Container contract

The production image is built from `backend/Dockerfile`.

Security properties:

- Node.js 24 runtime.
- application runs as the unprivileged `node` user, not root.
- no `.env` files or test files are copied into the image.
- no secrets are baked into the image.
- `/health` is used only for process liveness.
- `/ready` requires a successful PostgreSQL readiness check.
- the container starts the Node process directly so it receives termination signals.

Example build:

```sh
docker build -f backend/Dockerfile -t aventura-backend ./backend
```

## Required production environment

Required for the application runtime:

- `NODE_ENV=production`
- `DATABASE_URL`

Public request ingestion remains disabled by default in production. When explicitly enabled, these are also required:

- `PUBLIC_REQUESTS_ENABLED=true`
- `TURNSTILE_REQUIRED=true`
- `TURNSTILE_SECRET_KEY`
- `TURNSTILE_HOSTNAMES`
- `PUBLIC_API_ORIGINS=https://aventuraksa.com,https://www.aventuraksa.com`

The production configuration refuses to start public request ingestion if Turnstile is explicitly disabled or if the browser-origin allowlist is missing.

### CORS boundary

`PUBLIC_API_ORIGINS` is an exact HTTPS allowlist for the browser-facing request and published-content APIs. The backend never uses `Access-Control-Allow-Origin: *` for these routes.

CORS is only a browser boundary. It is **not** authentication and it is **not** the abuse-prevention mechanism. Server-side Turnstile validation remains mandatory whenever production public request ingestion is enabled.

### Trusted proxy and client IP

Login rate limiting always applies per account. IP-based login limiting is added only when a trusted client-IP source is explicitly configured with `TRUSTED_CLIENT_IP_HEADER`.

Supported modes:

- `cf-connecting-ip`
- `x-forwarded-for`
- `remote-address`

A forwarded header such as `CF-Connecting-IP` or `X-Forwarded-For` must **never** be trusted merely because the header exists. Enable one of these modes only after network rules ensure clients cannot bypass the approved proxy/load balancer and connect directly to the backend. If that guarantee does not exist, leave `TRUSTED_CLIENT_IP_HEADER` unset and rely on account rate limiting until the ingress boundary is corrected.

For a Cloudflare-only ingress design, the intended runtime setting is:

```sh
TRUSTED_CLIENT_IP_HEADER=cf-connecting-ip
```

but only after origin access is restricted to the trusted Cloudflare/ingress path.

SMTP remains optional until notifications are approved for production. Credentials must remain in secret storage.

## Database release rule

Application deployment and database migration are separate operations. The server does not automatically modify the production schema on startup.

Release order is always:

`backup/PITR check → migrate → preflight → deploy application → readiness passes → route traffic`

This prevents multiple application instances from racing to modify the schema and makes rollback decisions explicit.

## Backup and recovery gate

Production must provide managed backups and point-in-time recovery where supported. A deployment is not considered production-ready until:

- retention policy is approved,
- recovery window is documented,
- encryption at rest and in transit are enabled,
- a restore drill has been completed against a clean database,
- backup access is limited to authorized administrators.

The repository already has `Aventura Backend Recovery CI`, which verifies `pg_dump → clean database → pg_restore → business-data verification` on PostgreSQL 17. Managed-provider backup/PITR remains an additional production requirement, not a replacement for restore testing.

## Observability gate

Each HTTP response receives an `X-Request-Id`. Runtime access logs are structured JSON and include only the request ID, method, URL pathname, status code, duration and timestamp. Query strings and request bodies are intentionally excluded so routine operational logging does not collect customer PII.

The production provider should route stdout/stderr into its managed logging service and configure alerts for repeated 5xx responses, failed readiness probes, container restarts and database connection failures before live forms are enabled.

## First deployment remains dark

The first backend deployment must be a dark deployment:

- no public website form points to the backend,
- FormSubmit remains active,
- `PUBLIC_REQUESTS_ENABLED=false`,
- no real customer request is sent until admin login, database persistence, notification configuration, monitoring, and recovery are verified in the production environment.

Only after those gates pass should the controlled dual-path form migration begin.
