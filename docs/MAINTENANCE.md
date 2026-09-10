# Aventura Website Maintenance

This document defines the maintenance rules for the Aventura website after the 2026 refactor closure. The architecture itself is documented in `docs/ARCHITECTURE.md`; this file explains how to change the site safely without reopening a permanent refactor program.

## Core principles

1. Preserve visitor behavior before restructuring code.
2. Give each module one clear responsibility.
3. Do not use runtime CSS injection or DOM-reordering patches for permanent features.
4. Arabic, English, Spanish, RTL/LTR, and Saudi date behavior are release gates.
5. Keep `main` deployable. Structural work happens on a branch and must pass CI before merge.
6. Prefer small reversible changes over large rewrites.
7. A large file is not, by itself, a reason to split it.
8. If a locked architecture boundary genuinely needs to change, update `docs/ARCHITECTURE.md` and the relevant contract test in the same pull request.

## Current responsibilities

- `assets/js/translations.js` — shared AR/EN/ES translation dictionary. It remains intentionally large and should only be split when there is a concrete maintenance or loading benefit protected by tests.
- `assets/js/runtime-state.js` — stable shared runtime state APIs, including language and Saudi-date state used across modules.
- `assets/js/dialog-runtime.js` — dialog mechanics, preparation, opening/closing, and focus restoration.
- `assets/js/reveal-runtime.js` — reveal-on-scroll behavior and `IntersectionObserver` ownership.
- `assets/js/contact-consent.js` — privacy-consent validation and consent timestamp behavior.
- `assets/js/contact-wizard.js` — contact wizard navigation and step behavior.
- `assets/js/contact-request-data.js` — contact request data preparation responsibilities protected by its focused contract/browser tests.
- `assets/js/contact-submission.js` — FormSubmit transport and WhatsApp destination construction through `window.AVENTURA_CONTACT_SUBMISSION`.
- `assets/js/perfume-story-runtime.js` — perfume story runtime behavior.
- `assets/js/app.js` — shared application orchestration plus the remaining cohesive site/domain behavior, including the boutique catalog/filter/selection/experience-link/request-link logic that is intentionally kept together.
- `tests/smoke.mjs` — broad static release guardrails for language state, translations, Saudi date validation, contact behavior, and maintenance invariants.
- `tests/*-contract.mjs` — focused ownership and integration contracts for extracted runtimes.
- `tests/architecture-contract.mjs` — architecture lock preventing regression to runtime patches/recovery files and preventing FormSubmit or reveal observer ownership from returning to `app.js`.
- `tests/*-browser.mjs` and `tests/browser-smoke.mjs` — real Chromium regression coverage for multilingual initialization, RTL/LTR, contact flows, Saudi date behavior, reveal runtime behavior, and submission flows.
- `.github/workflows/maintenance-ci.yml` — JavaScript syntax checks, architecture/static contracts, and Chromium regression checks.
- `.github/workflows/site-quality.yml` — page/link/translation validation on pull requests and `main`.

## Safe change workflow

1. Create a focused branch from `main`.
2. Make one bounded change.
3. Let Maintenance CI run when the branch/workflow scope applies.
4. Review the diff and confirm there are no unrelated edits.
5. Browser-test the affected flow in Arabic, English, and Spanish. Automated Chromium coverage is the baseline, not a replacement for targeted visual review when layout changes.
6. Check mobile layout, RTL/LTR behavior, and keyboard/focus behavior where relevant.
7. For booking/contact changes, verify past-date rejection and submit a controlled FormSubmit test request when submission behavior changes.
8. Let Site Quality pass on the pull request.
9. Merge/deploy only after automated checks and practical checks pass.

## Refactor closure status

The planned structural cleanup is complete up to the final architecture lock:

1. Contact page permanent structure/CSS/consent ownership — complete and protected.
2. Stable runtime state for language/Saudi-date dependencies — complete and protected.
3. Contact wizard extraction — complete and protected.
4. Contact request-data extraction — complete and protected.
5. Contact submission transport extraction — complete and protected.
6. Dialog runtime extraction — complete and protected.
7. Perfume story runtime extraction — complete and protected.
8. Reveal runtime extraction — complete and protected.
9. Legacy JavaScript `*-fix.js`, recovery, and copy-override cleanup — complete and protected.
10. Architecture documentation and CI lock — final closure step.

After the architecture-lock pull request is merged and the matching GitHub Pages deployment succeeds, this refactor program is closed. Future work should be treated as product development, targeted maintenance, or an explicitly justified architecture change.

## Intentionally retained boundaries

`assets/js/app.js` is not being split further merely to reduce file size. The remaining boutique responsibilities — catalog state, filters, product selection, experience-linked behavior, and quote-link composition — are coupled enough that splitting them now would create migration risk without a proportional maintenance benefit.

`assets/js/translations.js` is also not being split merely because it is large. A future domain split is valid only when it has a clear benefit and adequate regression coverage.

## Prohibited maintenance patterns

- Adding a permanent `assets/js/*-fix.js` file to patch another module at runtime.
- Adding a JavaScript recovery runtime instead of fixing the owning module.
- Returning FormSubmit endpoint/network transport to `assets/js/app.js`.
- Returning `IntersectionObserver` reveal implementation to `assets/js/app.js`.
- Injecting ordinary page CSS from JavaScript.
- Moving permanent DOM sections with JavaScript when source-order HTML can express the intended layout.
- Duplicating language state across modules without one stable source of truth.
- Copying extracted implementation details back into `app.js` instead of using the stable runtime API.
- Making structural refactor commits directly on `main`.
- Treating file-presence checks as a substitute for practical browser testing.
- Weakening or bypassing a contract test solely to make CI green. If the architecture genuinely changes, document and review that decision explicitly.

## Definition of done for a product or maintenance change

A change is complete only when:

- behavior is intentionally defined and the diff contains only the intended change;
- JavaScript syntax checks pass;
- relevant architecture/static contract tests pass;
- automated Chromium regression checks pass when the affected flow is covered;
- AR/EN/ES behavior is verified for the affected flow;
- mobile and RTL/LTR behavior are checked when relevant;
- booking/date/submission behavior is checked when applicable;
- no temporary migration workflow or runtime patch remains;
- Site Quality passes before merge;
- `main` remains deployable.

## Architecture changes

The architecture lock is a guardrail, not a ban on future evolution. When a future feature truly requires changing ownership boundaries, follow the change protocol in `docs/ARCHITECTURE.md`: explain the reason, update the architecture document, update the relevant contract intentionally, add or preserve regression coverage, and pass the full CI/review path before merge.
