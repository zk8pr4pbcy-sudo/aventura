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
  for (const { lang, query } of [
    { lang: "ar", query: "" },
    { lang: "en", query: "?lang=en" },
    { lang: "es", query: "?lang=es" }
  ]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto(`${baseUrl}/contact.html${query}`, { waitUntil: "domcontentloaded" });
    await page.addScriptTag({ url: `${baseUrl}/assets/js/contact-request-data.js` });
    await page.waitForTimeout(100);

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
