import assert from "node:assert/strict";
import { chromium } from "playwright";

const base = process.env.AVENTURA_TEST_BASE_URL || "http://127.0.0.1:4173";
const translations = {
  ar: {
    includes: ["التخطيط", "اختيار الموقع", "النقل", "الضيافة", "استقبال الضيوف", "التنفيذ الميداني"],
    guestTitle: "خدمات تُكمّل تجربة الضيف",
    services: [
      "استقبال المطار والنقل",
      "تنسيق وصول الضيف إلى مقر إقامته وترتيب متطلبات الضيافة.",
      "تفصيل ثوب سعودي للضيف، مع أخذ المقاسات في مقر إقامته وتسليمه خلال 24 ساعة.",
      "إرسال ورد إلى مقر الإقامة أو إلى غرفة الفندق.",
      "اختيار العباية بمساعدة مختصة."
    ],
    note: "حسب التوفر"
  },
  en: {
    includes: ["Planning", "Venue selection", "Transport", "Hospitality", "Guest reception", "On-site execution"],
    guestTitle: "Services that complement the guest experience",
    services: [
      "Airport meet and transport",
      "Coordinating the guest's arrival at their accommodation and arranging hospitality requirements.",
      "Tailoring a Saudi thobe for the guest, with measurements taken at their accommodation and delivery within 24 hours.",
      "Sending flowers to the accommodation or hotel room.",
      "Abaya selection with a dedicated female specialist."
    ],
    note: "Subject to availability"
  },
  es: {
    includes: ["Planificación", "Selección del lugar", "Transporte", "Hospitalidad", "Recepción de invitados", "Ejecución in situ"],
    guestTitle: "Servicios que complementan la experiencia del huésped",
    services: [
      "Recepción en el aeropuerto y transporte",
      "Coordinación de la llegada del huésped a su alojamiento y organización de los servicios de hospitalidad.",
      "Confección de un thobe saudí para el huésped, con toma de medidas en su alojamiento y entrega en 24 horas.",
      "Envío de flores al alojamiento o a la habitación del hotel.",
      "Selección de abaya con la ayuda de una especialista."
    ],
    note: "Sujeto a disponibilidad"
  }
};

const browser = await chromium.launch({ headless: true });
let cases = 0;
try {
  for (const [lang, expected] of Object.entries(translations)) {
    for (const width of [320, 390, 768, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      const query = lang === "ar" ? "" : "?lang=" + lang;
      await page.goto(base + "/corporate.html" + query, { waitUntil: "domcontentloaded" });
      await page.waitForFunction(expected => document.querySelector('[data-i18n="corporate.guestTitle"]')?.textContent === expected, expected.guestTitle);
      assert.equal(await page.locator("html").getAttribute("dir"), lang === "ar" ? "rtl" : "ltr", lang+" dir");
      assert.deepEqual(await page.locator(".corporate-inclusion strong").allTextContents(), expected.includes, lang+" inclusion labels");
      assert.equal(await page.locator(".corporate-inclusion").count(), 6);
      assert.deepEqual(await page.locator(".corporate-guest-detail > span").allTextContents(), expected.services, lang+" services");
      assert.equal(await page.locator(".corporate-guest-note").textContent(), expected.note);
      const metrics = await page.evaluate(() => {
        const cards = document.querySelector(".corporate-inclusions");
        const service = document.querySelector(".corporate-guest-detail > span");
        const note = document.querySelector(".corporate-guest-note");
        const content = document.querySelector(".corporate-guest-services");
        const rect = content.getBoundingClientRect();
        return {
          cardsDisplay: getComputedStyle(cards).display,
          gap: parseFloat(getComputedStyle(cards).columnGap),
          noOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2,
          guestListInside: rect.left >= -2 && rect.right <= document.documentElement.clientWidth + 2,
          noteSmaller: parseFloat(getComputedStyle(note).fontSize) < parseFloat(getComputedStyle(service).fontSize)
        };
      });
      assert.equal(metrics.cardsDisplay, "grid", lang+" "+width+" uses grid layout");
      assert.ok(metrics.gap >= 10, lang+" "+width+" cards are separated");
      assert.ok(metrics.noOverflow, lang+" "+width+" no horizontal overflow");
      assert.ok(metrics.guestListInside, lang+" "+width+" guest services inside viewport");
      assert.ok(metrics.noteSmaller, lang+" "+width+" note is visually subordinate");
      assert.deepEqual(errors, [], lang+" "+width+" has no uncaught JS errors");
      if(width === 390) {
        const link = page.locator('a[href*="contact.html?type=corporate"]').last();
        assert.ok((await link.count()) >= 1, "corporate contact route exists");
        await link.click();
        await page.waitForURL(/contact\.html\?type=corporate/);
        assert.ok(await page.locator("form[data-contact-form]").count() > 0, lang+" contact form preserved");
        assert.deepEqual(errors, [], lang+" request form has no JS errors");
      }
      await page.close();
      console.log("✓ Corporate services "+lang+" / "+width+"px");
      cases++;
    }
  }
} finally {
  await browser.close();
}
console.log("Corporate mobile, language and request tests passed: "+cases+" viewport/language combinations.");
