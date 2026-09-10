# Aventura SEO maintenance guide

Last reviewed: 2026-09-11

## Purpose

This document defines who owns Aventura's search-engine metadata and how to maintain it without reintroducing duplicated SEO behavior.

## Phase-one ownership

Aventura currently keeps the existing multilingual URL strategy:

- Arabic: canonical URLs without a language query parameter.
- English: the same page path with `?lang=en`.
- Spanish: the same page path with `?lang=es`.

Do not migrate these URLs to `/en/` or `/es/` as an ad-hoc maintenance change. A future language-URL migration must be handled as a separate project with redirects, canonical/hreflang changes, sitemap changes and Search Console validation.

### Static HTML owns

Each indexable HTML page owns its crawlable baseline:

- one page title;
- one meta description;
- a canonical link;
- Arabic/English/Spanish/x-default hreflang links where applicable;
- Open Graph and Twitter metadata;
- its static JSON-LD structured data.

Static JSON-LD is the single structured-data source of truth. Do not add a second runtime-generated JSON-LD graph for the same page.

### `assets/js/seo-runtime.js` owns

The focused SEO runtime owns metadata that must follow the visitor's active language without changing the current URL architecture:

- translated document title;
- translated meta description;
- canonical URL for the active language;
- hreflang links for indexable pages;
- Open Graph title, description, URL and locale;
- Twitter title and description;
- expanded robots preview directives on indexable pages.

It must never turn a `noindex` route into an indexable page.

### `assets/js/ga4.js` does not own SEO

`ga4.js` keeps analytics, analytics consent and existing launch compatibility behavior. It only bootstraps `seo-runtime.js` so the phase-one change does not require touching every HTML entry point at once.

Do not add canonical, hreflang, robots or structured-data generation back into `ga4.js`.

## Noindex routes

The following routes are intentionally excluded from search indexing:

- `404.html`
- `event-request/`

Both keep static `noindex, follow` directives. `seo-runtime.js` explicitly preserves that state. Neither route belongs in a sitemap.

If another private, temporary, transactional or utility page is added later, decide explicitly whether it should be indexed before adding it to a sitemap.

## Sitemaps

Files:

- `sitemap.xml` — sitemap index.
- `sitemap-ar.xml` — Arabic/default URLs.
- `sitemap-en.xml` — English query-parameter URLs.
- `sitemap-es.xml` — Spanish query-parameter URLs.

`robots.txt` advertises `https://aventuraksa.com/sitemap.xml`.

### `lastmod`

Use `lastmod` only when a page has received a meaningful change that a search engine should recrawl, such as substantive content, structured data, important links or major metadata. Do not change dates merely to make a page appear fresh.

The phase-one SEO release refreshes the current sitemap set to `2026-09-11` because the public site received material content, navigation, event-flow and metadata changes after the previous `2026-08-11` sitemap snapshot.

## Structured data

Keep one intentional static JSON-LD definition per public page unless a page genuinely needs several non-duplicative schema blocks. Avoid maintaining the same Organization/WebPage information from both HTML and JavaScript.

Aventura must not be described as a travel agency. The public homepage currently uses event-planning / organization semantics and this distinction remains protected by Site Quality validation.

## Before merging an SEO change

Run:

```bash
node --check assets/js/seo-runtime.js
node --check assets/js/ga4.js
node tests/seo-contract.mjs
node scripts/validate-site.mjs
```

Also allow the normal repository CI and browser/maintenance checks to complete.

For changes to a title, description, canonical, language behavior or structured data, inspect at least the homepage, one experience page, `contact.html`, `404.html` and `event-request/`.

## After deployment

1. Confirm the GitHub Pages deployment completed on the merged `main` SHA.
2. Open the live `robots.txt` and `sitemap.xml` and confirm the new versions are served.
3. In Google Search Console, resubmit or re-read the sitemap if needed.
4. Use URL Inspection on the homepage and the most commercially important changed pages, then request indexing when appropriate.
5. Monitor Indexing, Search results, impressions, queries, clicks and canonical-selection warnings over the following days and weeks.

Search Console submission does not guarantee ranking or immediate indexing; it only helps Google discover and recrawl the URLs.

## Phase two — not part of this release

A later multilingual SEO project may move English and Spanish to dedicated URL paths such as `/en/` and `/es/`, and may also render language-specific HTML directly rather than relying on client-side translation for the body copy.

That project must preserve existing indexed URLs through a planned migration. Do not implement it during unrelated maintenance.
