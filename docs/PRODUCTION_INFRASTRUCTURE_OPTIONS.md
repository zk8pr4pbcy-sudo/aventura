# Aventura Production Infrastructure Shortlist

Status: evaluation only — no production resources created

Verified: 2026-09-19

## Goal

Select a Saudi-hosted production runtime for the Aventura Management System while preserving the provider-neutral PostgreSQL/application boundaries already implemented in the repository.

No customer data should be stored and no paid production resource should be created until the final provider, region, backup policy, secret-management path, and deployment plan are approved.

## Current shortlist

### 1. Oracle Cloud Infrastructure — Jeddah (`me-jeddah-1`)

Current official Oracle documentation lists Saudi Arabia West (Jeddah) and Saudi Arabia Central (Riyadh) as OCI regions. Oracle's current API endpoint catalog exposes OCI Database with PostgreSQL endpoints in both `me-jeddah-1` and `me-riyadh-1`. OCI Database with PostgreSQL supports PostgreSQL 17.

Relevant characteristics to validate in a proof of concept:

- managed PostgreSQL 17 compatibility with Aventura migrations;
- Jeddah regional placement;
- private networking between application runtime and database;
- automatic backups / point-in-time recovery options;
- managed secret storage;
- outbound SMTP connectivity for the notification worker;
- actual monthly cost at Aventura's expected workload;
- operational support and account onboarding.

Oracle documents automatic PostgreSQL backup schedules with retention up to 35 days and high-availability options. The production design must still define Aventura's own retention and recovery objectives rather than relying on defaults.

### 2. Google Cloud — Dammam (`me-central2`)

Current Google Cloud documentation lists Cloud SQL for PostgreSQL in the Dammam `me-central2` region. Google also documents that KSA billing-address customers purchase access to the Dammam region through CNTXT.

Relevant characteristics to validate in a proof of concept:

- Cloud SQL PostgreSQL version/features required by Aventura;
- regional database and application-runtime availability in Dammam;
- private networking;
- backup/PITR configuration;
- Secret Manager integration;
- outbound SMTP approach;
- CNTXT onboarding/billing path;
- actual monthly cost at Aventura's expected workload.

## Not shortlisted for immediate production

### AWS

AWS's current global infrastructure documentation still describes the Kingdom of Saudi Arabia Region as announced/coming soon rather than generally available. It should be reconsidered after general availability, not used as the current Aventura production dependency.

### Microsoft Azure

Microsoft's current published guidance still does not show the Saudi region as generally available for ordinary customer resource deployment. Public Microsoft guidance points to a later 2026 availability target. It should be reconsidered after general availability and service-level availability are confirmed.

## Technical proof-of-concept order

The first technical compatibility check should use **OCI Jeddah**, followed by **Google Cloud Dammam** if cost, onboarding, operational tooling, or service limits make OCI unsuitable.

This is a proof-of-concept order, not authorization to create paid resources and not a permanent provider lock-in.

## Mandatory acceptance checks

Before a provider can be approved, verify all of the following with a disposable environment and no real customer data:

1. Node.js runtime can deploy the current backend without provider-specific application rewrites.
2. PostgreSQL migrations complete from an empty database.
3. Experience and collaboration request transactions persist correctly.
4. Admin sessions, content management, audit log, and notification outbox operate correctly.
5. Turnstile server verification can reach Cloudflare Siteverify.
6. SMTP notification delivery can operate through the approved mail path without embedding credentials in code.
7. TLS is enforced for application and database connections.
8. Database is not publicly exposed unless a specifically reviewed architecture requires it.
9. Secrets are stored in the provider's secret-management service or equivalent secure runtime mechanism.
10. Automated backups and point-in-time recovery are enabled with an approved retention period.
11. A restore drill succeeds from a provider-managed backup as well as the repository's logical `pg_dump` recovery test.
12. Logging/monitoring does not leak request payloads, passwords, session tokens, Turnstile tokens, or SMTP credentials.
13. Production public request ingestion remains disabled until the API origin, CORS/proxy design, Turnstile widget/actions, and live-form dual-write migration are ready.
14. FormSubmit remains available as the migration safety net until controlled production submissions prove the database/admin/email path end to end.

## Decision record

No final production provider has been selected yet. The application remains provider-neutral by design.

### Official sources checked 2026-09-19

- Google Cloud — Cloud SQL PostgreSQL region availability: https://docs.cloud.google.com/sql/docs/postgres/region-availability-overview
- Google Cloud — Dammam region access: https://docs.cloud.google.com/docs/dammam-region-access
- Oracle Cloud — Regions and Availability Domains: https://docs.oracle.com/en-us/iaas/Content/General/Concepts/regions.htm
- Oracle Cloud — API endpoints (PostgreSQL): https://docs.oracle.com/en-us/iaas/api/
- Oracle Cloud — OCI Database with PostgreSQL: https://docs.oracle.com/en-us/iaas/Content/postgresql/
- Oracle Cloud — PostgreSQL 17 support: https://docs.oracle.com/en-us/iaas/releasenotes/postgresql/db-17.htm
- Oracle Cloud — PostgreSQL HA and backups: https://docs.oracle.com/en-us/iaas/Content/postgresql/high-availability.htm
- AWS — Global infrastructure regions: https://aws.amazon.com/about-aws/global-infrastructure/regions_az/
- Microsoft — Azure regions list: https://learn.microsoft.com/azure/reliability/regions-list
