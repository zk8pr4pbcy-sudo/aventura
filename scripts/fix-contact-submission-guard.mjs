import fs from 'node:fs';

const appPath = 'assets/js/app.js';
let app = fs.readFileSync(appPath, 'utf8');

const before = `        isSubmitting = true;\n        setContactSubmitting(true);\n        if (!submissionTransport || typeof submissionTransport.sendEmail !== "function") {\n          if (status) {\n            status.textContent = translate("contact.submitError");\n          }\n          return;\n        }\n        submissionTransport.sendEmail(submissionData).then(function () {`;

const after = `        if (!submissionTransport || typeof submissionTransport.sendEmail !== "function") {\n          if (status) {\n            status.textContent = translate("contact.submitError");\n          }\n          return;\n        }\n        isSubmitting = true;\n        setContactSubmitting(true);\n        submissionTransport.sendEmail(submissionData).then(function () {`;

if (app.includes(after)) {
  console.log('Contact submission guard already fixed; no changes needed.');
  process.exit(0);
}

const count = app.split(before).length - 1;
if (count !== 1) {
  throw new Error(`Expected exactly one email submission guard block, found ${count}`);
}

app = app.replace(before, after);
fs.writeFileSync(appPath, app);

const finalApp = fs.readFileSync(appPath, 'utf8');
if (!finalApp.includes(after)) {
  throw new Error('Contact submission guard was not moved before busy state');
}

console.log('Contact submission guard fixed successfully.');
