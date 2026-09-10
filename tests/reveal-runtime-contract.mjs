import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const app = fs.readFileSync(path.join(root, "assets/js/app.js"), "utf8");
const runtime = fs.readFileSync(path.join(root, "assets/js/reveal-runtime.js"), "utf8");
const htmlFiles = fs.readdirSync(root).filter((name) => name.endsWith(".html"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(runtime.includes("window.AVENTURA_REVEAL"), "Reveal runtime must expose window.AVENTURA_REVEAL");
assert(runtime.includes("IntersectionObserver"), "Reveal runtime must own IntersectionObserver behavior");
assert(runtime.includes("prefers-reduced-motion: reduce"), "Reveal runtime must preserve reduced-motion behavior");
assert(runtime.includes("rootMargin: \"0px 0px -7%\""), "Reveal runtime must preserve observer rootMargin");
assert(runtime.includes("threshold: 0.12"), "Reveal runtime must preserve observer threshold");
assert(!app.includes("new IntersectionObserver"), "app.js must not own reveal observer implementation after extraction");
assert(app.includes("window.AVENTURA_REVEAL"), "app.js must delegate reveal setup to the reveal runtime");

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  if (!html.includes("assets/js/app.js")) continue;
  const revealIndex = html.indexOf("assets/js/reveal-runtime.js");
  const appIndex = html.indexOf("assets/js/app.js");
  assert(revealIndex !== -1, `${file} must load reveal-runtime.js`);
  assert(revealIndex < appIndex, `${file} must load reveal-runtime.js before app.js`);
}

console.log("Reveal runtime contract checks passed.");
