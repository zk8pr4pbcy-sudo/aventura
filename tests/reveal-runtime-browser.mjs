import { chromium } from "playwright";

const baseUrl = process.env.AVENTURA_TEST_BASE_URL || "http://127.0.0.1:4173";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(`${baseUrl}/index.html`, { waitUntil: "networkidle" });
  const revealCount = await page.locator("[data-reveal]").count();
  assert(revealCount > 0, "Home page must contain reveal elements");

  await page.locator("[data-reveal]").first().scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const element = document.querySelector("[data-reveal]");
    return Boolean(element && element.classList.contains("is-visible"));
  });
  assert(errors.length === 0, `Reveal runtime must not raise page errors: ${errors.join(" | ")}`);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload({ waitUntil: "networkidle" });
  const hiddenCount = await page.locator("[data-reveal]:not(.is-visible)").count();
  assert(hiddenCount === 0, "Reduced-motion mode must reveal all elements immediately");

  console.log("Reveal runtime browser checks passed.");
} finally {
  await browser.close();
}
