import assert from "node:assert/strict";
import fs from "node:fs";

const wizard = fs.readFileSync("assets/js/contact-wizard.js", "utf8");
const app = fs.readFileSync("assets/js/app.js", "utf8");
const contact = fs.readFileSync("contact.html", "utf8");

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

console.log("Contact wizard contract checks passed");
