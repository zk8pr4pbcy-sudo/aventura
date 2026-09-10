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

const fixture = {
  version: 'test',
  windowDays: 10,
  ui: {
    ar: { eyebrow: 'AVENTURA CURATED CALENDAR', title: 'مختارات أفنتورا في جدة', description: 'فعاليات مختارة', planLabel: 'اقتراح أفنتورا', cta: 'نسّق تجربتك حول الفعالية', details: 'تفاصيل الفعالية', previous: 'الفعالية السابقة', next: 'الفعالية التالية', disclaimer: 'تنسيق حسب الطلب والتوفر.' },
    en: { eyebrow: 'AVENTURA CURATED CALENDAR', title: 'Aventura picks in Jeddah', description: 'Selected events', planLabel: 'Aventura suggests', cta: 'Plan your experience around this event', details: 'Event details', previous: 'Previous event', next: 'Next event', disclaimer: 'Subject to request and availability.' },
    es: { eyebrow: 'AVENTURA CURATED CALENDAR', title: 'Selección de Aventura en Yeda', description: 'Eventos seleccionados', planLabel: 'Aventura propone', cta: 'Organiza tu experiencia alrededor del evento', details: 'Detalles del evento', previous: 'Evento anterior', next: 'Evento siguiente', disclaimer: 'Sujeto a solicitud y disponibilidad.' }
  },
  events: [
    {
      id: 'fixture-one', active: true, priority: 1,
      startDate: saudiDateOffset(2), endDate: saudiDateOffset(2),
      title: { ar: 'فعالية اختبار أولى', en: 'First test event', es: 'Primer evento de prueba' },
      category: { ar: 'أعمال', en: 'Business', es: 'Negocios' },
      location: { ar: 'جدة', en: 'Jeddah', es: 'Yeda' },
      aventuraPlan: { ar: 'تنقل خاص وعشاء.', en: 'Private transport and dinner.', es: 'Transporte privado y cena.' },
      image: 'assets/images/event-corporate.webp',
      imageAlt: { ar: 'صورة اختبار', en: 'Test image', es: 'Imagen de prueba' },
      sourceUrl: 'https://example.com/event-one'
    },
    {
      id: 'fixture-two', active: true, priority: 2,
      startDate: saudiDateOffset(7), endDate: saudiDateOffset(7),
      title: { ar: 'فعالية اختبار ثانية', en: 'Second test event', es: 'Segundo evento de prueba' },
      category: { ar: 'ثقافة', en: 'Culture', es: 'Cultura' },
      location: { ar: 'جدة التاريخية', en: 'Historic Jeddah', es: 'Yeda Histórica' },
      aventuraPlan: { ar: 'جولة وعشاء ونقل.', en: 'Tour, dinner and transport.', es: 'Visita, cena y transporte.' },
      image: 'assets/images/experience-historic.webp',
      imageAlt: { ar: 'جدة التاريخية', en: 'Historic Jeddah', es: 'Yeda Histórica' },
      sourceUrl: 'https://example.com/event-two'
    },
    {
      id: 'outside-window', active: true, priority: 3,
      startDate: saudiDateOffset(11), endDate: saudiDateOffset(11),
      title: { ar: 'خارج النطاق', en: 'Outside window', es: 'Fuera del rango' },
      category: { ar: 'اختبار', en: 'Test', es: 'Prueba' },
      location: { ar: 'جدة', en: 'Jeddah', es: 'Yeda' },
      aventuraPlan: { ar: 'لا يظهر.', en: 'Should not appear.', es: 'No debe aparecer.' },
      image: 'assets/images/hero-jeddah.webp',
      imageAlt: { ar: 'اختبار', en: 'Test', es: 'Prueba' },
      sourceUrl: 'https://example.com/outside'
    }
  ]
};

const browser = await chromium.launch({ headless: true });

try {
  const cases = [
    { lang: 'ar', query: '', title: 'مختارات أفنتورا في جدة', dir: 'rtl' },
    { lang: 'en', query: '?lang=en', title: 'Aventura picks in Jeddah', dir: 'ltr' },
    { lang: 'es', query: '?lang=es', title: 'Selección de Aventura en Yeda', dir: 'ltr' }
  ];

  for (const testCase of cases) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.route('**/data/curated-events.json', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(fixture)
    }));

    await page.goto(`${baseUrl}/index.html${testCase.query}`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-curated-calendar]').waitFor({ state: 'visible' });

    check(pageErrors.length === 0, `${testCase.lang}: no uncaught JavaScript errors`);
    check(await page.locator('html').getAttribute('dir') === testCase.dir, `${testCase.lang}: page direction stays correct`);
    check((await page.locator('[data-curated-ui="title"]').textContent() || '').trim() === testCase.title, `${testCase.lang}: section title is localized`);
    check(await page.locator('.curated-card').count() === 2, `${testCase.lang}: only events inside the 10-day window render`);
    check(await page.locator('[data-curated-event="outside-window"]').count() === 0, `${testCase.lang}: outside-window event stays hidden`);

    const firstCard = page.locator('.curated-card').first();
    check(await firstCard.isVisible(), `${testCase.lang}: first card is visible on mobile`);
    const box = await firstCard.boundingBox();
    check(Boolean(box && box.width < 390), `${testCase.lang}: mobile card leaves room to signal horizontal browsing`);
    check((await firstCard.locator('.curated-card__cta').getAttribute('href') || '').includes('source=curated-calendar'), `${testCase.lang}: CTA carries Curated Calendar request context`);
    check(await firstCard.locator('.curated-card__source').getAttribute('target') === '_blank', `${testCase.lang}: event details open separately`);

    await page.close();
  }

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await desktop.route('**/data/curated-events.json', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixture) }));
  await desktop.goto(`${baseUrl}/index.html?lang=en`, { waitUntil: 'domcontentloaded' });
  await desktop.locator('[data-curated-calendar]').waitFor({ state: 'visible' });
  const desktopCard = await desktop.locator('.curated-card').first().boundingBox();
  check(Boolean(desktopCard && desktopCard.width < 400), 'desktop: cards use a compact carousel width');

  await desktop.locator('[data-language="ar"]').first().click();
  await desktop.waitForFunction(() => document.documentElement.lang === 'ar');
  await desktop.waitForFunction(() => document.querySelector('[data-curated-ui="title"]')?.textContent?.includes('مختارات أفنتورا'));
  check((await desktop.locator('[data-curated-ui="title"]').textContent() || '').includes('مختارات أفنتورا'), 'live language switch rerenders Curated Calendar content');
  await desktop.close();
} finally {
  await browser.close();
}

if (failures) {
  console.error(`\n${failures} Curated Calendar browser check(s) failed.`);
  process.exit(1);
}

console.log('\nAll Curated Calendar browser checks passed.');
