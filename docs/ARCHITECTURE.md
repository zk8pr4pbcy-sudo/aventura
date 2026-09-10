# Aventura Website Architecture

This document is the architecture lock for the Aventura website after the 2026 refactor. It describes the boundaries that are intentionally stable and the rules future work must preserve unless an architecture change is explicitly approved.

## System shape

Aventura is a static, multilingual website deployed through GitHub Pages. Permanent page structure lives in HTML, permanent presentation lives in CSS, and JavaScript is split by runtime responsibility where a boundary is clear and testable.

The goal is not to maximize the number of files. The goal is to keep ownership clear, behavior protected, and future changes easy to review.

## Architecture principles

1. Preserve user-visible behavior before changing structure.
2. Separate responsibilities only when the boundary is meaningful and testable.
3. Keep permanent DOM structure in HTML whenever source order can express it.
4. Keep permanent styling in CSS; JavaScript must not become a permanent CSS patch layer.
5. Shared runtime state must have one stable source of truth.
6. Arabic, English, Spanish, RTL/LTR, and Saudi date behavior are release gates.
7. Specialized runtimes load before `app.js` when `app.js` delegates to them.
8. A large file is not, by itself, a reason to split it.
9. `main` must remain deployable.

## Runtime ownership

### `assets/js/translations.js`

Owns the shared AR/EN/ES translation dictionary. It is intentionally large. Split it only when there is a concrete maintenance or loading benefit and tests protect the new boundaries.

### `assets/js/runtime-state.js`

Owns stable shared runtime state APIs, including language and Saudi date state used across modules.

### `assets/js/dialog-runtime.js`

Owns dialog mechanics, modal opening/closing, preparation, and focus restoration. `app.js` may orchestrate dialogs through the public runtime API but must not re-own implementation details.

### `assets/js/reveal-runtime.js`

Owns reveal-on-scroll behavior and `IntersectionObserver`. `app.js` delegates reveal setup through `window.AVENTURA_REVEAL` and must not contain an `IntersectionObserver` implementation.

### Contact runtime modules

- `assets/js/contact-consent.js` owns privacy-consent validation and consent timestamp behavior.
- `assets/js/contact-wizard.js` owns contact wizard navigation and step behavior.
- `assets/js/contact-request-data.js` owns contact request data collection and request-summary construction responsibilities assigned to it by its contract tests.
- `assets/js/contact-submission.js` owns submission transport, including the FormSubmit endpoint/network request and WhatsApp destination construction. It exposes `window.AVENTURA_CONTACT_SUBMISSION`.

`app.js` may prepare request metadata and own localized success/error UI, but FormSubmit transport must not return to `app.js`.

### `assets/js/perfume-story-runtime.js`

Owns perfume story runtime behavior extracted from the shared application runtime.

### `assets/js/app.js`

`app.js` is the shared application orchestrator plus the remaining cohesive site/domain behavior. It owns shared page initialization, shell behavior, translation application/orchestration, Saudi-date integration, and the remaining boutique domain logic that is still tightly coupled: catalog state, filters, product selection, experience-linked boutique behavior, and quote-link composition.

The boutique code is intentionally not being split merely to reduce the size of `app.js`. A future split requires a real ownership boundary, regression coverage, and a maintenance or product benefit that justifies the migration risk.

`app.js` must not re-own:

- FormSubmit endpoint or transport logic;
- reveal `IntersectionObserver` implementation;
- dialog implementation details already owned by `dialog-runtime.js`;
- contact wizard internals already owned by the contact modules;
- one-off recovery or patch runtimes.

## HTML and CSS ownership

Root HTML pages own permanent semantic structure and source order. JavaScript should enhance behavior, not move permanent page sections into place at runtime.

CSS owns permanent styling. Historical CSS filenames that include words such as `fix` are not automatically architecture violations; the runtime prohibition applies specifically to one-off JavaScript patch/recovery files. CSS cleanup can happen as separate visual work when there is a clear benefit and regression coverage.

## Prohibited runtime patterns

The following are blocked by `tests/architecture-contract.mjs` and/or the focused contract tests:

- any `assets/js/*-fix.js` permanent runtime patch;
- any JavaScript runtime file in `assets/js` whose filename contains `recovery`;
- root HTML references to `*-fix.js` or recovery JavaScript runtimes;
- FormSubmit transport ownership in `assets/js/app.js`;
- `IntersectionObserver` ownership in `assets/js/app.js`;
- bypassing an extracted runtime by copying its implementation back into `app.js`.

## Test and CI layers

- Focused `*-contract.mjs` tests protect module ownership and static integration boundaries.
- Browser tests use Chromium to protect real multilingual/contact/reveal behavior.
- `tests/smoke.mjs` protects broad maintenance invariants.
- `tests/architecture-contract.mjs` is the architecture lock: it protects the high-level boundaries from regressing after the refactor is closed.
- `.github/workflows/maintenance-ci.yml` runs syntax checks, architecture/static contracts, and Chromium regression tests for refactor branches and pull requests.
- `.github/workflows/site-quality.yml` validates pages, links, translations, and core JavaScript on pull requests and `main`.
- `.github/workflows/pages.yml` deploys the approved `main` branch to GitHub Pages.

## Change protocol after architecture lock

Normal product work should add or modify features inside the existing ownership boundaries. Do not reopen a general refactor simply because a file is large.

If a future feature genuinely requires an architecture boundary to change:

1. state the reason and expected benefit in the pull request;
2. update this document in the same change;
3. update the relevant contract test intentionally rather than bypassing it;
4. preserve or add regression coverage before moving behavior;
5. pass Maintenance CI, Chromium tests, and Site Quality before merge.

A failing architecture contract is therefore not a test to work around. It means either the change violates the locked architecture or the architecture decision itself must be reviewed explicitly.

## Refactor closure

The 2026 maintenance refactor is considered complete when the architecture-lock pull request passes Maintenance CI, Chromium regression coverage, Site Quality, is merged into `main`, and the matching GitHub Pages deployment succeeds.

After that point, further work is product development, targeted maintenance, or an explicitly justified architecture change — not an open-ended continuation of the refactor.
