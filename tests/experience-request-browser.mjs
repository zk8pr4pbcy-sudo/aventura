import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = process.env.AVENTURA_TEST_BASE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
try {
  for (const lang of ['ar', 'en', 'es']) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    async function open(item) {
      await page.goto(`${base}/contact.html?type=experience&request=${item}&lang=${lang}`);
      await page.locator('#dynamicRequestPanel').waitFor({ state: 'attached' });
    }
    async function continueStep() {
      await page.locator('[data-request-step]:not([hidden]) [data-request-next]').click();
    }
    async function summary() {
      return page.evaluate(() => {
        const form = document.querySelector('[data-contact-form]');
        const dictionary = window.AVENTURA_I18N[document.documentElement.lang];
        return window.AVENTURA_CONTACT_REQUEST_DATA.buildMessage({
          form, data: new FormData(form), requestId: 'TEST', name: 'QA',
          translate: key => dictionary[key] || key
        });
      });
    }
    for (const [item, max, duration] of [['golden-hour', 6, 1], ['bayadah-day', 8, 8], ['bayadah-grand', 23, 8]]) {
      await open(item);
      assert.equal(await page.locator('#guests').getAttribute('max'), String(max));
      assert.equal(await page.locator('#duration').isDisabled(), true);
      assert.equal(await page.locator('#duration').isVisible(), false);
      assert.equal(await page.locator('[name=requestDuration]').inputValue(), duration === 1
        ? ({ ar:'ساعة واحدة', en:'One hour', es:'Una hora' })[lang] : '8 ' + ({ ar:'ساعات', en:'hours', es:'horas' })[lang]);
      if (item === 'golden-hour') assert.equal(await page.locator('#time').isDisabled(), true);
      await page.locator('#date').fill('2027-01-20');
      await page.locator('#guests').fill(String(max + 1));
      await continueStep();
      assert.equal(await page.locator('form').getAttribute('data-current-request-step'), '1');
      await page.locator('#guests').fill(String(max));
      await continueStep();
      assert.equal(await page.locator('form').getAttribute('data-current-request-step'), '2');
      assert.equal(await page.locator('[name=seaJourney], [name=seaMood], [name="addons[]"][value=resort]').count(), 0);
      await page.locator('[name="addons[]"][value=transport]').check();
      const text = await summary();
      assert.ok(text.includes(await page.locator('[name=requestExperience]').inputValue()));
      assert.ok(text.includes(await page.locator('[name=requestDuration]').inputValue()));
      assert.ok(!/10000|10,000|١٠[٬,]?٠٠٠/.test(text));
      // Changing a language must retain additions, dates and guest count.
      const nextLang = lang === 'en' ? 'es' : 'en';
      await page.locator(`[data-language=${nextLang}]`).click();
      assert.equal(await page.locator('[name="addons[]"][value=transport]').isChecked(), true);
      assert.equal(await page.locator('#guests').inputValue(), String(max));
    }
    await open('historic-vip');
    await continueStep();
    assert.equal(await page.locator('[name="addons[]"][value=transport]').count(), 0);
    assert.ok((await summary()).includes(await page.locator('[name=requestTransport]').inputValue()));

    // Switching away must clear fixed fields and restore the general controls.
    await open('golden-hour');
    await page.locator('#type').selectOption('private-event');
    assert.equal(await page.locator('#duration').isDisabled(), false);
    assert.equal(await page.locator('#time').isDisabled(), false);
    assert.equal(await page.locator('#guests').getAttribute('max'), '10000');
    assert.equal(await page.locator('[name=requestDuration]').isDisabled(), true);
    assert.ok(!(await summary()).includes(({ ar:'الساعة الذهبية', en:'The Golden Hour', es:'La Hora Dorada' })[lang]));

    // Selecting sunset through the general sea form applies the same product rules.
    await open('sea');
    await page.locator('#time').fill('12:00');
    await page.locator('#duration').selectOption('half-day');
    await continueStep();
    await page.locator('[name=seaJourney][value=seaSunset]').check();
    assert.equal(await page.locator('#time').inputValue(), '');
    assert.equal(await page.locator('#duration').inputValue(), '');
    assert.equal(await page.locator('#guests').getAttribute('max'), '6');
    assert.equal(await page.locator('[name=seaMood]').count(), 0);
    await page.locator('[name=seaJourney][value=seaTour]').check();
    assert.equal(await page.locator('#time').isDisabled(), false);
    assert.equal(await page.locator('#duration').isDisabled(), false);
    assert.equal(await page.locator('[name=requestDuration]').isDisabled(), true);
    assert.equal(errors.length, 0, errors.join('\n'));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.close();
    console.log(`Experience request checks passed: ${lang}`);
  }
} finally {
  await browser.close();
}
