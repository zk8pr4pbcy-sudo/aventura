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
const fullPage = fs.readFileSync(path.join(root, 'jeddah-picks', 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'assets/js/curated-calendar.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'assets/css/curated-calendar.css'), 'utf8');
const pageCss = fs.readFileSync(path.join(root, 'assets/css/jeddah-picks.css'), 'utf8');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/curated-events.json'), 'utf8'));

check(index.includes('data-curated-calendar'), 'home page contains the Curated Calendar section');
check(index.includes('assets/css/curated-calendar.css'), 'home page loads the isolated Curated Calendar stylesheet');
check(index.includes('assets/js/curated-calendar.js'), 'home page loads the isolated Curated Calendar runtime');

const introPosition = index.indexOf('home-intro-editorial');
const calendarPosition = index.indexOf('data-curated-calendar');
const experiencesPosition = index.indexOf('id="experiences"');
check(introPosition !== -1 && calendarPosition > introPosition && calendarPosition < experiencesPosition, 'Curated Calendar sits after the Aventura approach and before core experiences');

check(!app.includes('curated-calendar') && !app.includes('CURATED_CALENDAR'), 'app.js does not own Curated Calendar behavior');
check(runtime.includes('HOME_LIMIT = 4'), 'home page editorial selection is capped at four events');
check(runtime.includes('allVisible.slice(0, HOME_LIMIT)'), 'featured mode renders only the four priority events');
check(runtime.includes('windowDays') || runtime.includes('filterEvents'), 'Curated Calendar runtime owns its date-window behavior');
check(runtime.includes('Asia/Riyadh'), 'Curated Calendar uses the Saudi timezone');
check(runtime.includes('ca-gregory') && runtime.includes('calendar: "gregory"'), 'Curated Calendar explicitly renders Gregorian dates in every language');
check(runtime.includes('jeddah-picks/'), 'home calendar links to the isolated full Jeddah picks route');
check(runtime.includes('jeddah-picks/request/?source=curated-calendar&event='), 'event cards route into the isolated Jeddah picks request flow');
check(runtime.includes('formatEventTime'), 'event cards preserve event-time guidance');
check(!runtime.includes('mealSuggestion'), 'event cards do not render a separate meal recommendation block');
check(css.includes('.curated-card'), 'Curated Calendar styling is isolated under feature classes');
check(css.includes('.curated-card__time'), 'shared Curated Calendar styles support event timing');

check(fullPage.includes('<base href="../">'), 'full Jeddah picks page resolves shared assets from its isolated route');
check(fullPage.includes('https://aventuraksa.com/jeddah-picks/'), 'full Jeddah picks page owns the clean canonical route');
check(fullPage.includes('data-curated-mode="all"'), 'full Jeddah picks page renders all curated events in the window');
check(fullPage.includes('assets/css/jeddah-picks.css'), 'full Jeddah picks page loads its dedicated page stylesheet');
check(!fullPage.includes('data-event-filter') && !fullPage.includes('curated-filter'), 'full Jeddah picks page has no unnecessary filters');
check(pageCss.includes('.curated-calendar--page'), 'full-page layout remains isolated under Jeddah picks page classes');

check(data.windowDays === 14, 'editorial window is exactly 14 days');
check(Array.isArray(data.events) && data.events.length >= 1, 'event data contains curated entries');

for (const lang of ['ar', 'en', 'es']) {
  check(Boolean(data.ui?.[lang]?.title), `section UI includes ${lang} title`);
  check(Boolean(data.ui?.[lang]?.cta), `section UI includes ${lang} CTA`);
  check(Boolean(data.ui?.[lang]?.viewAll), `section UI includes ${lang} full-page CTA`);
  check(Boolean(data.ui?.[lang]?.pageTitle), `full page includes ${lang} title copy`);
  check(Boolean(data.ui?.[lang]?.planLabel), `flexible-options label exists in ${lang}`);
}

for (const event of data.events || []) {
  check(/^\d{4}-\d{2}-\d{2}$/.test(event.startDate || ''), `${event.id}: valid start date`);
  check(/^\d{4}-\d{2}-\d{2}$/.test(event.endDate || ''), `${event.id}: valid end date`);
  check(event.endDate >= event.startDate, `${event.id}: end date does not precede start date`);
  check(/^https:\/\//.test(event.sourceUrl || ''), `${event.id}: source uses HTTPS`);
  check(String(event.image || '').startsWith('assets/images/'), `${event.id}: image stays on the Aventura origin`);
  if (event.startTime) check(/^\d{2}:\d{2}$/.test(event.startTime), `${event.id}: valid start time`);
  if (event.endTime) check(/^\d{2}:\d{2}$/.test(event.endTime), `${event.id}: valid end time`);
  if (event.doorsTime) check(/^\d{2}:\d{2}$/.test(event.doorsTime), `${event.id}: valid doors time`);
  check(!Object.prototype.hasOwnProperty.call(event, 'mealSuggestion'), `${event.id}: separate meal recommendation is removed`);
  for (const lang of ['ar', 'en', 'es']) {
    check(Boolean(event.title?.[lang]), `${event.id}: ${lang} title exists`);
    check(Boolean(event.location?.[lang]), `${event.id}: ${lang} location exists`);
    check(Boolean(event.category?.[lang]), `${event.id}: ${lang} category exists`);
    check(Boolean(event.aventuraPlan?.[lang]), `${event.id}: ${lang} flexible options exist`);
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
    { id: 'boundary', active: true, startDate: '2026-09-23', endDate: '2026-09-23', priority: 3 },
    { id: 'outside', active: true, startDate: '2026-09-24', endDate: '2026-09-24', priority: 4 },
    { id: 'disabled', active: false, startDate: '2026-09-12', endDate: '2026-09-12', priority: 5 }
  ];
  const visible = api.filterEvents(sample, '2026-09-10', 14).map((event) => event.id);
  check(JSON.stringify(visible) === JSON.stringify(['inside', 'boundary']), 'date filter includes only the current 14-day Saudi window');
  check(Boolean(api.formatEventTime({ startTime: '20:00', endTime: '22:00' }, 'ar')), 'event time formatting works for time-aware planning');
}

if (failures) {
  console.error(`\n${failures} Curated Calendar contract check(s) failed.`);
  process.exit(1);
}

console.log('\nAll Curated Calendar contract checks passed.');
