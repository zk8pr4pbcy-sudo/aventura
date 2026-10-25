# Aventura Curated Calendar — source, rights, and publishing rules

Last reviewed: 2026-10-25

## Purpose

This file is the single source-of-truth for the operational rules and verification references behind `data/curated-events.json`. Dated event-pack and review files are retired to avoid duplication and stale information.

## Current publishing scope

Curated-event updates are published **only on the Aventura website as event cards**.

- Do not create, schedule, or publish social-media posts, stories, reels, or event cards as part of this workflow.
- Maya may use this document as a design/reference package only if the user explicitly reactivates social production.
- Salem verifies event name, dates, venue, target audience, registration/ticketing status, and any postponement/cancellation before an event is added or materially updated.
- Expired events are removed from the live JSON after their end date; the Git history remains the archive.

## Image and rights policy

Live website cards use existing repository assets designated Aventura-owned. Their underlying commercial-rights documentation has not been independently audited. Do not introduce new third-party imagery without verified permission.

Existing event-card assets (repository rights designation; independent audit pending):
- `assets/images/gulf-cup-27-jeddah-card.webp` — repository-designated Aventura-owned; independent ownership and license audit pending.
- `assets/images/event-corporate.webp` — repository-designated Aventura-owned; independent ownership and license audit pending.
- `assets/images/event-private.webp` — repository-designated Aventura-owned; independent ownership and license audit pending.

Rules:
1. Do not use random Google Images.
2. Do not reuse organiser logos or event photography unless commercial-use permission is explicitly verified.
3. If a future card uses Pexels, Unsplash, Wikimedia Commons, or another external source, record the exact page URL, creator, license, commercial-use status, and attribution requirement before publishing.
4. Event-site images may be used only when the organiser provides an explicit commercial media license or written permission.

## Publishing rules

1. Write event summaries and Aventura recommendations in Aventura's own words.
2. Keep the Aventura CTA separate from organiser/ticket links.
3. Open external event sources in a new tab and identify them as external links.
4. Aventura must not imply official partnership, event ownership, or ticket resale unless a separate authorised agreement exists.
5. Re-check any event before confirming a paid guest itinerary, even if the website card was previously verified.
6. The live data file should contain only current and future events; Git history is sufficient for past-event traceability.

## Current and future event verification — 25 Oct 2026

The canonical live list is `data/curated-events.json`. The site has a rolling 14-day display window; future records may be retained for planning and will not necessarily appear on the live cards today.

| Event | Dates | Official source | Admission / operational note |
| --- | --- | --- | --- |
| Jeddah International Motor Show | 4–7 Nov 2026 | https://www.int-motorshowjeddah.com/en/visit | Visitor invitation registration open. 4 Nov press/VIP; 5–7 Nov visitor days. Registration does not guarantee access. |
| 17th Saudi General Surgery Society Congress | 6–8 Nov 2026 | https://sgss.org.sa/en/sgss2026/ | Hilton Jeddah; paid registration varies by category and membership. Delegations, speakers and medical executives. |
| Hajj Conference & Exhibition | 8–11 Nov 2026 | https://hajjconfex.transcend.com.sa/ | Jeddah Superdome; free visitor e-badge registration. Ministry source: https://pep.gov.sa/en/news/1031 |
| Jewellery Salon Jeddah | 12–15 Nov 2026 | https://www.jewellerysalon.com/en/ | Benchmark, 16:00–23:00. 2026 visitor registration is not verified; visitor page still references 2025. Riyadh edition postponed, Jeddah dates remain listed. |
| Foodex Saudi | 23–25 Nov 2026 | https://www.foodexsaudiexpo.com/en | 16:00–23:00. Official site uses JIECC and Jeddah Center for Exhibitions and Events naming; confirm exact drop-off/entrance before guest transfers. |
| Saudi Franchise Expo Jeddah | 23–25 Nov 2026 | https://www.saudifranchiseexpo.com/ | Jeddah Center for Exhibitions and Events, 16:00–23:00; free trade visitor registration. |
| International Trade Exchange Expo | 27–29 Oct **2027** | https://jitexpo.com/ | Organiser's 2027 date takes precedence over third-party 2026 listings. Long-range planning only. |

## Excluded or deferred candidates

- Jewels of the World — Jeddah, originally 19–22 Oct 2026: postponed without confirmed replacement; do not restore on old dates.
- Saudi Maritime & Logistics Congress, 21–22 Oct 2026: completed and removed from live data.
- World Trade Expo — Saudi Arabia: official website now says **30 Nov–2 Dec 2027**, despite directories still showing 1–3 Dec 2026. Do not list as a 2026 event. https://wtexpo-sa.com/
- International Port & Marine Development Conference: official organiser currently lists **6–7 Apr 2027**, not 9–10 Nov 2026 as some directories claim. Do not add under the old date. https://portdevelopmentconference.com/
- Jewel of Saudi, 18–20 Dec 2026: official search listings suggest Jeddah Superdome, but live organiser website was inaccessible during this review. Hold until independently rechecked. https://jewelofsaudi.com/

## Content and design handoff

Maya's reference-only package for the new SGSS congress: target medical delegations, visiting speakers, healthcare executives and sponsors; recommended Aventura services are private transfers, reception, after-conference dinner and a Historic Jeddah experience. Use existing `assets/images/event-corporate.webp` provisionally, subject to independent rights audit. No social-media publishing.

## Archive and corrections

Expired or postponed events are removed from the live JSON; Git history preserves earlier versions. Earlier dated source notes were stale, including an incorrect claim that International Trade Exchange Expo was confirmed for October 2026. Always follow the latest organiser page.

## Editorial disclaimer

Arabic:
أفنتورا جهة مستقلة وليست منظمًا للفعالية أو شريكًا رسميًا أو بائعًا للتذاكر، ما لم يُذكر خلاف ذلك. مواعيد الفعالية والدخول والتذاكر تخضع للجهة المنظمة أو منصة التذاكر.

English:
Aventura is an independent service provider and is not the event organiser, an official partner, or the ticket seller unless explicitly stated otherwise. Event schedules, admission and tickets remain subject to the organiser or ticketing platform.

Spanish:
Aventura es un proveedor de servicios independiente y no es el organizador del evento, un socio oficial ni el vendedor de entradas, salvo que se indique expresamente lo contrario. Los horarios, el acceso y las entradas dependen del organizador o de la plataforma de venta.
