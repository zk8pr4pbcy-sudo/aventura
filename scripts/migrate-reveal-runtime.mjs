import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const appPath = path.join(root, "assets/js/app.js");
let app = fs.readFileSync(appPath, "utf8");

const oldBlock = `  function setupReveals() {\n    var elements = Array.from(document.querySelectorAll("[data-reveal]"));\n    if (!elements.length) {\n      return;\n    }\n\n    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {\n      elements.forEach(function (element) { element.classList.add("is-visible"); });\n      return;\n    }\n\n    var observer = new IntersectionObserver(function (entries) {\n      entries.forEach(function (entry) {\n        if (entry.isIntersecting) {\n          entry.target.classList.add("is-visible");\n          observer.unobserve(entry.target);\n        }\n      });\n    }, { rootMargin: "0px 0px -7%", threshold: 0.12 });\n\n    elements.forEach(function (element) { observer.observe(element); });\n  }`;

const newBlock = `  function setupReveals() {\n    var revealRuntime = window.AVENTURA_REVEAL;\n    if (!revealRuntime || typeof revealRuntime.setup !== "function") {\n      throw new Error("Aventura reveal runtime is unavailable");\n    }\n    revealRuntime.setup();\n  }`;

if (!app.includes(newBlock)) {
  const count = app.split(oldBlock).length - 1;
  if (count !== 1) throw new Error(`Expected exactly one reveal implementation block, found ${count}`);
  app = app.replace(oldBlock, newBlock);
  fs.writeFileSync(appPath, app);
}

const htmlFiles = fs.readdirSync(root).filter((name) => name.endsWith(".html"));
for (const file of htmlFiles) {
  const filePath = path.join(root, file);
  let html = fs.readFileSync(filePath, "utf8");
  if (!html.includes("assets/js/app.js")) continue;
  if (html.includes("assets/js/reveal-runtime.js")) continue;

  const appScriptPattern = /<script\b([^>]*?)src=["']assets\/js\/app\.js([^"']*)["']([^>]*)><\/script>/;
  const match = html.match(appScriptPattern);
  if (!match) throw new Error(`${file}: unable to locate app.js script tag`);
  const revealTag = '<script src="assets/js/reveal-runtime.js?v=20260910" defer></script>';
  html = html.replace(match[0], revealTag + "\n" + match[0]);
  fs.writeFileSync(filePath, html);
}

const workflowPath = path.join(root, ".github/workflows/maintenance-ci.yml");
let workflow = fs.readFileSync(workflowPath, "utf8");
if (!workflow.includes("Run reveal runtime contract checks")) {
  const anchor = `      - name: Run perfume story runtime contract checks\n        run: node tests/perfume-story-contract.mjs\n`;
  if (!workflow.includes(anchor)) throw new Error("Maintenance CI verify anchor not found");
  workflow = workflow.replace(anchor, anchor + `\n      - name: Run reveal runtime contract checks\n        run: node tests/reveal-runtime-contract.mjs\n`);
}
if (!workflow.includes("Run reveal runtime browser checks")) {
  const anchor = `      - name: Run multilingual browser smoke checks\n        env:\n          AVENTURA_TEST_BASE_URL: http://127.0.0.1:4173\n        run: node tests/browser-smoke.mjs\n`;
  if (!workflow.includes(anchor)) throw new Error("Maintenance CI browser anchor not found");
  workflow = workflow.replace(anchor, anchor + `\n      - name: Run reveal runtime browser checks\n        env:\n          AVENTURA_TEST_BASE_URL: http://127.0.0.1:4173\n        run: node tests/reveal-runtime-browser.mjs\n`);
}
fs.writeFileSync(workflowPath, workflow);

console.log("Reveal runtime migration applied.");
