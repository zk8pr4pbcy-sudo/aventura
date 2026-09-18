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

Supported content types:

- `event`
- `offer`
- `announcement`
- `experience`

Lifecycle:

- `draft`
- `published`
- `archived`

Content capabilities:

- Arabic, English and Spanish title/body fields
- optional image/media URL
- Jeddah/Riyadh display window stored as absolute timestamps
- sort order and bounded structured JSON metadata
- Audit Log entries for create, update, publish and archive actions
- public delivery returns only published content inside its active time window and strips internal IDs/user metadata
- content management is restricted to `owner`, `admin`, and `content` roles

Content endpoints:

- `GET /api/v1/content/:type` — public read-only feed for published content
- `GET /api/v1/admin/content`
- `POST /api/v1/admin/content`
- `GET /api/v1/admin/content/:id`
- `PATCH /api/v1/admin/content/:id`
- `POST /api/v1/admin/content/:id/publish`
- `POST /api/v1/admin/content/:id/archive`

The private `/admin` UI includes the content workflow, but the live static website is **not connected to these feeds yet**.

### Durable notifications and email foundation

- request creation writes a notification outbox event inside the same PostgreSQL transaction
- notification events contain only minimal routing metadata; customer contact data is loaded from PostgreSQL at send time
- retryable outbox processing with `FOR UPDATE SKIP LOCKED`
- stale processing locks can be reclaimed safely
- exponential retry delay with a bounded maximum
- failure records keep non-sensitive error codes rather than provider messages that could contain recipient data
- provider-neutral SMTP delivery through Nodemailer
- deterministic Message-ID and Aventura event headers for request-created emails
- one-shot worker command: `npm run notifications:dispatch`

No SMTP credentials are stored in the repository. If SMTP variables are absent, email delivery remains disabled.

## Database

PostgreSQL is the database contract. Migrations live in `database/migrations/` and remain provider-neutral. The migration runner owns the transaction boundary and normalizes legacy outer `BEGIN/COMMIT` wrappers so each migration and its `schema_migrations` record are committed atomically.

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

Dispatch pending notifications only from a secure runtime after approved SMTP credentials have been configured:

```sh
DATABASE_URL='postgresql://...' \
SMTP_HOST='smtp.example.com' \
SMTP_PORT='587' \
SMTP_SECURE='false' \
SMTP_USER='runtime-secret' \
SMTP_PASS='runtime-secret' \
SMTP_FROM='Aventura <requests@example.com>' \
OPERATIONS_NOTIFICATION_EMAIL='operations@example.com' \
npm run notifications:dispatch
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

`Aventura Backend CI` additionally starts a temporary PostgreSQL service, applies all migrations, runs the backend test suite, verifies the schema, and exercises real persistence, admin, content and notification paths without sending external email.

## Not production-ready yet

Before production deployment, the project still requires an approved hosting/database location, approved production SMTP service and credentials, backup/restore validation, production secret management, rate limiting and abuse controls, final security review, final end-to-end testing, and the controlled public-form migration. Do not remove FormSubmit or route live customer traffic to this backend until those gates are completed and approved.
