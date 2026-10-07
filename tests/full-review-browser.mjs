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
    await page.waitForFunction(() => document.querySelector("#type")?.value === "private-event" && document.querySelector("#dynamicRequestPanel"));

    assert.equal(await page.locator('option[value="half-day"]').textContent(), item.half);
    assert.equal(await page.locator('option[value="full-day"]').textContent(), item.full);

    for (const name of ["eventType","eventLocationStatus","eventLocation","eventLevel"]) {
      assert.ok(await page.locator('[name="'+name+'"]').count() > 0, item.lang+" missing event field "+name);
    }
    assert.ok(await page.locator('[name="guests"]').count() > 0, item.lang+" guest count is missing");
    assert.ok(await page.locator('[name="duration"]').count() > 0, item.lang+" duration is missing");

    for (const service of ["venue","hospitality","transport","reception","onsite","flowers"]) {
      assert.ok(await page.locator('[name="addons[]"][value="'+service+'"]').count() > 0, item.lang+" missing event service "+service);
    }

    const eventText = await page.locator("#dynamicRequestPanel").innerText();
    assert.ok(!/budget|ميزاني[ةه]|presupuesto/i.test(eventText), item.lang+" event flow must not mention budget");
    const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2);
    assert.equal(noOverflow, true, item.lang+" event form should not overflow mobile viewport");
    await page.close();
  }

  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(baseUrl + "/contact.html?type=service&request=thobe", { waitUntil: "load" });
    await page.waitForFunction(() => document.documentElement.classList.contains("app-ready"));
    await page.waitForFunction(() => document.querySelector("#type")?.value === "guest-services");
    await page.waitForFunction(() => {
      const group = document.querySelector('[data-request-details="thobe"]');
      return group && !group.hidden;
    });
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
