import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.AVENTURA_TEST_BASE_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch({ headless: true });

try {
  const languageCases = [
    { lang: "ar", query: "", half: "نصف يوم (حتى 4 ساعات)", full: "يوم كامل (حتى 8 ساعات)" },
    { lang: "en", query: "?lang=en", half: "Half day (up to 4 hours)", full: "Full day (up to 8 hours)" },
    { lang: "es", query: "?lang=es", half: "Medio día (hasta 4 horas)", full: "Día completo (hasta 8 horas)" }
  ];

  for (const item of languageCases) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const suffix = item.query ? item.query + "&type=event&request=private-event" : "?type=event&request=private-event";
    await page.goto(baseUrl + "/contact.html" + suffix, { waitUntil: "load" });
    await page.waitForFunction(() => document.documentElement.classList.contains("app-ready"));

    assert.equal(await page.locator('option[value="half-day"]').textContent(), item.half);
    assert.equal(await page.locator('option[value="full-day"]').textContent(), item.full);

    const eventState = await page.locator('[data-request-details="event"]').evaluate((node) => ({
      hidden: node.hidden,
      disabled: Array.from(node.querySelectorAll("input,select,textarea")).every((control) => control.disabled)
    }));
    assert.equal(eventState.hidden, false, item.lang+" event details should be enabled");
    assert.equal(eventState.disabled, false, item.lang+" event controls should be enabled");

    const thobeState = await page.locator('[data-request-details="thobe"]').evaluate((node) => ({
      hidden: node.hidden,
      disabled: Array.from(node.querySelectorAll("input,select,textarea")).every((control) => control.disabled)
    }));
    assert.equal(thobeState.hidden, true, item.lang+" unrelated guest service must stay hidden");
    assert.equal(thobeState.disabled, true, item.lang+" hidden guest service fields must be disabled");

    const eventText = await page.locator('[data-request-details="event"]').innerText();
    assert.ok(!/budget|ميزاني[ةه]|presupuesto/i.test(eventText), item.lang+" event flow must not mention budget");
    const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2);
    assert.equal(noOverflow, true, item.lang+" event form should not overflow mobile viewport");
    await page.close();
  }

  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(baseUrl + "/contact.html?type=service&request=thobe", { waitUntil: "load" });
    await page.waitForFunction(() => document.documentElement.classList.contains("app-ready"));
    const state = await page.locator('[data-request-details="thobe"]').evaluate((node) => ({
      hidden: node.hidden,
      disabled: Array.from(node.querySelectorAll("input,select,textarea")).every((control) => control.disabled)
    }));
    assert.equal(state.hidden, false, "thobe details should open from guest-service link");
    assert.equal(state.disabled, false, "thobe fields should be enabled");
    await page.close();
  }

  {
    const page = await browser.newPage();
    await page.goto(baseUrl + "/corporate.html", { waitUntil: "load" });
    assert.ok((await page.locator('[data-i18n="corporate.guestBoutique"]').getAttribute("href")).includes("guest-services.html#personal-services"));
    await page.goto(baseUrl + "/collection.html", { waitUntil: "load" });
    assert.ok(!(await page.locator("body").innerText()).includes("Original campaign artwork pending"));
    assert.ok(!(await page.locator("body").innerText()).includes("Marketing card in preparation"));
    await page.close();
  }

  {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    for (const path of ["/privacy.html","/terms.html"]) {
      const page = await context.newPage();
      await page.goto(baseUrl + path, { waitUntil: "load" });
      assert.ok(await page.locator(".legal-document h2").count() >= 7, path+" must remain readable without JavaScript");
      const opacity = await page.locator(".legal-document").evaluate((node) => getComputedStyle(node).opacity);
      assert.equal(opacity, "1", path+" legal fallback must be visible without JavaScript");
      await page.close();
    }
    await context.close();
  }

  console.log("Full site review browser checks passed.");
} finally {
  await browser.close();
}
