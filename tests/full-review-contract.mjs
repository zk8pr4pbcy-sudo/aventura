import fs from "node:fs";
import assert from "node:assert/strict";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

const collection = read("collection.html");
const app = read("assets/js/app.js");
const corporate = read("corporate.html");
const services = read("services.html");
const guestServices = read("guest-services.html");
const contact = read("contact.html");
const requestData = read("assets/js/contact-request-data.js");
const legal = read("assets/js/legal-content.js");
const privacy = read("privacy.html");
const terms = read("terms.html");
const translations = read("assets/js/translations.js");
const curated = JSON.parse(read("data/curated-events.json"));

assert.ok(!collection.includes("Original campaign artwork pending"));
assert.ok(!app.includes("Marketing card in preparation"));
assert.ok(corporate.includes('href="guest-services.html#personal-services" data-i18n="corporate.guestBoutique"'));
assert.ok(!services.includes("Itineraries, reservations"));
assert.ok(guestServices.includes('data-i18n="guest.thobeNote"'));
assert.ok(services.includes('data-i18n="guest.thobeNote"'));

assert.ok(contact.includes('data-request-details="event"'));
for (const name of ["eventKind","eventLocationStatus","eventLocation","eventLevel","eventServices[]"]) {
  assert.ok(contact.includes('name="'+name+'"'), "missing event field "+name);
}
const eventSlice = contact.slice(contact.indexOf('data-request-details="event"'), contact.indexOf('data-request-details="thobe"'));
assert.ok(!/budget|ميزاني[ةه]|presupuesto/i.test(eventSlice), "event flow must not ask for budget");
assert.ok(contact.includes("Half day (up to 4 hours)"));
assert.ok(contact.includes("Full day (up to 8 hours)"));

assert.ok(app.includes('typeField.value === "service"'));
assert.ok(app.includes('groupName === "event"'));
assert.ok(app.includes("control.disabled = !shouldShow"));
assert.ok(!app.includes('typeField.value === "guest-services"'));
assert.ok(requestData.includes('name="eventServices[]"]') || requestData.includes('[name="eventServices[]"]'));
assert.ok(requestData.includes('"contact.eventServicesLabel"'));

assert.ok(!legal.includes("Data controller: Aventura Event Management Establishment"));
assert.ok(!legal.includes("Responsable del tratamiento: Establecimiento Aventura"));
assert.ok(!privacy.includes("Please enable JavaScript to view this policy"));
assert.ok(!terms.includes("Please enable JavaScript to view these terms"));
assert.ok((privacy.match(/<h2>/g) || []).length >= 8, "privacy fallback must contain the full Arabic document");
assert.ok((terms.match(/<h2>/g) || []).length >= 7, "terms fallback must contain the full Arabic document");

assert.ok(translations.includes('"contact.durationHalf": "نصف يوم (حتى 4 ساعات)"'));
assert.ok(translations.includes('"contact.durationFull": "يوم كامل (حتى 8 ساعات)"'));
assert.ok(translations.includes('"contact.eventDetailsTitle": "تفاصيل الفعالية أو المناسبة الخاصة"'));
assert.ok(!/corporate\.introText[^\n]*(?:budget|ميزاني[ةه]|presupuesto)/i.test(translations));

assert.equal(curated.lastReviewed, "2026-10-07");
const tradeExpo = curated.events.find((event) => event.id === "international-trade-exchange-expo-2027");
assert.ok(tradeExpo, "corrected 2027 trade expo is missing");
assert.equal(tradeExpo.startDate, "2027-10-27");
assert.equal(tradeExpo.endDate, "2027-10-29");
for (const event of curated.events) {
  assert.equal(event.verification?.checkedOn, "2026-10-07", "stale event verification: "+event.id);
}

for (const sitemap of ["sitemap.xml","sitemap-ar.xml","sitemap-en.xml","sitemap-es.xml"]) {
  const source=read(sitemap);
  assert.ok(source.includes("<lastmod>2026-10-07</lastmod>"), sitemap+" has stale lastmod");
  assert.ok(!source.includes("<lastmod>2026-09-11</lastmod>"), sitemap+" still contains old lastmod");
}

console.log("Full site review contract checks passed.");
