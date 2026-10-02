import assert from "node:assert/strict";
import fs from "node:fs";

const wizard = fs.readFileSync("assets/js/contact-wizard.js", "utf8");
const app = fs.readFileSync("assets/js/app.js", "utf8");
const contact = fs.readFileSync("contact.html", "utf8");
const translations = fs.readFileSync("assets/js/translations.js", "utf8");

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


assert.match(contact, /data-request-details="event"/, "contact form must include conditional event details");
assert.match(contact, /name="eventOccasion"[^>]*required/, "event occasion type must be required when the event block is active");
assert.match(contact, /name="eventVenueStatus"[^>]*required/, "event venue status must be required when the event block is active");
assert.doesNotMatch(contact, /name="[^"]*budget[^"]*"/i, "event request flow must not ask for a budget");
assert.match(translations, /"contact\.typeEvent": "فعالية أو مناسبة خاصة"/, "Arabic event label must include private occasions");
assert.match(translations, /"contact\.durationHalf": "نصف يوم — حتى 4 ساعات"/, "Arabic half-day definition must be explicit");
assert.match(translations, /"contact\.durationFull": "يوم كامل — حتى 8 ساعات"/, "Arabic full-day definition must be explicit");
assert.doesNotMatch(translations, /"contact\.event[^"]*":\s*"[^"]*ديكور[^"]*"/, "event-specific Arabic copy must not use the broad decor label");
assert.match(app, /var\s+showEvent\s*=\s*groupName\s*===\s*"event"/, "app.js must reveal event details only for event requests");

console.log("Contact wizard contract checks passed");
