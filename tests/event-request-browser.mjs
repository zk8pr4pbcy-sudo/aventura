import { chromium } from 'playwright';

const baseUrl = process.env.AVENTURA_TEST_BASE_URL || 'http://127.0.0.1:4173';
let failures = 0;

function check(condition, message) {
  if (condition) console.log(`✓ ${message}`);
  else {
    failures += 1;
    console.error(`✗ ${message}`);
  }
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
  const date = new Date(`${values.year}-${values.month}-${values.day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const startDate = saudiDateOffset(2);
const endDate = saudiDateOffset(4);
const fixture = {
  version: 'test',
  windowDays: 10,
  ui: { ar: {}, en: {}, es: {} },
  events: [
    {
      id: 'fixture-event',
      active: true,
      priority: 1,
      startDate,
      endDate,
      title: { ar: 'فعالية اختبار', en: 'Test Event', es: 'Evento de prueba' },
      category: { ar: 'أعمال', en: 'Business', es: 'Negocios' },
      location: { ar: 'جدة سوبر دوم', en: 'Jeddah Superdome', es: 'Jeddah Superdome' },
      aventuraPlan: {
        ar: 'تنقل خاص وعشاء بعد الفعالية.',
        en: 'Private transport and dinner after the event.',
        es: 'Transporte privado y cena después del evento.'
      },
      image: 'assets/images/event-corporate.webp',
      imageAlt: { ar: 'فعالية أعمال', en: 'Business event', es: 'Evento de negocios' },
      sourceUrl: 'https://example.com/event'
    }
  ]
};

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const pageErrors = [];
  let submitCount = 0;
  let submittedPayload = '';

  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.route('**/data/curated-events.json', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(fixture)
  }));
  await page.route('https://formsubmit.co/ajax/contact@aventuraksa.com', async (route) => {
    submitCount += 1;
    submittedPayload = route.request().postData() || '';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true })
    });
  });

  await page.goto(`${baseUrl}/event-request.html?source=curated-calendar&event=fixture-event&lang=en`, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-event-shell]').waitFor({ state: 'visible' });

  check(pageErrors.length === 0, 'event request: no uncaught JavaScript errors');
  check(await page.locator('html').getAttribute('lang') === 'en', 'event request: English query language is applied');
  check(await page.locator('html').getAttribute('dir') === 'ltr', 'event request: English direction is LTR');
  check((await page.locator('[data-event-title]').textContent() || '').trim() === 'Test Event', 'event request: selected event title loads from curated data');
  check((await page.locator('[data-event-location]').textContent() || '').trim() === 'Jeddah Superdome', 'event request: selected event location loads');
  check((await page.locator('#eventRequestDate').getAttribute('min')) === startDate, 'event request: attendance date starts at event start');
  check((await page.locator('#eventRequestDate').getAttribute('max')) === endDate, 'event request: attendance date is capped at event end');
  check((await page.locator('#eventRequestDate').inputValue()) === startDate, 'event request: attendance date is prefilled');
  check(await page.locator('[data-event-request-form]').count() === 1, 'event request: dedicated form exists');
  check(await page.locator('script[src*="contact-wizard"]').count() === 0, 'event request: main contact wizard runtime is not loaded');
  check(await page.locator('script[src*="contact-submission"]').count() === 0, 'event request: main contact submission runtime is not loaded');

  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  check(!mobileOverflow, 'event request: mobile layout has no horizontal overflow');

  await page.locator('#eventRequestName').fill('Test Guest');
  await page.locator('#eventRequestPhone').fill('+966500000000');
  await page.locator('#eventRequestGuests').fill('3');
  await page.locator('input[name="privacy_consent"]').check();
  await page.locator('[data-event-submit]').click();
  await page.locator('[data-event-service-error]').waitFor({ state: 'visible' });
  check(submitCount === 0, 'event request: form does not submit without a selected service');

  await page.locator('[data-event-services] input[value="private_transport"]').check();
  await page.locator('[data-event-submit]').click();
  await page.locator('[data-event-success]').waitFor({ state: 'visible' });
  check(submitCount === 1, 'event request: valid request submits exactly once');
  check(submittedPayload.includes('curated_event'), 'event request: submission identifies curated event request type');
  check(submittedPayload.includes('fixture-event'), 'event request: submission carries event ID');
  check(submittedPayload.includes('private_transport'), 'event request: submission carries selected service code');
  check(page.url().includes('event-request.html'), 'event request: successful AJAX submission stays on dedicated page');

  await page.locator('[data-language="ar"]').first().click();
  await page.waitForFunction(() => document.documentElement.lang === 'ar');
  await page.waitForFunction(() => document.querySelector('[data-event-i18n="title"]')?.textContent?.includes('نسّق تجربتك'));
  check(await page.locator('html').getAttribute('dir') === 'rtl', 'event request: live Arabic switch updates direction to RTL');
  check((await page.locator('[data-event-title]').textContent() || '').trim() === 'فعالية اختبار', 'event request: live Arabic switch rerenders event content');
  await page.close();

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await desktop.route('**/data/curated-events.json', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixture) }));
  await desktop.goto(`${baseUrl}/event-request.html?event=fixture-event&lang=es`, { waitUntil: 'domcontentloaded' });
  await desktop.locator('[data-event-shell]').waitFor({ state: 'visible' });
  const contextBox = await desktop.locator('.event-request-context').boundingBox();
  const formBox = await desktop.locator('.event-request-form-card').boundingBox();
  check(Boolean(contextBox && formBox && Math.abs(contextBox.y - formBox.y) < 8), 'event request: desktop event context and form align side-by-side');
  check((await desktop.locator('[data-event-i18n="formTitle"]').textContent() || '').includes('¿Qué quieres'), 'event request: Spanish form copy renders');
  await desktop.close();

  const unavailable = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await unavailable.route('**/data/curated-events.json', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixture) }));
  await unavailable.goto(`${baseUrl}/event-request.html?event=does-not-exist`, { waitUntil: 'domcontentloaded' });
  await unavailable.locator('[data-event-error]').waitFor({ state: 'visible' });
  check(await unavailable.locator('[data-event-shell]').isHidden(), 'event request: invalid event never exposes the form');
  await unavailable.close();
} finally {
  await browser.close();
}

if (failures) {
  console.error(`\n${failures} Event Request browser check(s) failed.`);
  process.exit(1);
}

console.log('\nAll Event Request browser checks passed.');
