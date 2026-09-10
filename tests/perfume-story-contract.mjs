import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const appPath = path.join(root, 'assets/js/app.js');
const runtimePath = path.join(root, 'assets/js/perfume-story-runtime.js');
const dialogRuntimePath = path.join(root, 'assets/js/dialog-runtime.js');
const app = fs.readFileSync(appPath, 'utf8');
const runtime = fs.readFileSync(runtimePath, 'utf8');
const dialogRuntime = fs.readFileSync(dialogRuntimePath, 'utf8');
let failures = 0;

function check(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
  } else {
    failures += 1;
    console.error(`✗ ${message}`);
  }
}

check(runtime.includes('window.AVENTURA_PERFUME_STORY'), 'perfume story runtime exposes one stable public API');
check(dialogRuntime.includes('window.AVENTURA_DIALOGS'), 'shared dialog runtime exposes the canonical AVENTURA_DIALOGS API');
check(runtime.includes('window.AVENTURA_DIALOGS'), 'perfume story runtime falls back to the canonical shared dialog API');
check(!runtime.includes('window.AVENTURA_DIALOG_RUNTIME'), 'perfume story runtime does not reference the obsolete dialog runtime name');
check(runtime.includes('dialogRuntime.open') && runtime.includes('dialogRuntime.close') && runtime.includes('dialogRuntime.prepare'), 'perfume story runtime delegates dialog behavior to shared dialog runtime');
check(!runtime.includes('dialog.showModal(') && !runtime.includes('dialog.close('), 'perfume story runtime does not reimplement dialog primitives');
check(app.includes('window.AVENTURA_PERFUME_STORY'), 'app delegates perfume story setup to the dedicated runtime');
check(app.includes('dialogRuntime: window.AVENTURA_DIALOGS'), 'app passes the canonical shared dialog runtime API');
check(!app.includes('window.AVENTURA_DIALOG_RUNTIME'), 'app does not reference the obsolete dialog runtime name');
check(!app.includes('document.querySelectorAll("[data-perfume-story]")'), 'app no longer owns perfume story event wiring');

for (const entry of fs.readdirSync(root)) {
  if (!entry.endsWith('.html')) continue;
  const html = fs.readFileSync(path.join(root, entry), 'utf8');
  if (!html.includes('assets/js/app.js')) continue;
  const dialogIndex = html.indexOf('assets/js/dialog-runtime.js');
  const storyIndex = html.indexOf('assets/js/perfume-story-runtime.js');
  const appIndex = html.indexOf('assets/js/app.js');
  check(dialogIndex >= 0 && storyIndex > dialogIndex && appIndex > storyIndex, `${entry}: dialog → perfume story → app load order is stable`);
}

if (failures) {
  console.error(`\n${failures} perfume story contract check(s) failed.`);
  process.exit(1);
}

console.log('\nAll perfume story contract checks passed.');
