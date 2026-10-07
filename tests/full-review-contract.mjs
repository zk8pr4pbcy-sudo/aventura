import fs from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

const collection = read("collection.html");
const app = read("assets/js/app.js");
const analytics = read("assets/js/analytics.js");
const corporate = read("corporate.html");
const services = read("services.html");
const guestServices = read("guest-services.html");
const contact = read("contact.html");
const legal = read("assets/js/legal-content.js");
const privacy = read("privacy.html");
const terms = read("terms.html");
const translations = read("assets/js/translations.js");
const curated = JSON.parse(read("data/curated-events.json"));

const scope = { window: {} };
vm.runInNewContext(translations, scope);
for (const lang of ["ar", "en", "es"]) {
  const text = scope.window.AVENTURA_I18N[lang];
  assert.equal(text["services.s7Text"], text["guest.thobeText"], lang + " thobe descriptions must match");
  assert.equal(text["collection.thobeText"], text["guest.thobeText"], lang + " collection thobe description must match");
}
assert.ok(!analytics.includes('vipReservations:"Reservations and hospitality"'));
assert.ok(!analytics.includes('vipReservations:"حجوزات وضيافة"'));
assert.ok(!analytics.includes('vipReservations:"Reservas y hospitalidad"'));

assert.ok(!collection.includes("Original campaign artwork pending"));
assert.ok(!app.includes("Marketing card in preparation"));
assert.ok(corporate.includes('href="guest-services.html#personal-services" data-i18n="corporate.guestBoutique"'));
assert.ok(!services.includes("Itineraries, reservations"));
assert.ok(guestServices.includes('data-i18n="guest.thobeNote"'));
assert.ok(services.includes('data-i18n="guest.thobeNote"'));

assert.ok(!contact.includes('data-request-details="event"'), "event qualification should remain in the dynamic request flow");
assert.ok(contact.includes("Half day (up to 4 hours)"));
assert.ok(contact.includes("Full day (up to 8 hours)"));

assert.ok(app.includes('typeField.value === "guest-services"'), "guest-service details must follow the dynamic request type");
assert.ok(app.includes("control.disabled = !shouldShow"), "hidden detail controls must be disabled");

const privateEventStart = analytics.indexOf('"private-event": {items:[');
const vipStart = analytics.indexOf('"vip-hosting": {items:[', privateEventStart);
assert.ok(privateEventStart >= 0 && vipStart > privateEventStart, "private-event dynamic config is missing");
const privateEventConfig = analytics.slice(privateEventStart, vipStart);
for (const field of ["eventType","eventLocationStatus","eventLocation","eventLevel"]) {
  assert.ok(privateEventConfig.includes('name:"'+field+'"'), "missing private-event field "+field);
}
for (const service of ["venue","hospitality","transport","reception","onsite","flowers"]) {
  assert.ok(privateEventConfig.includes('"'+service+'"'), "missing event service option "+service);
}
assert.ok(privateEventConfig.includes('label:"eventServices"'), "event services need a dedicated label");
assert.ok(!/budget|ميزاني[ةه]|presupuesto/i.test(privateEventConfig), "event flow must not ask for budget");
for (const phrase of ["عيد ميلاد","الموقع أو المنطقة المفضلة","مستوى الخدمة","الخدمات المطلوبة"]) {
  assert.ok(analytics.includes(phrase), "Arabic event qualification copy is missing: "+phrase);
}

assert.ok(!legal.includes("Data controller: Aventura Event Management Establishment"));
assert.ok(!legal.includes("Responsable del tratamiento: Establecimiento Aventura"));
assert.ok(!privacy.includes("Please enable JavaScript to view this policy"));
assert.ok(!terms.includes("Please enable JavaScript to view these terms"));
assert.ok((privacy.match(/<h2>/g) || []).length >= 8, "privacy fallback must contain the full Arabic document");
assert.ok((terms.match(/<h2>/g) || []).length >= 7, "terms fallback must contain the full Arabic document");

assert.ok(translations.includes('"contact.durationHalf": "نصف يوم (حتى 4 ساعات)"'));
assert.ok(translations.includes('"contact.durationFull": "يوم كامل (حتى 8 ساعات)"'));
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
