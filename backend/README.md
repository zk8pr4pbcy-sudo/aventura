# Aventura Backend

Server-side workspace for the **Aventura Management System**.

The backend is being built and tested in isolation from the live public website. No production database credentials are committed, no real customer data is stored here, the live site is unchanged, and the existing FormSubmit path remains the public-site safety net until production migration gates are met.

## Implemented capabilities

### Public API foundation

- `GET /health`
- `POST /api/v1/experience-requests`
- `POST /api/v1/collaboration-requests`
- input validation before persistence
- PostgreSQL transactions for customer + request creation
- public references such as `AV-EXP-YYYY-000001` and `AV-COL-YYYY-000002`

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

Admin auth endpoints:

- `POST /api/v1/admin/auth/login`
- `GET /api/v1/admin/auth/session`
- `POST /api/v1/admin/auth/logout`

### Protected admin request API

- `GET /api/v1/admin/requests`
- `GET /api/v1/admin/requests/:kind/:id`
- `PATCH /api/v1/admin/requests/:kind/:id/status`
- `POST /api/v1/admin/requests/:kind/:id/notes`
- `GET /api/v1/admin/dashboard/summary`

All admin request endpoints require an authenticated session and the appropriate role permission.

## Database

PostgreSQL is the database contract. Migrations live in `database/migrations/` and remain provider-neutral.

Run migrations:

```sh
cd backend
DATABASE_URL='postgresql://...' npm run db:migrate
```

Create the first Owner only in a secure runtime after migrations:

```sh
DATABASE_URL='postgresql://...' \
ADMIN_EMAIL='owner@example.com' \
ADMIN_NAME='Aventura Owner' \
ADMIN_PASSWORD='a-long-unique-password' \
npm run admin:create-owner
```

Never commit real values for these variables.

## Local checks

```sh
cd backend
npm install
npm run check
npm test
npm start
```

`Aventura Backend CI` additionally starts a temporary PostgreSQL service, applies all migrations, runs the backend test suite, verifies the schema, and exercises real persistence paths.

## Not production-ready yet

Before production deployment, the project still requires the remaining security gates, notification/email integration, approved hosting/database location, backup/restore validation, production secret management, rate limiting/abuse controls, final end-to-end testing, and the controlled public-form migration. Do not remove FormSubmit or route live customer traffic to this backend until those gates are completed and approved.
