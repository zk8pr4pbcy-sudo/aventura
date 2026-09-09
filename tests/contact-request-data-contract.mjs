import assert from "node:assert/strict";
import fs from "node:fs";

const moduleSource = fs.readFileSync("assets/js/contact-request-data.js", "utf8");
const appSource = fs.readFileSync("assets/js/app.js", "utf8");
const contactSource = fs.readFileSync("contact.html", "utf8");

assert.match(moduleSource, /AVENTURA_CONTACT_REQUEST_DATA/, "request data module must expose a stable global API");
assert.match(moduleSource, /createRequestId:\s*createRequestId/, "request data module must expose request-id creation");
assert.match(moduleSource, /buildMessage:\s*buildMessage/, "request data module must expose message building");
assert.doesNotMatch(moduleSource, /fetch\s*\(/, "request data module must not own network submission");
assert.doesNotMatch(moduleSource, /FORM_SUBMIT_ENDPOINT/, "request data module must not own FormSubmit");
assert.doesNotMatch(moduleSource, /wa\.me|WHATSAPP_NUMBER/, "request data module must not own WhatsApp delivery");
assert.doesNotMatch(moduleSource, /window\.open\s*\(/, "request data module must not open external delivery channels");

if (/assets\/js\/contact-request-data\.js/.test(contactSource)) {
  assert.match(appSource, /AVENTURA_CONTACT_REQUEST_DATA/, "app.js must delegate request-data construction to the module");
  assert.doesNotMatch(appSource, /var\s+dynamicSummary\s*=\s*\{\}/, "app.js must not keep duplicate dynamic-summary construction");
  assert.doesNotMatch(appSource, /var\s+detailRows\s*=\s*\[/, "app.js must not keep duplicate detail-row construction");
  assert.match(contactSource, /assets\/js\/contact-request-data\.js(?:\?[^"']*)?["'][^>]*><\/script>/, "contact page must load the request-data module");
}

console.log("Contact request data contract checks passed");
