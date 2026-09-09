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

async function satisfyVisibleRequiredFields(step) {
  const required = step.locator('[required]');
  const count = await required.count();

  for (let index = 0; index < count; index += 1) {
    const field = required.nth(index);
    if (!(await field.isVisible()) || !(await field.isEnabled())) continue;
    if (await field.evaluate((element) => element.checkValidity())) continue;

    const tagName = await field.evaluate((element) => element.tagName);
    const type = String(await field.getAttribute('type') || '').toLowerCase();

    if (type === 'radio') {
      const name = await field.getAttribute('name');
      const candidate = step.locator(`input[type="radio"][name="${name}"]:not([disabled])`).first();
      if (await candidate.count()) await candidate.check();
      continue;
    }

    if (type === 'checkbox') {
      await field.check();
      continue;
    }

    if (tagName === 'SELECT') {
      const value = await field.locator('option').evaluateAll((options) => {
        const option = options.find((item) => String(item.value || '').trim() && !item.disabled);
        return option ? option.value : '';
      });
      if (value) await field.selectOption(value);
      continue;
    }

    if (type === 'date') {
      const min = await field.getAttribute('min');
      if (min) await field.fill(min);
      continue;
    }

    if (type === 'datetime-local') {
      const min = await field.getAttribute('min');
      if (min) await field.fill(min);
      continue;
    }

    if (type === 'number') {
      await field.fill(String(await field.getAttribute('min') || '1'));
      continue;
    }

    await field.fill('Test');
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
    await satisfyVisibleRequiredFields(page.locator('[data-request-step="1"]'));
    await page.locator('[data-request-step="1"] [data-request-next]').click();
    await page.waitForTimeout(100);

    check(await page.locator('[data-request-step="2"]').isVisible(), `wizard ${lang}: Next moves to step 2`);
    check(await page.locator('[data-request-step="1"]').isHidden(), `wizard ${lang}: step 1 hides after Next`);

    const step2 = page.locator('[data-request-step="2"]');
    await satisfyVisibleRequiredFields(step2);
    await step2.locator('[data-request-next]').click();
    await page.waitForTimeout(100);

    const step3Visible = await page.locator('[data-request-step="3"]').isVisible();
    if (!step3Visible) {
      const blockers = await step2.locator('[required]').evaluateAll((fields) => fields
        .filter((field) => field.willValidate && !field.disabled && !field.checkValidity())
        .map((field) => ({
          name: field.name,
          type: field.type,
          hiddenByGroup: Boolean(field.closest('[data-request-details][hidden]')),
          visible: Boolean(field.offsetWidth || field.offsetHeight || field.getClientRects().length)
        })));
      console.error(`wizard ${lang}: remaining blockers ${JSON.stringify(blockers)}`);
    }

    check(step3Visible, `wizard ${lang}: Next moves to step 3`);
    check(await page.locator('[data-request-step="3"] [data-submit-channel-button]').count() === 1, `wizard ${lang}: submit control remains in step 3`);
    check(await page.locator('[data-request-step="3"] [name="privacy_consent"]').count() === 1, `wizard ${lang}: privacy consent remains in step 3`);

    if (step3Visible) {
      await page.locator('[data-request-step="3"] [data-request-back]').click();
      await page.waitForTimeout(100);
      check(await page.locator('[data-request-step="2"]').isVisible(), `wizard ${lang}: Back returns to step 2`);
    }

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
