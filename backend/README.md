# Aventura Backend

Server-side workspace for the **Aventura Management System**.

The backend is built and tested in isolation from the live public website. No production database credentials are committed, no real customer data is stored here, the live site is unchanged, and the existing FormSubmit path remains the public-site safety net until production migration gates are met.

## Implemented capabilities

### Public API foundation

- `GET /health` — process liveness
- `GET /ready` — PostgreSQL readiness
- `POST /api/v1/experience-requests`
- `POST /api/v1/collaboration-requests`
- input validation before persistence
- PostgreSQL transactions for customer + request creation
- public references such as `AV-EXP-YYYY-000001` and `AV-COL-YYYY-000002`
- durable request idempotency using UUID-v4 `Idempotency-Key`, SHA-256 key hashes/fingerprints, PostgreSQL advisory locks and unique indexes
- replay of the same key + same validated payload returns the original reference; key reuse with different data returns `409`

Production public request ingestion is fail-closed: it is disabled by default. If enabled, production automatically requires Turnstile, explicit browser origins, and request idempotency.

### Request management

- controlled request status transitions
- status history persisted in `request_status_history`
- internal notes persisted in `internal_notes`
- PostgreSQL integrity checks prevent history/notes from pointing to nonexistent requests

### Admin authentication and authorization

- password hashing with Node `scrypt`
- database-backed admin sessions stored as token hashes, never raw tokens
- HttpOnly, SameSite=Strict admin session cookie
- roles: `owner`, `admin`, `operations`, `content`, `viewer`
- least-privilege permissions
- one-time Owner bootstrap command using environment variables only
- login failure limiting by normalized account and, when explicitly configured, trusted client IP
- `429` responses include `Retry-After`
- forwarded client-IP headers are ignored unless a trusted ingress source is explicitly configured

Admin auth endpoints:

- `POST /api/v1/admin/auth/login`
- `GET /api/v1/admin/auth/session`
- `POST /api/v1/admin/auth/logout`

### Public request security boundary

When public request ingestion is enabled in production:

- server-side Cloudflare Turnstile verification is mandatory;
- expected Turnstile action and approved hostname are checked;
- `PUBLIC_API_ORIGINS` provides an exact HTTPS browser CORS allowlist;
- CORS never uses `*` on public API routes;
- `Idempotency-Key` is permitted by preflight and required on public writes;
- Turnstile tokens and raw idempotency keys are not written to business records.

CORS is a browser boundary, not authentication. Requests without `Origin` remain server-to-server compatible; write abuse protection remains Turnstile plus validation and database constraints.

### Protected admin request API and UI

- private RTL admin UI served by the backend at `/admin`
- no public-site navigation link
- `noindex` and restrictive security headers
- `GET /api/v1/admin/requests`
- `GET /api/v1/admin/requests/:kind/:id`
- `PATCH /api/v1/admin/requests/:kind/:id/status`
- `POST /api/v1/admin/requests/:kind/:id/notes`
- `GET /api/v1/admin/dashboard/summary`

All admin data endpoints require an authenticated session and the appropriate role permission.

### Controlled website content management

The backend controls only approved dynamic surfaces. It does **not** turn the whole Aventura website into a CMS and does not expose brand structure, navigation, hero layout, or core design controls.

Supported types: `event`, `offer`, `announcement`, `experience`.

Lifecycle: `draft → published → archived`.

Capabilities include Arabic/English/Spanish fields, media URL, display windows, sort order, bounded JSON metadata, Audit Log entries, role-based content management, and a public feed that returns only active published content without internal IDs.

Content endpoints:

- `GET /api/v1/content/:type`
- `GET /api/v1/admin/content`
- `POST /api/v1/admin/content`
- `GET /api/v1/admin/content/:id`
- `PATCH /api/v1/admin/content/:id`
- `POST /api/v1/admin/content/:id/publish`
- `POST /api/v1/admin/content/:id/archive`

The live static website is **not connected to these feeds yet**.

### Durable notifications and email foundation

- request creation writes a notification outbox event inside the same PostgreSQL transaction
- customer contact data is loaded from PostgreSQL at send time rather than duplicated in the outbox
- retryable outbox processing with `FOR UPDATE SKIP LOCKED`
- stale processing locks can be reclaimed safely
- bounded exponential retries
- non-sensitive failure codes
- provider-neutral SMTP through Nodemailer
- deterministic Message-ID / event headers
- one-shot worker: `npm run notifications:dispatch`

No SMTP credentials are stored in the repository.

## Production runtime

- Node.js 24 container image
- non-root `node` user
- production preflight verifies database connectivity and that every repository migration has been applied
- `/health` and `/ready` are deliberately separate
- structured JSON HTTP access logs include request ID, method, path, status and duration but exclude query strings and bodies
- every HTTP response receives `X-Request-Id`
- bounded graceful SIGTERM/SIGINT shutdown closes idle HTTP connections and PostgreSQL before exit

See `DEPLOYMENT.md` for the provider-neutral deployment contract.

## Database and recovery

PostgreSQL is the database contract. Migrations live in `database/migrations/` and remain provider-neutral. The migration runner owns the transaction boundary so each migration and its `schema_migrations` record commit atomically.

`Aventura Backend Recovery CI` performs a real PostgreSQL 17 drill:

`migrate → seed → pg_dump → clean database → pg_restore → verify schema/business data`.

Managed-provider backup retention, encryption and point-in-time recovery remain production deployment requirements.

Run migrations:

```sh
cd backend
DATABASE_URL='postgresql://...' npm run db:migrate
```

Production preflight:

```sh
NODE_ENV=production \
DATABASE_URL='postgresql://...' \
PUBLIC_REQUESTS_ENABLED=false \
npm run production:preflight
```

Create the first Owner only in a secure runtime after migrations:

```sh
DATABASE_URL='postgresql://...' \
ADMIN_EMAIL='owner@example.com' \
ADMIN_NAME='Aventura Owner' \
ADMIN_PASSWORD='a-long-unique-password' \
npm run admin:create-owner
```

Never commit real secret values.

## Automated gates

- **Aventura Backend CI** — syntax, migrations, full backend tests, schema and real persistence checks
- **Aventura Backend Container CI** — production image, preflight inside image, non-root runtime, liveness/readiness and graceful SIGTERM
- **Aventura Backend Recovery CI** — real backup/restore drill
- **Aventura Backend Load Smoke CI** — concurrent PostgreSQL writes, reference uniqueness, durable outbox and idempotency coverage
- existing Site Quality and Maintenance/Browser CI remain active for the public frontend

## Not production-ready yet

Before customer traffic moves to this backend, the project still requires an approved Saudi hosting/database provider, production secret management, managed backup/PITR policy, approved production SMTP, the final ingress/network restriction that makes the chosen trusted proxy header authoritative, provider monitoring/alerts, final staging E2E verification, and the controlled dual-path public-form migration.

Do not remove FormSubmit or route live customer traffic to this backend until those gates are completed and approved.
