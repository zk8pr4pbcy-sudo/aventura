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
const experienceCopyOverrides = read('assets/js/experience-copy-overrides.js');
const boutiqueLastLight = read('assets/js/boutique-last-light.js');
const boutiqueNavigation = read('assets/js/boutique-navigation.js');
const fragranceCards = read('assets/js/fragrance-cards.js');
const prelaunchStyles = read('assets/css/prelaunch-visual-fixes.css');
const jsDirectory = path.join(root, 'assets/js');
const legacyFixFiles = fs.readdirSync(jsDirectory).filter((name) => /-fix\.js$/i.test(name));
const legacyContactPatchPath = path.join(root, 'assets/js/contact-flow-fix.js');
const legacyLaunchRecoveryPath = path.join(root, 'assets/js/launch-v2-recovery.js');
const desertLastLightScriptPath = path.join(root, 'assets/js/prelaunch-desert-last-light.js');

console.log('\nAventura maintenance smoke checks\n');

// Language runtime: protects the exact dependency that can break when app.js is split.
check(app.includes('var currentLanguage = DEFAULT_LANGUAGE;'), 'language state is defined in the application runtime');
check(app.includes('currentLanguage = language;'), 'language state is updated when the visitor changes language');
check(app.includes('submissionData.set("request_language", getActiveLanguage());'), 'contact submission receives the active language explicitly');

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

// Recovery architecture: the legacy launch recovery runtime is gone and its responsibilities are isolated.
check(!fs.existsSync(legacyLaunchRecoveryPath), 'legacy launch recovery runtime has been removed');
check(collection.includes('assets/js/experience-copy-overrides.js?v=20260910'), 'collection loads the focused experience copy module');
check(collection.includes('assets/js/boutique-last-light.js?v=20260910'), 'collection loads the focused Last Light module');
check(collection.includes('assets/js/boutique-navigation.js?v=20260910'), 'collection loads the focused boutique navigation module');
check(includesInOrder(collection, 'assets/js/experience-copy-overrides.js?v=20260910', 'assets/js/boutique-last-light.js?v=20260910'), 'collection loads copy overrides before Last Light behavior');
check(includesInOrder(collection, 'assets/js/boutique-last-light.js?v=20260910', 'assets/js/boutique-navigation.js?v=20260910'), 'collection loads Last Light behavior before boutique navigation');
check(!boutiqueLastLight.includes('createElement("style")') && !boutiqueLastLight.includes("createElement('style')"), 'Last Light module does not inject runtime CSS');
check(collection.includes('<article class="perfume-card perfume-card-pending prelaunch-last-light-card" data-prelaunch-last-light'), 'Last Light card is owned by static collection HTML');
check(!boutiqueLastLight.includes('createElement('), 'Last Light module no longer creates DOM nodes');
check(boutiqueLastLight.includes('card.hidden = !show;'), 'Last Light module only synchronizes filter visibility');
check(boutiqueNavigation.includes('scrollIntoView'), 'boutique navigation module owns result focus behavior');
check(experienceCopyOverrides.includes('world.historic.step1Title'), 'experience copy overrides remain isolated from boutique behavior');
check(!fs.existsSync(desertLastLightScriptPath), 'obsolete desert Last Light injector has been removed');
check(!desert.includes('prelaunch-desert-last-light.js'), 'desert page does not load the obsolete Last Light injector');
check(!desert.includes('prelaunch-last-light-section'), 'desert HTML does not contain the obsolete Last Light section');
check(desert.includes('assets/js/fragrance-cards.js'), 'desert page loads the active fragrance cards module');
check(fragranceCards.includes('desert: ['), 'fragrance cards module defines the desert fragrance inventory');
check(fragranceCards.includes('{ id: "last-light", name: "Last Light"'), 'fragrance cards module owns the Last Light product card');
check(fragranceCards.includes('document.querySelectorAll(".prelaunch-last-light-section")'), 'fragrance cards module explicitly removes obsolete Last Light UI');
check(prelaunchStyles.includes('.prelaunch-last-light-card'), 'boutique Last Light styling remains in CSS while the card is still runtime-created');

// Maintenance architecture: do not reintroduce one-off runtime patch scripts.
check(legacyFixFiles.length === 0, `no permanent *-fix.js runtime patches remain${legacyFixFiles.length ? ` (${legacyFixFiles.join(', ')})` : ''}`);
check(!partners.includes('partners-copy-fix.js'), 'partners page has no copy patch script');

// Every root HTML page must be free of the legacy recovery runtime; pages that load app.js must load translations first.
for (const file of fs.readdirSync(root).filter((name) => name.endsWith('.html'))) {
  const html = read(file);
  check(!html.includes('assets/js/launch-v2-recovery.js'), `${file}: legacy launch recovery reference is absent`);
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
