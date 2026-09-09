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

function includesInOrder(source, first, second) {
  const firstIndex = source.indexOf(first);
  const secondIndex = source.indexOf(second);
  return firstIndex !== -1 && secondIndex !== -1 && firstIndex < secondIndex;
}

const app = read('assets/js/app.js');
const translations = read('assets/js/translations.js');
const contact = read('contact.html');
const contactPatch = fs.existsSync(path.join(root, 'assets/js/contact-flow-fix.js'))
  ? read('assets/js/contact-flow-fix.js')
  : '';

console.log('\nAventura maintenance smoke checks\n');

// Language runtime: protects the exact dependency that can break when app.js is split.
check(app.includes('var currentLanguage = DEFAULT_LANGUAGE;'), 'language state is defined in the application runtime');
check(app.includes('currentLanguage = language;'), 'language state is updated when the visitor changes language');
check(app.includes('submissionData.set("request_language", currentLanguage);'), 'contact submission receives the active language explicitly');

// Translation coverage.
check(translations.includes('window.AVENTURA_I18N'), 'translation dictionary is exposed');
check(translations.includes('"ar": {'), 'Arabic translations exist');
check(translations.includes('"en": {'), 'English translations exist');
check(translations.includes('"es": {'), 'Spanish translations exist');

// Saudi date protection.
check(app.includes('timeZone: "Asia/Riyadh"'), 'date validation is anchored to Saudi time');
check(app.includes('function setSaudiDateMinimum'), 'date fields receive a minimum allowed date');
check(app.includes('function isPastSaudiDate'), 'past Saudi dates are rejected in JavaScript');
check(app.includes('firstPastTimingField'), 'wizard and final submission share the past-date guard');

// Contact form contract.
check(contact.includes('data-contact-form'), 'contact page exposes the booking form hook');
check(contact.includes('name="request_language"'), 'contact form contains request_language metadata');
check(contact.includes('name="request_reference"'), 'contact form contains a request reference field');
check(contact.includes('https://formsubmit.co/contact@aventuraksa.com'), 'contact form keeps the approved FormSubmit destination');
check(includesInOrder(contact, 'assets/js/translations.js', 'assets/js/app.js'), 'translations load before app.js on the contact page');

// Consent may temporarily live in the legacy patch while it is being migrated.
check(
  contact.includes('name="privacy_consent"') || contactPatch.includes('name = "privacy_consent"') || contactPatch.includes('name="privacy_consent"'),
  'privacy consent is present in either markup or the temporary compatibility layer'
);

// Every root HTML page that loads app.js must load translations first.
for (const file of fs.readdirSync(root).filter((name) => name.endsWith('.html'))) {
  const html = read(file);
  if (!html.includes('assets/js/app.js')) continue;
  check(
    includesInOrder(html, 'assets/js/translations.js', 'assets/js/app.js'),
    `${file}: translations load before app.js`
  );
}

if (failures) {
  console.error(`\n${failures} smoke check(s) failed.`);
  process.exit(1);
}

console.log('\nAll Aventura maintenance smoke checks passed.');
