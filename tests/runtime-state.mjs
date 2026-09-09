import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('assets/js/runtime-state.js', 'utf8');
let failures = 0;

function check(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    return;
  }
  failures += 1;
  console.error(`✗ ${message}`);
}

const context = {
  console,
  Intl,
  Date,
  Object,
  String,
  Array,
  globalThis: null,
  document: { documentElement: { lang: 'ar' } }
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(source, context);

const runtime = context.AVENTURA_RUNTIME;

check(Boolean(runtime), 'runtime API is exposed');
check(Object.isFrozen(runtime), 'runtime API is immutable');
check(runtime.language.default === 'ar', 'Arabic remains the default language');
check(runtime.language.normalize('EN') === 'en', 'language normalization is case-insensitive');
check(runtime.language.normalize('fr') === 'ar', 'unsupported language falls back to Arabic');
check(runtime.language.get() === 'ar', 'runtime reads the current document language');

context.document.documentElement.lang = 'es';
check(runtime.language.get() === 'es', 'runtime tracks document language changes without duplicate state');

const beforeSaudiMidnightUtc = new Date('2026-09-09T20:59:59Z');
const afterSaudiMidnightUtc = new Date('2026-09-09T21:00:00Z');
check(runtime.dates.today(beforeSaudiMidnightUtc) === '2026-09-09', 'Saudi date stays on Sep 9 before Riyadh midnight');
check(runtime.dates.today(afterSaudiMidnightUtc) === '2026-09-10', 'Saudi date advances at Riyadh midnight');
check(runtime.dates.minimumForInput('date', afterSaudiMidnightUtc) === '2026-09-10', 'date minimum uses Saudi today');
check(runtime.dates.minimumForInput('datetime-local', afterSaudiMidnightUtc) === '2026-09-10T00:00', 'datetime minimum uses Saudi day start');
check(runtime.dates.isPast('2026-09-09', 'date', afterSaudiMidnightUtc) === true, 'past Saudi date is rejected');
check(runtime.dates.isPast('2026-09-10', 'date', afterSaudiMidnightUtc) === false, 'Saudi today is accepted');
check(runtime.dates.isPast('', 'date', afterSaudiMidnightUtc) === false, 'empty optional date is not treated as past');

if (failures) {
  console.error(`\n${failures} runtime contract test(s) failed.`);
  process.exit(1);
}

console.log('\nAll Aventura runtime contract tests passed.');
