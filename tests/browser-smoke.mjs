import { chromium } from 'playwright';

const baseUrl = process.env.AVENTURA_TEST_BASE_URL || 'http://127.0.0.1:4173';
let failures = 0;

function pass(message) {
  console.log(`✓ ${message}`);
}

function fail(message) {
  failures += 1;
  console.error(`✗ ${message}`);
}

function check(condition, message) {
  condition ? pass(message) : fail(message);
}

function saudiDateOffset(days) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const utc = new Date(`${values.year}-${values.month}-${values.day}T00:00:00Z`);
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

async function openChecked(browser, path, label) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('load').catch(() => {});
  await page.waitForTimeout(250);
  check(pageErrors.length === 0, `${label}: no uncaught JavaScript errors${pageErrors.length ? ` (${pageErrors.join(' | ')})` : ''}`);
  return { page, pageErrors };
}

const browser = await chromium.launch({ headless: true });

try {
  const languageCases = [
    { lang: 'ar', dir: 'rtl', query: '' },
    { lang: 'en', dir: 'ltr', query: '?lang=en' },
    { lang: 'es', dir: 'ltr', query: '?lang=es' }
  ];

  for (const { lang, dir, query } of languageCases) {
    const { page } = await openChecked(browser, `/contact.html${query}`, `contact ${lang}`);
    check(await page.locator('html').getAttribute('lang') === lang, `contact ${lang}: html lang is correct`);
    check(await page.locator('html').getAttribute('dir') === dir, `contact ${lang}: text direction is correct`);
    check(await page.locator('[data-contact-form]').isVisible(), `contact ${lang}: request form is visible`);
    check(await page.locator('[name="privacy_consent"]').count() === 1, `contact ${lang}: one privacy checkbox exists`);

    const consentCopy = page.locator(`[data-consent-lang="${lang}"]`);
    check(
      await consentCopy.evaluate((element) => getComputedStyle(element).display !== 'none'),
      `contact ${lang}: matching privacy copy is selected by CSS`
    );

    const hiddenConsentCopies = await page.locator(`[data-consent-lang]:not([data-consent-lang="${lang}"])`).evaluateAll((elements) =>
      elements.every((element) => getComputedStyle(element).display === 'none')
    );
    check(hiddenConsentCopies, `contact ${lang}: non-matching privacy copies stay hidden`);

    const date = page.locator('#date');
    const today = saudiDateOffset(0);
    const yesterday = saudiDateOffset(-1);
    const tomorrow = saudiDateOffset(1);
    check(await date.getAttribute('min') === today, `contact ${lang}: date minimum matches Saudi date`);
    await date.fill(yesterday);
    check(await date.evaluate((element) => !element.checkValidity()), `contact ${lang}: browser rejects a past date`);
    await date.fill(tomorrow);
    check(await date.evaluate((element) => element.checkValidity()), `contact ${lang}: browser accepts a future date`);

    await page.close();
  }

  const { page: switcher } = await openChecked(browser, '/contact.html', 'contact language switcher');
  await switcher.locator('[data-language="en"]').first().click();
  await switcher.waitForFunction(() => document.documentElement.lang === 'en');
  check(await switcher.locator('html').getAttribute('dir') === 'ltr', 'language switcher: Arabic → English updates direction');
  await switcher.locator('[data-language="es"]').first().click();
  await switcher.waitForFunction(() => document.documentElement.lang === 'es');
  check(await switcher.locator('html').getAttribute('dir') === 'ltr', 'language switcher: English → Spanish remains LTR');
  await switcher.locator('[data-language="ar"]').first().click();
  await switcher.waitForFunction(() => document.documentElement.lang === 'ar');
  check(await switcher.locator('html').getAttribute('dir') === 'rtl', 'language switcher: Spanish → Arabic restores RTL');
  await switcher.close();

  for (const { lang, query } of languageCases) {
    const { page } = await openChecked(browser, `/index.html${query}`, `home ${lang}`);
    check(await page.locator('html').getAttribute('lang') === lang, `home ${lang}: language initializes correctly`);
    check((await page.title()).trim().length > 0, `home ${lang}: localized title is present`);
    await page.close();
  }
} finally {
  await browser.close();
}

if (failures) {
  console.error(`\n${failures} browser smoke check(s) failed.`);
  process.exit(1);
}

console.log('\nAll Aventura browser smoke checks passed.');
