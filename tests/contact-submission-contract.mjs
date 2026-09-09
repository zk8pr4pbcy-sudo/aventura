import fs from 'node:fs';

const contact = fs.readFileSync('contact.html', 'utf8');
const app = fs.readFileSync('assets/js/app.js', 'utf8');
const transport = fs.readFileSync('assets/js/contact-submission.js', 'utf8');
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

const transportRef = 'assets/js/contact-submission.js?v=20260910';
check((contact.split(transportRef).length - 1) === 1, 'contact page loads the submission transport exactly once');
check(contact.indexOf(transportRef) < contact.indexOf('assets/js/app.js'), 'submission transport loads before app.js');

check(transport.includes('var FORM_SUBMIT_ENDPOINT = "https://formsubmit.co/ajax/contact@aventuraksa.com"'), 'transport owns the fixed FormSubmit endpoint');
check(transport.includes('var WHATSAPP_NUMBER = "966555884854"'), 'transport owns the WhatsApp delivery number');
check(transport.includes('function sendEmail(payload)'), 'transport exposes email delivery');
check(transport.includes('window.fetch(FORM_SUBMIT_ENDPOINT'), 'transport owns the network fetch');
check(transport.includes('method: "POST"'), 'transport keeps email submission as POST');
check(transport.includes('headers: { Accept: "application/json" }'), 'transport still requests JSON');
check(transport.includes('!response.ok || body.success === false || body.success === "false"'), 'transport rejects failed FormSubmit responses');
check(transport.includes('function buildWhatsAppUrl(message)'), 'transport owns WhatsApp URL construction');
check(transport.includes('"https://wa.me/" + WHATSAPP_NUMBER'), 'transport builds the same WhatsApp destination');
check(transport.includes('window.AVENTURA_CONTACT_SUBMISSION = Object.freeze'), 'transport exposes a stable frozen API');

check(!app.includes('FORM_SUBMIT_ENDPOINT'), 'app.js no longer owns the FormSubmit endpoint');
check(!app.includes('sendRequestWithFormSubmit'), 'app.js no longer owns FormSubmit transport logic');
check(!app.includes('window.fetch('), 'app.js no longer owns contact network fetch');
check(app.includes('var submissionTransport = window.AVENTURA_CONTACT_SUBMISSION'), 'app.js binds the transport through its public API');
check(app.includes('submissionTransport.sendEmail(submissionData)'), 'app.js delegates email delivery to the transport');
check(app.includes('submissionTransport.buildWhatsAppUrl(lastRequestMessage)'), 'app.js delegates WhatsApp URL construction to the transport');
check(app.includes('submissionData.set("request_reference", requestId)'), 'app.js still owns request reference preparation');
check(app.includes('submissionData.set("request_language", getActiveLanguage())'), 'app.js still owns active language preparation');
check(app.includes('submissionData.set("request_summary", lastRequestMessage)'), 'app.js still owns request summary preparation');
check(app.includes('submissionData.set("_replyto", email)'), 'app.js still owns visitor reply-to preparation');
check(app.includes('showRequestSuccess("email", requestId)'), 'app.js still owns the email success UI');
check(app.includes('status.textContent = translate("contact.submitError")'), 'app.js still owns localized submission errors');
check(app.includes('window.open(whatsappUrl, "_blank", "noopener")'), 'app.js still owns the safe WhatsApp window UI action');

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
