import fs from 'node:fs';

const appPath = 'assets/js/app.js';
const contactPath = 'contact.html';

let app = fs.readFileSync(appPath, 'utf8');
let contact = fs.readFileSync(contactPath, 'utf8');

const alreadyMigrated =
  !app.includes('FORM_SUBMIT_ENDPOINT') &&
  !app.includes('sendRequestWithFormSubmit') &&
  !app.includes('window.fetch(') &&
  app.includes('submissionTransport.sendEmail(submissionData)') &&
  app.includes('submissionTransport.buildWhatsAppUrl(lastRequestMessage)') &&
  contact.includes('assets/js/contact-submission.js?v=20260910');

if (alreadyMigrated) {
  console.log('Contact submission migration already applied; no changes needed.');
  process.exit(0);
}

function replaceOnce(source, from, to, label) {
  const count = source.split(from).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: expected exactly one match, found ${count}`);
  }
  return source.replace(from, to);
}

app = replaceOnce(
  app,
  '  var FORM_SUBMIT_ENDPOINT = "https://formsubmit.co/ajax/contact@aventuraksa.com";\n',
  '',
  'remove FormSubmit endpoint from app.js'
);

const transportFunction = `    function sendRequestWithFormSubmit(payload) {\n      if (!window.fetch) {\n        return Promise.reject(new Error("Fetch is unavailable"));\n      }\n      return window.fetch(FORM_SUBMIT_ENDPOINT, {\n        method: "POST",\n        headers: { Accept: "application/json" },\n        body: payload\n      }).then(function (response) {\n        return response.json().catch(function () { return {}; }).then(function (body) {\n          if (!response.ok || body.success === false || body.success === "false") {\n            throw new Error("FormSubmit rejected the request");\n          }\n          return body;\n        });\n      });\n    }\n\n`;

app = replaceOnce(app, transportFunction, '', 'remove FormSubmit transport function from app.js');

app = replaceOnce(
  app,
  '    var form = document.querySelector("[data-contact-form]");\n    if (!form) {\n      return;\n    }\n',
  '    var form = document.querySelector("[data-contact-form]");\n    if (!form) {\n      return;\n    }\n    var submissionTransport = window.AVENTURA_CONTACT_SUBMISSION;\n',
  'bind contact submission transport in setupContactForm'
);

app = replaceOnce(
  app,
  '        sendRequestWithFormSubmit(submissionData).then(function () {',
  '        if (!submissionTransport || typeof submissionTransport.sendEmail !== "function") {\n          if (status) {\n            status.textContent = translate("contact.submitError");\n          }\n          return;\n        }\n        submissionTransport.sendEmail(submissionData).then(function () {',
  'route email submission through contact transport'
);

app = replaceOnce(
  app,
  '      var whatsappUrl = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lastRequestMessage);',
  '      if (!submissionTransport || typeof submissionTransport.buildWhatsAppUrl !== "function") {\n        if (status) {\n          status.textContent = translate("contact.submitError");\n        }\n        return;\n      }\n      var whatsappUrl = submissionTransport.buildWhatsAppUrl(lastRequestMessage);',
  'route WhatsApp URL through contact transport'
);

contact = replaceOnce(
  contact,
  '  <script src="assets/js/contact-request-data.js?v=20260910" defer></script>\n  <script src="assets/js/app.js?v=date-validation-20260830" defer></script>',
  '  <script src="assets/js/contact-request-data.js?v=20260910" defer></script>\n  <script src="assets/js/contact-submission.js?v=20260910" defer></script>\n  <script src="assets/js/app.js?v=date-validation-20260830" defer></script>',
  'load contact submission transport before app.js'
);

fs.writeFileSync(appPath, app);
fs.writeFileSync(contactPath, contact);

const finalApp = fs.readFileSync(appPath, 'utf8');
const finalContact = fs.readFileSync(contactPath, 'utf8');

if (finalApp.includes('FORM_SUBMIT_ENDPOINT') || finalApp.includes('sendRequestWithFormSubmit') || finalApp.includes('window.fetch(')) {
  throw new Error('app.js still owns contact network transport');
}
if (!finalApp.includes('submissionTransport.sendEmail(submissionData)')) {
  throw new Error('app.js is not using submissionTransport.sendEmail');
}
if (!finalApp.includes('submissionTransport.buildWhatsAppUrl(lastRequestMessage)')) {
  throw new Error('app.js is not using submissionTransport.buildWhatsAppUrl');
}
if (!(finalContact.indexOf('contact-submission.js') < finalContact.indexOf('assets/js/app.js'))) {
  throw new Error('contact-submission.js must load before app.js');
}

console.log('Contact submission migration completed successfully.');
