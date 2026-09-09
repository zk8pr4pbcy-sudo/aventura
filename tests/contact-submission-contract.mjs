import fs from 'node:fs';

const app = fs.readFileSync('assets/js/app.js', 'utf8');
const wizard = fs.readFileSync('assets/js/contact-wizard.js', 'utf8');
const requestData = fs.readFileSync('assets/js/contact-request-data.js', 'utf8');

let failures = 0;
function check(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
  } else {
    failures += 1;
    console.error(`✗ ${message}`);
  }
}

check(app.includes('var FORM_SUBMIT_ENDPOINT = "https://formsubmit.co/ajax/contact@aventuraksa.com"'), 'FormSubmit endpoint remains explicit in app.js');
check(app.includes('function sendRequestWithFormSubmit(payload)'), 'FormSubmit transport remains in app.js');
check(app.includes('window.fetch(FORM_SUBMIT_ENDPOINT'), 'email submission still uses fetch through the fixed endpoint');
check(app.includes('method: "POST"'), 'email submission remains POST');
check(app.includes('headers: { Accept: "application/json" }'), 'email submission still requests JSON');
check(app.includes('submissionData.set("request_reference", requestId)'), 'request reference is sent');
check(app.includes('submissionData.set("request_language", getActiveLanguage())'), 'active language is sent');
check(app.includes('submissionData.set("request_summary", lastRequestMessage)'), 'request summary is sent');
check(app.includes('submissionData.set("_replyto", email)'), 'reply-to remains the visitor email');
check(app.includes('sendRequestWithFormSubmit(submissionData).then(function ()'), 'success path remains promise-based');
check(app.includes('showRequestSuccess("email", requestId)'), 'email success still uses the request success UI');
check(app.includes('status.textContent = translate("contact.submitError")'), 'email failure still exposes the localized error state');
check(app.includes('var whatsappUrl = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lastRequestMessage)'), 'WhatsApp remains a separate client-side path');
check(app.includes('window.open(whatsappUrl, "_blank", "noopener")'), 'WhatsApp still opens safely in a new tab');

for (const [name, source] of [['contact-wizard.js', wizard], ['contact-request-data.js', requestData]]) {
  check(!/\bfetch\s*\(/.test(source), `${name} does not own network fetch`);
  check(!source.includes('FORM_SUBMIT_ENDPOINT'), `${name} does not own the FormSubmit endpoint`);
  check(!source.includes('wa.me'), `${name} does not own WhatsApp delivery`);
  check(!source.includes('window.open('), `${name} does not open delivery destinations`);
}

if (failures) {
  console.error(`\n${failures} contact submission contract check(s) failed.`);
  process.exit(1);
}

console.log('\nAll contact submission contract checks passed.');
