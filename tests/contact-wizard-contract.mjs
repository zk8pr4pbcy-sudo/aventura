import assert from "node:assert/strict";
import fs from "node:fs";

const wizard = fs.readFileSync("assets/js/contact-wizard.js", "utf8");
const app = fs.readFileSync("assets/js/app.js", "utf8");
const contact = fs.readFileSync("contact.html", "utf8");
const translations = fs.readFileSync("assets/js/translations.js", "utf8");
const analytics = fs.readFileSync("assets/js/analytics.js", "utf8");

assert.match(wizard, /AVENTURA_CONTACT_WIZARD/, "wizard module must expose a stable global API");
assert.match(wizard, /setup:\s*setup/, "wizard module must expose setup");
assert.doesNotMatch(wizard, /fetch\s*\(/, "wizard module must not own network submission");
assert.doesNotMatch(wizard, /FORM_SUBMIT_ENDPOINT/, "wizard module must not own FormSubmit");
assert.doesNotMatch(wizard, /wa\.me|WHATSAPP_NUMBER/, "wizard module must not own WhatsApp submission");

// These assertions become active after migration and prevent wizard logic drifting back into app.js.
if (/assets\/js\/contact-wizard\.js/.test(contact)) {
  assert.match(app, /AVENTURA_CONTACT_WIZARD/, "app.js must call the wizard module");
  assert.doesNotMatch(app, /function\s+setupContactWizard\s*\(/, "app.js must not keep a duplicate wizard implementation");
  assert.match(contact, /assets\/js\/contact-wizard\.js(?:\?[^"']*)?["']\s+defer><\/script>/, "contact page must load the wizard module");
}


assert.doesNotMatch(contact, /data-request-details="event"/, "event intake must not duplicate the existing dynamic request engine");
assert.doesNotMatch(contact + analytics, /name=["'][^"']*budget[^"']*["']/i, "event request flow must not ask for a budget");
assert.match(translations, /"contact\.typeEvent": "فعالية أو مناسبة خاصة"/, "Arabic event label must include private occasions");
assert.match(translations, /"contact\.durationHalf": "نصف يوم — حتى 4 ساعات"/, "Arabic half-day definition must be explicit");
assert.match(translations, /"contact\.durationFull": "يوم كامل — حتى 8 ساعات"/, "Arabic full-day definition must be explicit");
assert.match(analytics, /\["private-event", "فعالية أو مناسبة خاصة"\]/, "dynamic request types must expose the Arabic private occasion path");
assert.match(analytics, /name:"eventType"[\s\S]*required:true/, "occasion type must be required in the dynamic private-event flow");
assert.match(analytics, /name:"eventLocationStatus"[\s\S]*required:true/, "venue status must be required in the dynamic private-event flow");
assert.match(analytics, /eventServices:"ما الذي ترغب أن تتولاه أفنتورا\؟"/, "event services must use a concrete Aventura scope prompt");
assert.match(analytics, /eventSetup:"تجهيز الموقع وترتيب المساحات"/, "event setup must be described specifically");
assert.doesNotMatch(analytics, /ديكور/, "private-event copy must not use the broad decor label");

console.log("Contact wizard contract checks passed");
