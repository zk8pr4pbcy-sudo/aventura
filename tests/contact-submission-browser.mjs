import { chromium } from 'playwright';

const baseUrl = process.env.AVENTURA_TEST_BASE_URL || 'http://127.0.0.1:4173';
const formSubmitUrl = 'https://formsubmit.co/ajax/contact@aventuraksa.com';
let failures = 0;

function check(condition, message) {
  if (condition) console.log(`✓ ${message}`);
  else {
    failures += 1;
    console.error(`✗ ${message}`);
  }
}

async function satisfyVisibleRequiredFields(scope) {
  const required = scope.locator('[required]');
  const count = await required.count();
  for (let index = 0; index < count; index += 1) {
    const field = required.nth(index);
    if (!(await field.isVisible()) || !(await field.isEnabled())) continue;
    if (await field.evaluate((element) => element.checkValidity())) continue;

    const tagName = await field.evaluate((element) => element.tagName);
    const type = String(await field.getAttribute('type') || '').toLowerCase();
    const name = await field.getAttribute('name');

    if (type === 'radio') {
      const candidate = scope.locator(`input[type="radio"][name="${name}"]:not([disabled])`).first();
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
    if (type === 'email') {
      await field.fill('guest@example.com');
      continue;
    }
    if (type === 'tel') {
      await field.fill('+966500000000');
      continue;
    }
    if (type === 'date' || type === 'datetime-local') {
      const min = await field.getAttribute('min');
      if (min) await field.fill(min);
      continue;
    }
    if (type === 'number') {
      await field.fill(String(await field.getAttribute('min') || '1'));
      continue;
    }
    await field.fill('Test Guest');
  }
}

async function reachFinalStep(page) {
  const type = page.locator('#type');
  const requestType = await type.locator('option').evaluateAll((options) => {
    const option = options.find((item) => String(item.value || '').trim() && !item.disabled);
    return option ? option.value : '';
  });
  if (requestType) await type.selectOption(requestType);

  for (const stepNumber of ['1', '2']) {
    const step = page.locator(`[data-request-step="${stepNumber}"]`);
    await satisfyVisibleRequiredFields(step);
    await step.locator('[data-request-next]').click();
    await page.waitForTimeout(75);
  }

  const step3 = page.locator('[data-request-step="3"]');
  await satisfyVisibleRequiredFields(step3);
  const email = step3.locator('[name="email"]');
  if (await email.count()) await email.fill('guest@example.com');
  const name = step3.locator('[name="name"]');
  if (await name.count()) await name.fill('Test Guest');
  const consent = step3.locator('[name="privacy_consent"]');
  if (await consent.count() && !(await consent.isChecked())) await consent.check();
  return step3;
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
    let intercepted = null;
    page.on('pageerror', (error) => errors.push(error.message));

    await page.route(formSubmitUrl, async (route) => {
      const request = route.request();
      intercepted = {
        method: request.method(),
        url: request.url(),
        body: request.postData() || ''
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await page.goto(`${baseUrl}/contact.html${query}`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load').catch(() => {});
    const step3 = await reachFinalStep(page);
    check(await step3.isVisible(), `submission ${lang}: final step is reachable`);

    await step3.locator('[name="submissionChannel"][value="email"]').check().catch(() => {});
    await step3.locator('[data-submit-channel-button]').click();
    await page.waitForTimeout(250);

    check(errors.length === 0, `submission ${lang}: no uncaught JavaScript errors`);
    check(Boolean(intercepted), `submission ${lang}: FormSubmit request is issued`);
    if (intercepted) {
      check(intercepted.url === formSubmitUrl, `submission ${lang}: endpoint is unchanged`);
      check(intercepted.method === 'POST', `submission ${lang}: request method is POST`);
      check(intercepted.body.includes('name="request_reference"'), `submission ${lang}: request reference is included`);
      check(intercepted.body.includes('name="request_language"'), `submission ${lang}: request language field is included`);
      check(intercepted.body.includes(`\r\n\r\n${lang}\r\n`) || intercepted.body.includes(`\n\n${lang}\n`), `submission ${lang}: active language value is included`);
      check(intercepted.body.includes('name="request_summary"'), `submission ${lang}: request summary is included`);
      check(intercepted.body.includes('name="_subject"'), `submission ${lang}: email subject is included`);
      check(intercepted.body.includes('name="_replyto"'), `submission ${lang}: reply-to field is included`);
      check(intercepted.body.includes('guest@example.com'), `submission ${lang}: visitor email is included`);
    }
    check(await page.locator('[data-request-success]').isVisible(), `submission ${lang}: success UI appears after accepted FormSubmit response`);
    check((await page.locator('[data-contact-form]').getAttribute('aria-busy')) === 'false', `submission ${lang}: busy state clears after success`);
    await page.close();
  }

  const failurePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await failurePage.route(formSubmitUrl, async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ success: false })
    });
  });
  await failurePage.goto(`${baseUrl}/contact.html?lang=en`, { waitUntil: 'domcontentloaded' });
  await failurePage.waitForLoadState('load').catch(() => {});
  const failureStep = await reachFinalStep(failurePage);
  await failureStep.locator('[name="submissionChannel"][value="email"]').check().catch(() => {});
  const submit = failureStep.locator('[data-submit-channel-button]');
  await submit.click();
  await failurePage.waitForTimeout(250);
  const statusText = String(await failurePage.locator('[data-form-status]').textContent().catch(() => '') || '').trim();
  check(statusText.length > 0, 'submission failure: localized error status is shown');
  check(!(await failurePage.locator('[data-request-success]').isVisible()), 'submission failure: success UI stays hidden');
  check(!(await submit.isDisabled()), 'submission failure: submit button is re-enabled');
  check((await failurePage.locator('[data-contact-form]').getAttribute('aria-busy')) === 'false', 'submission failure: busy state clears');
  await failurePage.close();
} finally {
  await browser.close();
}

if (failures) {
  console.error(`\n${failures} contact submission browser check(s) failed.`);
  process.exit(1);
}
console.log('\nAll intercepted contact submission browser checks passed.');
