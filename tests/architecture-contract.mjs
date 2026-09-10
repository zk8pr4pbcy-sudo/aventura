import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failures = 0;

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function check(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    return;
  }
  failures += 1;
  console.error(`✗ ${message}`);
}

console.log('\nAventura architecture contract\n');

const appPath = 'assets/js/app.js';
const revealPath = 'assets/js/reveal-runtime.js';
const submissionPath = 'assets/js/contact-submission.js';
const architectureDocPath = 'docs/ARCHITECTURE.md';
const maintenanceDocPath = 'docs/MAINTENANCE.md';

for (const requiredPath of [appPath, revealPath, submissionPath, architectureDocPath, maintenanceDocPath]) {
  check(fs.existsSync(path.join(root, requiredPath)), `${requiredPath} exists`);
}

const app = read(appPath);
const reveal = read(revealPath);
const submission = read(submissionPath);
const architecture = read(architectureDocPath);

const jsDirectory = path.join(root, 'assets/js');
const jsFiles = fs.readdirSync(jsDirectory).filter((name) => name.endsWith('.js'));
const fixRuntimeFiles = jsFiles.filter((name) => /-fix\.js$/i.test(name));
const recoveryRuntimeFiles = jsFiles.filter((name) => /recovery/i.test(name));

check(
  fixRuntimeFiles.length === 0,
  `no permanent *-fix.js runtimes exist${fixRuntimeFiles.length ? ` (${fixRuntimeFiles.join(', ')})` : ''}`
);
check(
  recoveryRuntimeFiles.length === 0,
  `no recovery JavaScript runtimes exist${recoveryRuntimeFiles.length ? ` (${recoveryRuntimeFiles.join(', ')})` : ''}`
);

const htmlFiles = fs.readdirSync(root).filter((name) => name.endsWith('.html'));
for (const file of htmlFiles) {
  const html = read(file);
  check(!/assets\/js\/[^"']*-fix\.js/i.test(html), `${file}: no *-fix.js runtime reference`);
  check(!/assets\/js\/[^"']*recovery[^"']*\.js/i.test(html), `${file}: no recovery runtime reference`);
}

// FormSubmit transport is owned by contact-submission.js, never app.js.
check(submission.includes('FORM_SUBMIT_ENDPOINT'), 'contact-submission.js owns the FormSubmit endpoint constant');
check(submission.includes('formsubmit.co'), 'contact-submission.js owns the FormSubmit destination');
check(submission.includes('window.AVENTURA_CONTACT_SUBMISSION'), 'contact-submission.js exposes the submission runtime API');
check(!app.includes('FORM_SUBMIT_ENDPOINT'), 'app.js does not own the FormSubmit endpoint constant');
check(!app.includes('formsubmit.co'), 'app.js does not own the FormSubmit destination');
check(!app.includes('sendRequestWithFormSubmit'), 'app.js does not reintroduce legacy FormSubmit transport');
check(app.includes('window.AVENTURA_CONTACT_SUBMISSION'), 'app.js delegates contact delivery through the submission runtime');

// Reveal observer is owned by reveal-runtime.js, never app.js.
check(reveal.includes('IntersectionObserver'), 'reveal-runtime.js owns IntersectionObserver behavior');
check(reveal.includes('window.AVENTURA_REVEAL'), 'reveal-runtime.js exposes the reveal runtime API');
check(!app.includes('IntersectionObserver'), 'app.js does not own IntersectionObserver behavior');
check(app.includes('window.AVENTURA_REVEAL'), 'app.js delegates reveal setup through the reveal runtime');

// Architecture decisions must remain documented, including the intentional boutique boundary.
check(architecture.includes('The boutique code is intentionally not being split'), 'architecture documents the intentional boutique boundary');
check(architecture.includes('FormSubmit transport must not return to `app.js`'), 'architecture documents FormSubmit ownership');
check(architecture.includes('`IntersectionObserver` ownership in `assets/js/app.js`'), 'architecture documents reveal ownership');
check(architecture.includes('Do not reopen a general refactor simply because a file is large.'), 'architecture closes size-only refactoring');

if (failures) {
  console.error(`\n${failures} architecture contract check(s) failed.`);
  process.exit(1);
}

console.log('\nAventura architecture contract passed.');
