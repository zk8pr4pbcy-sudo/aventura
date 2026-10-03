import { chromium } from "playwright";

const baseUrl = process.env.AVENTURA_TEST_BASE_URL || "http://127.0.0.1:4173";
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
  for (const { lang, query, expected } of [
    { lang: "ar", query: "", expected: { occasion: "نوع المناسبة: عيد ميلاد", venue: "حالة الموقع: أرغب أن تقترح أفنتورا موقعًا", services: "ما الذي ترغب أن تتولاه أفنتورا؟: إدارة وتخطيط المناسبة بالكامل" } },
    { lang: "en", query: "?lang=en", expected: { occasion: "Occasion type: Birthday", venue: "Venue status: I would like Aventura to suggest a venue", services: "What would you like Aventura to handle?: Full event planning and management" } },
    { lang: "es", query: "?lang=es", expected: { occasion: "Tipo de ocasión: Cumpleaños", venue: "Estado del lugar: Quiero que Aventura proponga un lugar", services: "¿Qué quieres que gestione Aventura?: Planificación y gestión integral del evento" } }
  ]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(`${baseUrl}/contact.html${query}`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("load").catch(() => {});
    await page.waitForTimeout(250);
    await page.addScriptTag({ url: `${baseUrl}/assets/js/contact-request-data.js` });

    const requestTypeOptions = await page.locator('#type option').evaluateAll((options) => options.map((option) => option.value));
    check(requestTypeOptions.includes('private-event'), `request data ${lang}: private-event request type is available in the live DOM`);
    if (!requestTypeOptions.includes('private-event')) {
      console.error(`request data ${lang}: request type values ${JSON.stringify(requestTypeOptions)}`);
      await page.close();
      continue;
    }

    await page.locator('#type').selectOption({ value: 'private-event' });
    await page.waitForFunction(() => Boolean(
      document.querySelector('#dynamicRequestPanel [name="eventType"]') &&
      document.querySelector('#dynamicRequestPanel [name="eventLocationStatus"]')
    ));

    check(errors.length === 0, `request data ${lang}: no uncaught JavaScript errors`);

    const result = await page.evaluate(() => {
      const api = window.AVENTURA_CONTACT_REQUEST_DATA;
      const form = document.querySelector("[data-contact-form]");
      form.querySelector('[name="name"]').value = "Test Guest";
      form.querySelector('[name="company"]').value = "Aventura Test";
      form.querySelector('[name="phone"]').value = "+966500000000";
      form.querySelector('[name="email"]').value = "test@example.com";
      form.querySelector('[name="date"]').value = "2026-12-20";
      form.querySelector('[name="time"]').value = "17:30";
      form.querySelector('[name="guests"]').value = "4";
      form.querySelector('[name="message"]').value = "Test request";
      form.querySelector('[name="eventType"][value="eventBirthday"]').checked = true;
      form.querySelector('[name="eventLocationStatus"][value="eventLocationSuggest"]').checked = true;
      form.querySelector('[name="addons[]"][value="eventFullPlanning"]').checked = true;
      const data = new FormData(form);
      const requestId = api.createRequestId({ date: new Date("2026-09-10T00:00:00Z"), random: () => 0.123456789 });
      const message = api.buildMessage({
        form,
        data,
        requestId,
        name: "Test Guest",
        translate: (key) => key
      });
      return { requestId, message };
    });

    check(/^AVE-20260910-[A-Z0-9]+$/.test(result.requestId), `request data ${lang}: request reference format is stable`);
    check(result.message.includes("contact.requestReference: " + result.requestId), `request data ${lang}: summary includes request reference`);
    check(result.message.includes("contact.whatsappName: Test Guest"), `request data ${lang}: summary includes guest name`);
    check(result.message.includes("contact.whatsappCompany: Aventura Test"), `request data ${lang}: summary includes company`);
    check(result.message.includes("contact.whatsappDate: 2026-12-20"), `request data ${lang}: summary includes date`);
    check(result.message.includes("contact.whatsappGuests: 4"), `request data ${lang}: summary includes guest count`);
    check(result.message.includes("contact.whatsappMessage: Test request"), `request data ${lang}: summary includes request message`);
    check(result.message.includes(expected.occasion), `request data ${lang}: summary includes occasion type`);
    check(result.message.includes(expected.venue), `request data ${lang}: summary includes venue status`);
    check(result.message.includes(expected.services), `request data ${lang}: summary includes selected event services`);

    await page.close();
  }
} finally {
  await browser.close();
}

if (failures) {
  console.error(`\n${failures} contact request data browser check(s) failed.`);
  process.exit(1);
}

console.log("\nAll contact request data browser checks passed.");
