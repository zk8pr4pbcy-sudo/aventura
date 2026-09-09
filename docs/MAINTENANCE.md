# Aventura Website Maintenance

This document defines the maintenance rules for the Aventura website so future changes remain safe, reviewable, and easy to extend.

## Core principles

1. Preserve visitor behavior before restructuring code.
2. Give each module one clear responsibility.
3. Do not use runtime CSS injection or DOM-reordering patches for permanent features.
4. Arabic, English, Spanish, RTL/LTR, and Saudi date behavior are release gates.
5. Keep `main` deployable. Structural work happens on a branch and must pass CI before merge.
6. Prefer small reversible changes over large rewrites.

## Current responsibilities

- `assets/js/translations.js` — shared translation dictionary. It is still a large legacy file and should only be split when tests protect the affected domains.
- `assets/js/app.js` — shared legacy runtime. Extract responsibilities incrementally; do not perform a big-bang rewrite.
- `assets/css/contact.css` — contact-page layout and privacy-consent styling.
- `assets/js/contact-consent.js` — privacy-consent validation and consent timestamp only.
- `tests/smoke.mjs` — release guardrails for language state, translations, Saudi date validation, contact submission, and contact architecture.
- `.github/workflows/maintenance-ci.yml` — JavaScript syntax checks and smoke-test execution.

## Safe change workflow

1. Create a focused branch from `main`.
2. Make one bounded change.
3. Let Maintenance CI run.
4. Review the diff and confirm there are no unrelated edits.
5. Browser-test the affected flow in Arabic, English, and Spanish.
6. Check mobile layout, RTL/LTR behavior, and keyboard/focus behavior where relevant.
7. For booking/contact changes, verify past-date rejection and submit a controlled FormSubmit test request.
8. Merge/deploy only after automated checks and practical checks pass.

## Refactor order

1. Stabilize and clean the contact page. **In progress.**
2. Define stable shared APIs for language and Saudi date state.
3. Extract contact wizard/form logic from `app.js` behind those stable APIs.
4. Audit remaining page-specific `*-fix` files and migrate permanent behavior to owned CSS/JS modules.
5. Split translations by domain only if the maintenance or loading benefit justifies the added module boundaries.
6. Continue page by page; never rebuild the entire site at once without a separate business reason.

## Prohibited maintenance patterns

- Adding a permanent `*-fix.js` file merely to patch another module at runtime.
- Injecting ordinary page CSS from JavaScript.
- Moving permanent DOM sections with JavaScript when source-order HTML can express the intended layout.
- Duplicating language state across modules without one stable source of truth.
- Extracting form logic before tests cover its language, validation, and submission dependencies.
- Making structural refactor commits directly on `main`.
- Treating file-presence checks as a substitute for practical browser testing.

## Definition of done for a refactor slice

A refactor slice is complete only when:

- behavior is intentionally unchanged unless the change request says otherwise;
- JavaScript syntax checks pass;
- smoke tests pass;
- AR/EN/ES behavior is verified for the affected flow;
- mobile and RTL/LTR layout are checked;
- booking/date/submission behavior is checked when applicable;
- no temporary migration workflow or runtime patch remains;
- the diff contains only the intended responsibility change;
- `main` has not been changed until the slice is approved for merge.

## Contact-page architecture after the first cleanup

The contact page now keeps permanent structure in `contact.html`, presentation in `assets/css/contact.css`, and privacy-consent behavior in `assets/js/contact-consent.js`. The former `assets/js/contact-flow-fix.js` runtime patch is intentionally prohibited by the smoke tests from returning.

The next extraction from `app.js` must not start until language access is made explicit and testable, because the contact submission currently depends on the active language state.
