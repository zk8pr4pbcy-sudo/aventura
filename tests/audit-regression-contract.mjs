import fs from "node:fs";
import assert from "node:assert/strict";

function read(path){ return fs.readFileSync(path,"utf8"); }

const contact=read("contact.html");
const corporate=read("corporate.html");
const services=read("services.html");
const collection=read("collection.html");
const translations=read("assets/js/translations.js");
const app=read("assets/js/app.js");
const legal=read("assets/js/legal-content.js");
const privacy=read("privacy.html");
const terms=read("terms.html");
const events=JSON.parse(read("data/curated-events.json"));

const analytics=read("assets/js/analytics.js");
assert.match(analytics,/"private-event": \{items:\[/);
assert.match(analytics,/name:"eventLocation"/);
assert.match(analytics,/name:"eventLevel"/);
assert.match(analytics,/options:\["venue","transport","hospitality","reception","coordination","flowers","photography"\]/);
assert.match(analytics,/"guest-services": \{items:\[/);
assert.match(analytics,/name:"guestService"/);
assert.doesNotMatch(contact,/budget|ميزاني|presupuesto/i);
assert.match(translations,/"contact\.durationHalf": "نصف يوم \(حتى 4 ساعات\)"/);
assert.match(translations,/"contact\.durationFull": "يوم كامل \(حتى 8 ساعات\)"/);
assert.doesNotMatch(translations,/"corporate\.introText": "[^"]*(?:budget|الميزانية|presupuesto)/i);

assert.match(corporate,/href="guest-services\.html#personal-services" data-i18n="corporate\.guestBoutique"/);
assert.doesNotMatch(collection,/Original campaign artwork pending|التصميم الأصلي للبطاقة قيد الإعداد|Diseño original de campaña pendiente/);
assert.doesNotMatch(app,/Marketing card in preparation/);
assert.doesNotMatch(services,/Itineraries, reservations/);
assert.doesNotMatch(translations,/"services\.s1Text": "[^"]*reservations/);

assert.match(privacy,/class="legal-static-fallback"/);
assert.match(privacy,/1\. نطاق هذه السياسة/);
assert.match(terms,/class="legal-static-fallback"/);
assert.match(terms,/1\. القبول والنطاق/);
assert.doesNotMatch(privacy,/Please enable JavaScript to view this policy/);
assert.doesNotMatch(terms,/Please enable JavaScript to view these terms/);

const englishPrivacy=legal.match(/en:\s*\{[\s\S]*?privacy:\s*\{[\s\S]*?identity:\s*(\[[\s\S]*?\]),/);
const spanishPrivacy=legal.match(/es:\s*\{[\s\S]*?privacy:\s*\{[\s\S]*?identity:\s*(\[[\s\S]*?\]),/);
assert.equal(englishPrivacy?.[1].replace(/\s/g,""),"[]");
assert.equal(spanishPrivacy?.[1].replace(/\s/g,""),"[]");

assert.equal(events.lastReviewed,"2026-10-07");
const trade=events.events.find(e=>e.id==="international-trade-exchange-expo-2027");
assert.ok(trade);
assert.equal(trade.startDate,"2027-10-27");
assert.equal(trade.endDate,"2027-10-29");
for(const id of ["meetes-2026","sajex-2026","mass-gatherings-emergency-medicine-2026","saudi-autocare-2026","jewels-of-the-world-jeddah-2026","saudi-maritime-logistics-congress-2026"]){
  assert.equal(events.events.find(e=>e.id===id)?.verification?.checkedOn,"2026-10-07",id+" verification date");
}
for(const file of ["sitemap.xml","sitemap-ar.xml","sitemap-en.xml","sitemap-es.xml"]){
  assert.doesNotMatch(read(file),/2026-09-11/);
  assert.match(read(file),/2026-10-07/);
}
console.log("Audit regression contract checks passed.");
