import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith('.html'));
const legacyToken = 'assets/js/launch-v2-recovery.js';
const copyScript = '<script src="assets/js/experience-copy-overrides.js?v=20260910" defer></script>';
const lastLightScript = '<script src="assets/js/boutique-last-light.js?v=20260910" defer></script>';
const navigationScript = '<script src="assets/js/boutique-navigation.js?v=20260910" defer></script>';
let changed = 0;
let touchedLegacyPages = 0;

for (const file of htmlFiles) {
  const filePath = path.join(root, file);
  let source = fs.readFileSync(filePath, 'utf8');
  if (!source.includes(legacyToken)) continue;

  touchedLegacyPages += 1;
  source = source.replace(/<script\s+src="assets\/js\/launch-v2-recovery\.js\?v=[^"]+"\s+defer><\/script>/g, copyScript);

  if (file === 'collection.html') {
    if (!source.includes(lastLightScript)) {
      source = source.replace(copyScript, `${copyScript}\n  ${lastLightScript}\n  ${navigationScript}`);
    }
  }

  if (source.includes(legacyToken)) {
    throw new Error(`${file}: legacy recovery reference remains after migration`);
  }

  fs.writeFileSync(filePath, source);
  changed += 1;
}

if (!touchedLegacyPages) {
  const alreadyMigrated = htmlFiles.every((file) => !fs.readFileSync(path.join(root, file), 'utf8').includes(legacyToken));
  if (!alreadyMigrated) throw new Error('Legacy recovery references exist but were not migrated');
  console.log('Recovery module migration already applied.');
  process.exit(0);
}

const collection = fs.readFileSync(path.join(root, 'collection.html'), 'utf8');
if (!collection.includes(copyScript) || !collection.includes(lastLightScript) || !collection.includes(navigationScript)) {
  throw new Error('collection.html is missing one or more extracted recovery modules');
}
if (!(collection.indexOf(copyScript) < collection.indexOf(lastLightScript) && collection.indexOf(lastLightScript) < collection.indexOf(navigationScript))) {
  throw new Error('collection recovery module order is incorrect');
}

console.log(`Migrated ${changed} HTML files away from launch-v2-recovery.js.`);
