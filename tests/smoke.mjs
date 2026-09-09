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
const partners = read('partners.html');
const collection = read('collection.html');
const desert = read('experience-desert.html');
const contactConsent = read('assets/js/contact-consent.js');
const launchRecovery = read('assets/js/launch-v2-recovery.js');
const desertLastLight = read('assets/js/prelaunch-desert-last-light.js');
const prelaunchStyles = read('assets/css/prelaunch-visual-fixes.css');
const jsDirectory = path.join(root, 'assets/js');
const legacyFixFiles = fs.readdirSync(jsDirectory).filter((name) => /-fix\.js$/i.test(name));
const legacyContactPatchPath = path.join(root, 'assets/js/contact-flow-fix.js');

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
check(translations.includes('"partners.formSideTitle": "Cuéntanos en qué destacas.",'), 'Spanish partner copy lives in translations');

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

// Contact architecture: permanent behavior must live in owned HTML/CSS/JS modules, not runtime patches.
check(contact.includes('assets/css/contact.css?v=20260909'), 'contact page uses its dedicated stylesheet');
check(contact.includes('assets/js/contact-consent.js?v=20260909'), 'contact page uses its dedicated consent module');
check(!fs.existsSync(legacyContactPatchPath), 'legacy contact runtime patch has been removed');
check(!contact.includes('contact-flow-fix.js'), 'contact page has no legacy runtime patch reference');
check(contact.includes('name="privacy_consent"'), 'privacy consent is part of static HTML');
check(contact.includes('name="privacy_consent_at"'), 'privacy consent timestamp field is part of static HTML');
check(includesInOrder(contact, '<form class="form-card"', '<aside class="contact-panel"'), 'contact form precedes the contact panel in source order');
check(contactConsent.includes('privacy_consent'), 'consent module owns consent validation');
check(contactConsent.includes('privacy_consent_at'), 'consent module records the consent timestamp');
check(!contactConsent.includes('createElement("style")') && !contactConsent.includes("createElement('style')"), 'consent module does not inject runtime styles');

// Recovery architecture: CSS belongs in CSS, and desert Last Light has one owner.
check(!launchRecovery.includes('createElement("style")') && !launchRecovery.includes("createElement('style')"), 'launch recovery no longer injects runtime CSS');
check(!launchRecovery.includes('injectDesertLastLight'), 'launch recovery no longer owns desert Last Light injection');
check(!launchRecovery.includes('prelaunch-last-light-section'), 'launch recovery does not manipulate the desert Last Light section');
check(desertLastLight.includes('prelaunch-last-light-section'), 'desert Last Light module owns the desert section');
check(desertLastLight.includes('new MutationObserver'), 'desert Last Light observes the experience-detail readiness signal');
check(desertLastLight.includes('data-experience-request-key'), 'desert Last Light mounts only after app.js marks the experience detail ready');
check(desertLastLight.includes('attributeFilter: ["data-experience-request-key"]'), 'desert Last Light observes only its stable readiness attribute');
check(!desertLastLight.includes('setTimeout(inject'), 'desert Last Light does not depend on a brittle injection timeout');
check(!desertLastLight.includes('queueMicrotask'), 'desert Last Light does not race deferred scripts with a microtask');
check(prelaunchStyles.includes('.prelaunch-last-light-card'), 'Last Light card styling lives in CSS');
check(prelaunchStyles.includes('.prelaunch-last-light-section .detail-product-grid'), 'desert Last Light layout styling lives in CSS');
check(collection.includes('assets/js/launch-v2-recovery.js'), 'boutique keeps the collection recovery module');
check(desert.includes('assets/js/prelaunch-desert-last-light.js'), 'desert page loads its dedicated Last Light module');
check(desert.includes('assets/css/prelaunch-visual-fixes.css'), 'desert page loads the owned Last Light stylesheet');
check(app.includes('root.setAttribute("data-experience-request-key", config.request);'), 'app.js exposes the stable experience-detail readiness marker');

// Maintenance architecture: do not reintroduce one-off runtime patch scripts.
check(legacyFixFiles.length === 0, `no permanent *-fix.js runtime patches remain${legacyFixFiles.length ? ` (${legacyFixFiles.join(', ')})` : ''}`);
check(!partners.includes('partners-copy-fix.js'), 'partners page has no copy patch script');

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
