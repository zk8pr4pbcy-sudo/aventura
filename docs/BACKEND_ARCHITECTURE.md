# Aventura Backend Architecture

Status: foundation decision record — backend work is isolated from the live GitHub Pages site until deployment and integration are explicitly approved.

## Purpose

The backend is the server-side foundation for the Aventura Management System. The existing public website remains the visitor-facing frontend. The backend will become the authoritative system for business requests, administrative workflows, controlled website content, and audit history.

## First-release domains

1. Authentication and users
2. Customers
3. Experience / quote requests
4. Collaboration requests
5. Request workflow and internal notes
6. Notifications and email
7. Admin dashboard APIs
8. Website content management
9. Security and audit logging
10. Database and system operations

## Data ownership

The database is the source of truth for submitted requests. Email is a notification and communication channel, not the request database.

Initial core records:
- users and roles
- customers
- experience_requests
- collaboration_requests
- request_status_history
- internal_notes
- website_content
- audit_log

Every business request must receive a stable public reference ID separate from its internal database ID.

## Public website integration

The current static site remains deployable independently.

Public write endpoints will be introduced for:
- experience / quote request submission
- collaboration request submission

Public read endpoints may later expose only explicitly published website content.

The current FormSubmit transport must remain available during migration. It must not be removed until database persistence, error handling, monitoring, and a controlled production submission test have passed.

## Admin boundary

The admin application is private and must not be linked from public navigation.

Admin capabilities are introduced behind authentication and authorization:
- view/search/filter requests
- assign and change status
- add internal notes
- manage customers
- review collaboration requests
- publish/unpublish approved dynamic website content
- view audit history

Authorization is enforced server-side. Hiding controls in the browser is never an authorization mechanism.

## Security baseline

- Server-side validation for every input.
- Rate limiting and anti-abuse controls on public endpoints.
- Existing Turnstile protection should be verified server-side when the public forms migrate.
- Secrets and database credentials never enter the frontend repository payload or browser bundle.
- Least-privilege database and admin access.
- Secure session/cookie settings for admin authentication.
- Audit sensitive administrative actions.
- Minimize stored personal data and define retention/deletion rules before production launch.
- Production backups and restore testing are release requirements.

## API boundary

Version public and admin APIs from the start (for example, /api/v1/...).

Do not make frontend pages depend directly on database schemas. All reads and writes go through backend service/API boundaries so database changes do not force public-site rewrites.

## Deployment boundary

GitHub Pages continues to host the static public site. A real backend requires a separate server-capable runtime and managed database; GitHub Pages itself is not the backend runtime.

No production backend vendor is locked by this document. Provider selection must consider:
- Saudi/PDPL data-handling requirements and chosen data location
- managed PostgreSQL support
- backups and recovery
- secrets management
- logs/monitoring
- predictable cost
- custom domain/TLS
- deployment and rollback simplicity

## Proposed implementation shape

Use a dedicated top-level `backend/` workspace in this repository initially, with its own dependencies, configuration, tests, and deployment lifecycle. This keeps the website and backend visibly separated while preserving one project history.

Expected module boundaries:

```
backend/
  src/
    auth/
    users/
    customers/
    experience-requests/
    collaboration-requests/
    request-workflow/
    notifications/
    admin/
    website-content/
    security/
    database/
    shared/
  tests/
```

Do not create empty placeholder modules merely to satisfy this diagram. Add each module when its implementation and tests begin.

## Migration sequence

1. Architecture and provider decision.
2. Backend runtime skeleton + health check + configuration validation.
3. Database schema and migrations.
4. Experience-request API with dual-path migration safety.
5. Collaboration-request API.
6. Authentication, roles, and private admin APIs.
7. Admin interface integration.
8. Notifications/email integration.
9. Website content publishing API.
10. Security, backup/restore, load and end-to-end release gates.

## Release gates

A backend feature cannot replace an existing production path until:
- automated tests pass;
- validation and authorization tests pass;
- AR/EN/ES request payloads are verified where applicable;
- controlled end-to-end submissions succeed;
- database backup and recovery requirements are satisfied;
- logs expose failures without leaking sensitive data;
- rollback is documented;
- the public site remains functional if the backend is unavailable where graceful fallback is required.

## Architecture rule

Backend product work must not weaken the locked frontend runtime ownership in `docs/ARCHITECTURE.md`. Any required frontend architecture change must be explicit, documented, tested, and reviewed in the same pull request.
