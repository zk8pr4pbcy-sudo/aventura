import fs from 'node:fs';

const appPath = 'assets/js/app.js';
const app = fs.readFileSync(appPath, 'utf8');
const from = 'dialogRuntime: window.AVENTURA_DIALOG_RUNTIME';
const to = 'dialogRuntime: window.AVENTURA_DIALOGS';
const matches = app.split(from).length - 1;

if (matches !== 1) {
  throw new Error(`Expected exactly one obsolete perfume story dialog runtime reference, found ${matches}`);
}

fs.writeFileSync(appPath, app.replace(from, to));
console.log('Updated perfume story dialog runtime reference in app.js');
