import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const appPath = path.join(root, 'assets/js/app.js');
const smokePath = path.join(root, 'tests/smoke.mjs');
const browserSmokePath = path.join(root, 'tests/browser-smoke.mjs');
const dialogScript = 'assets/js/dialog-runtime.js?v=20260910';

let app = fs.readFileSync(appPath, 'utf8');
const startMarker = '  function restoreDialogFocus(dialog) {';
const endMarker = '  function setupBoutiqueCatalog() {';
const start = app.indexOf(startMarker);
const end = app.indexOf(endMarker);
if (start === -1 || end === -1 || end <= start) {
  throw new Error('Dialog helper block boundaries were not found exactly once');
}

const wrappers = `  function prepareDialog(dialog) {\n    return window.AVENTURA_DIALOGS.prepare(dialog, translate);\n  }\n\n  function openAventuraDialog(dialog, trigger) {\n    return window.AVENTURA_DIALOGS.open(dialog, trigger, translate);\n  }\n\n  function closeAventuraDialog(dialog) {\n    return window.AVENTURA_DIALOGS.close(dialog);\n  }\n\n`;
app = app.slice(0, start) + wrappers + app.slice(end);
if (app.includes('dialog.__aventuraPrepared') || app.includes('dialog.__aventuraReturnFocus') || app.includes('dialog.showModal()')) {
  throw new Error('Dialog implementation details remain in app.js after extraction');
}
fs.writeFileSync(appPath, app);

let htmlTouched = 0;
for (const file of fs.readdirSync(root).filter((name) => name.endsWith('.html'))) {
  const filePath = path.join(root, file);
  let html = fs.readFileSync(filePath, 'utf8');
  if (!html.includes('assets/js/app.js')) continue;
  if (html.includes('assets/js/dialog-runtime.js')) continue;
  const appScriptPattern = /<script\b(?=[^>]*\bsrc="assets\/js\/app\.js(?:\?v=[^"]+)?")[^>]*><\/script>/;
  const match = html.match(appScriptPattern);
  if (!match) throw new Error(`${file}: app.js script tag shape was not recognized`);
  html = html.replace(appScriptPattern, `<script src="${dialogScript}" defer></script>${match[0]}`);
  fs.writeFileSync(filePath, html);
  htmlTouched += 1;
}
if (!htmlTouched) throw new Error('No HTML pages were updated with dialog-runtime.js');

let smoke = fs.readFileSync(smokePath, 'utf8');
if (!smoke.includes("const dialogRuntime = read('assets/js/dialog-runtime.js');")) {
  smoke = smoke.replace("const app = read('assets/js/app.js');\n", "const app = read('assets/js/app.js');\nconst dialogRuntime = read('assets/js/dialog-runtime.js');\n");
}
const smokeAnchor = "check(!fs.existsSync(legacyLaunchRecoveryPath), 'legacy launch recovery runtime has been removed');\n";
if (!smoke.includes("dialog runtime owns modal opening and focus restoration")) {
  if (!smoke.includes(smokeAnchor)) throw new Error('Smoke insertion anchor not found');
  const dialogChecks = `// Dialog runtime: modal mechanics and focus restoration live outside app.js.\ncheck(dialogRuntime.includes('window.AVENTURA_DIALOGS'), 'dialog runtime exposes its stable API');\ncheck(dialogRuntime.includes('dialog.showModal()') && dialogRuntime.includes('__aventuraReturnFocus'), 'dialog runtime owns modal opening and focus restoration');\ncheck(app.includes('window.AVENTURA_DIALOGS.prepare(dialog, translate)') && app.includes('window.AVENTURA_DIALOGS.open(dialog, trigger, translate)') && app.includes('window.AVENTURA_DIALOGS.close(dialog)'), 'app.js delegates dialog behavior through the stable runtime API');\ncheck(!app.includes('dialog.__aventuraPrepared') && !app.includes('dialog.__aventuraReturnFocus') && !app.includes('dialog.showModal()'), 'app.js no longer owns dialog implementation details');\n\n`;
  smoke = smoke.replace(smokeAnchor, dialogChecks + smokeAnchor);
}
const htmlOrderNeedle = "check(!html.includes('assets/js/experience-copy-overrides.js'), `${file}: experience copy override reference is absent`);\n";
if (!smoke.includes('dialog runtime loads before app.js')) {
  if (!smoke.includes(htmlOrderNeedle)) throw new Error('HTML smoke insertion anchor not found');
  smoke = smoke.replace(htmlOrderNeedle, htmlOrderNeedle + "  if (html.includes('assets/js/app.js')) {\n    check(includesInOrder(html, 'assets/js/dialog-runtime.js', 'assets/js/app.js'), `${file}: dialog runtime loads before app.js`);\n  }\n");
}
fs.writeFileSync(smokePath, smoke);

let browserSmoke = fs.readFileSync(browserSmokePath, 'utf8');
const browserAnchor = "    check(await page.locator('#aventura-prelaunch-visual-fixes').count() === 0, `collection ${lang}: no runtime recovery style element is injected`);\n";
if (!browserSmoke.includes('dialog restores focus to its trigger')) {
  if (!browserSmoke.includes(browserAnchor)) throw new Error('Browser smoke insertion anchor not found');
  const dialogBrowserChecks = `\n    const detailsButton = page.locator('.product-details-button').first();\n    check(await detailsButton.count() === 1, \`collection \${lang}: product details trigger exists\`);\n    if (await detailsButton.count()) {\n      await detailsButton.click();\n      const productDialog = page.locator('[data-product-dialog]');\n      check(await productDialog.evaluate((element) => element.open), \`collection \${lang}: product dialog opens through shared runtime\`);\n      await productDialog.locator('[data-close-product-dialog]').first().click();\n      await page.waitForTimeout(30);\n      check(!(await productDialog.evaluate((element) => element.open)), \`collection \${lang}: product dialog closes through shared runtime\`);\n      check(await detailsButton.evaluate((element) => document.activeElement === element), \`collection \${lang}: dialog restores focus to its trigger\`);\n    }\n`;
  browserSmoke = browserSmoke.replace(browserAnchor, browserAnchor + dialogBrowserChecks);
}
fs.writeFileSync(browserSmokePath, browserSmoke);

for (const file of fs.readdirSync(root).filter((name) => name.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  if (!html.includes('assets/js/app.js')) continue;
  const dialogIndex = html.indexOf('assets/js/dialog-runtime.js');
  const appIndex = html.indexOf('assets/js/app.js');
  if (dialogIndex === -1 || dialogIndex > appIndex) throw new Error(`${file}: dialog runtime is not loaded before app.js`);
}

console.log(`Extracted shared dialog runtime and updated ${htmlTouched} HTML pages.`);
