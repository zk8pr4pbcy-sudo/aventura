import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
let failures = 0;

function check(condition, message) {
  if (condition) console.log(`✓ ${message}`);
  else {
    failures += 1;
    console.error(`✗ ${message}`);
  }
}

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'assets/js/curated-calendar.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'assets/css/curated-calendar.css'), 'utf8');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/curated-events.json'), 'utf8'));

check(index.includes('data-curated-calendar'), 'home page contains the Curated Calendar section');
check(index.includes('assets/css/curated-calendar.css'), 'home page loads the isolated Curated Calendar stylesheet');
check(index.includes('assets/js/curated-calendar.js'), 'home page loads the isolated Curated Calendar runtime');

const introPosition = index.indexOf('home-intro-editorial');
const calendarPosition = index.indexOf('data-curated-calendar');
const experiencesPosition = index.indexOf('id="experiences"');
check(introPosition !== -1 && calendarPosition > introPosition && calendarPosition < experiencesPosition, 'Curated Calendar sits after the Aventura approach and before core experiences');

check(!app.includes('curated-calendar') && !app.includes('CURATED_CALENDAR'), 'app.js does not own Curated Calendar behavior');
check(runtime.includes('windowDays') || runtime.includes('filterEvents'), 'Curated Calendar runtime owns its date-window behavior');
check(runtime.includes('Asia/Riyadh'), 'Curated Calendar uses the Saudi timezone');
check(css.includes('.curated-card'), 'Curated Calendar styling is isolated under feature classes');

check(data.windowDays === 10, 'editorial window is exactly 10 days');
check(Array.isArray(data.events) && data.events.length >= 1, 'event data contains curated entries');

for (const lang of ['ar', 'en', 'es']) {
  check(Boolean(data.ui?.[lang]?.title), `section UI includes ${lang} title`);
  check(Boolean(data.ui?.[lang]?.cta), `section UI includes ${lang} CTA`);
}

for (const event of data.events || []) {
  check(/^\d{4}-\d{2}-\d{2}$/.test(event.startDate || ''), `${event.id}: valid start date`);
  check(/^\d{4}-\d{2}-\d{2}$/.test(event.endDate || ''), `${event.id}: valid end date`);
  check(event.endDate >= event.startDate, `${event.id}: end date does not precede start date`);
  check(/^https:\/\//.test(event.sourceUrl || ''), `${event.id}: source uses HTTPS`);
  check(String(event.image || '').startsWith('assets/images/'), `${event.id}: image stays on the Aventura origin`);
  for (const lang of ['ar', 'en', 'es']) {
    check(Boolean(event.title?.[lang]), `${event.id}: ${lang} title exists`);
    check(Boolean(event.location?.[lang]), `${event.id}: ${lang} location exists`);
    check(Boolean(event.category?.[lang]), `${event.id}: ${lang} category exists`);
    check(Boolean(event.aventuraPlan?.[lang]), `${event.id}: ${lang} Aventura plan exists`);
    check(Boolean(event.imageAlt?.[lang]), `${event.id}: ${lang} accessible image text exists`);
  }
}

await import('../assets/js/curated-calendar.js');
const api = globalThis.AVENTURA_CURATED_CALENDAR;
check(Boolean(api), 'Curated Calendar exposes a testable feature API');
if (api) {
  const sample = [
    { id: 'past', active: true, startDate: '2026-09-01', endDate: '2026-09-09', priority: 1 },
    { id: 'inside', active: true, startDate: '2026-09-15', endDate: '2026-09-15', priority: 2 },
    { id: 'boundary', active: true, startDate: '2026-09-20', endDate: '2026-09-20', priority: 3 },
    { id: 'outside', active: true, startDate: '2026-09-21', endDate: '2026-09-21', priority: 4 },
    { id: 'disabled', active: false, startDate: '2026-09-12', endDate: '2026-09-12', priority: 5 }
  ];
  const visible = api.filterEvents(sample, '2026-09-10', 10).map((event) => event.id);
  check(JSON.stringify(visible) === JSON.stringify(['inside', 'boundary']), 'date filter includes only the current 10-day Saudi window');
}

if (failures) {
  console.error(`\n${failures} Curated Calendar contract check(s) failed.`);
  process.exit(1);
}

console.log('\nAll Curated Calendar contract checks passed.');
