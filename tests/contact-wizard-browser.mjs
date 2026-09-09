import { chromium } from 'playwright';

const baseUrl = process.env.AVENTURA_TEST_BASE_URL || 'http://127.0.0.1:4173';
let failures = 0;

function check(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
  } else {
    failures += 1;
    console.error(`✗ ${message}`);
  }
}

const browser = await chromium.launch({ headless: true });

try {
  for (const { lang, query } of [
    { lang: 'ar', query: '' },
    { lang: 'en', query: '?lang=en' },
    { lang: 'es', query: '?lang=es' }
  ]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto(`${baseUrl}/contact.html${query}`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load').catch(() => {});
    await page.waitForTimeout(250);

    check(errors.length === 0, `wizard ${lang}: no uncaught JavaScript errors`);
    check(await page.locator('[data-request-progress]').count() === 3, `wizard ${lang}: three progress steps exist`);
    check(await page.locator('[data-request-step="1"]').isVisible(), `wizard ${lang}: step 1 starts visible`);
    check(await page.locator('[data-request-step="2"]').isHidden(), `wizard ${lang}: step 2 starts hidden`);
    check(await page.locator('[data-request-step="3"]').isHidden(), `wizard ${lang}: step 3 starts hidden`);

    const requestType = await page.locator('#type option').evaluateAll((options) => {
      const available = options.find((option) => String(option.value || '').trim() && !option.disabled);
      return available ? available.value : '';
    });
    check(Boolean(requestType), `wizard ${lang}: at least one request type is available`);
    if (!requestType) {
      await page.close();
      continue;
    }
    await page.locator('#type').selectOption(requestType);
    await page.locator('[data-request-step="1"] [data-request-next]').click();
    await page.waitForTimeout(100);

    check(await page.locator('[data-request-step="2"]').isVisible(), `wizard ${lang}: Next moves to step 2`);
    check(await page.locator('[data-request-step="1"]').isHidden(), `wizard ${lang}: step 1 hides after Next`);

    await page.locator('[data-request-step="2"] [data-request-next]').click();
    await page.waitForTimeout(100);

    check(await page.locator('[data-request-step="3"]').isVisible(), `wizard ${lang}: Next moves to step 3`);
    check(await page.locator('[data-request-step="3"] [data-submit-channel-button]').count() === 1, `wizard ${lang}: submit control remains in step 3`);
    check(await page.locator('[data-request-step="3"] [name="privacy_consent"]').count() === 1, `wizard ${lang}: privacy consent remains in step 3`);

    await page.locator('[data-request-step="3"] [data-request-back]').click();
    await page.waitForTimeout(100);
    check(await page.locator('[data-request-step="2"]').isVisible(), `wizard ${lang}: Back returns to step 2`);

    await page.close();
  }
} finally {
  await browser.close();
}

if (failures) {
  console.error(`\n${failures} contact wizard browser check(s) failed.`);
  process.exit(1);
}

console.log('\nAll contact wizard browser checks passed.');
