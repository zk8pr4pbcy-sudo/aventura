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

const page = fs.readFileSync(path.join(root, 'event-request', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'assets/css/event-request.css'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'assets/js/event-request.js'), 'utf8');
const calendarRuntime = fs.readFileSync(path.join(root, 'assets/js/curated-calendar.js'), 'utf8');
const contactPage = fs.readFileSync(path.join(root, 'contact.html'), 'utf8');

check(page.includes('data-event-request-form'), 'event request route contains its own form');
check(page.includes('<base href="../">'), 'event request route resolves shared Aventura assets from its isolated directory');
check(page.includes('assets/css/event-request.css'), 'event request route loads its isolated stylesheet');
check(page.includes('assets/js/event-request.js'), 'event request route loads its isolated runtime');
check(page.includes('name="robots" content="noindex, follow"'), 'utility request route stays out of search indexing');
check(page.includes('data-event-services'), 'event request route contains service selection');
check(page.includes('privacy_consent'), 'event request route requires privacy consent');
check(page.includes('request_type') && page.includes('curated_event'), 'event request identifies itself as a curated event request');
check(page.includes('event_id') && page.includes('event_title'), 'event context is submitted with the form');

for (const forbidden of ['contact-wizard.js', 'contact-request-data.js', 'contact-submission.js', 'contact-consent.js']) {
  check(!page.includes(forbidden), `event request route does not depend on ${forbidden}`);
}

check(!contactPage.includes('event-request.js'), 'main Aventura contact page remains independent from event request runtime');
check(!contactPage.includes('data-event-request-form'), 'main Aventura contact form remains structurally independent');
check(calendarRuntime.includes('event-request/?source=curated-calendar&event='), 'Curated Calendar CTA routes to the isolated event request route');
check(!calendarRuntime.includes('contact.html?source=curated-calendar'), 'Curated Calendar no longer routes event requests into the main form');
check(runtime.includes('data/curated-events.json'), 'event request reads the shared curated event data source');
check(runtime.includes('https://formsubmit.co/ajax/contact@aventuraksa.com'), 'event request owns its FormSubmit transport endpoint');
check(css.includes('.event-request-shell'), 'event request styling is isolated under feature classes');

await import('../assets/js/event-request.js');
const api = globalThis.AVENTURA_EVENT_REQUEST;
check(Boolean(api), 'event request exposes a testable feature API');

if (api) {
  const events = [
    { id: 'active', active: true, startDate: '2026-09-14', endDate: '2026-09-16' },
    { id: 'disabled', active: false, startDate: '2026-09-14', endDate: '2026-09-16' }
  ];
  check(api.findEvent(events, 'active')?.id === 'active', 'findEvent resolves an active curated event');
  check(api.findEvent(events, 'disabled') === null, 'findEvent excludes disabled events');
  check(api.isRequestable(events[0], '2026-09-10') === true, 'future/ongoing curated event is requestable');
  check(api.isRequestable(events[0], '2026-09-17') === false, 'expired curated event is not requestable');
  check(Boolean(api.formatDateRange(events[0], 'ar')), 'event date range formats for Arabic');
  check(Boolean(api.formatDateRange(events[0], 'en')), 'event date range formats for English');
  check(Boolean(api.formatDateRange(events[0], 'es')), 'event date range formats for Spanish');
}

if (failures) {
  console.error(`\n${failures} Event Request contract check(s) failed.`);
  process.exit(1);
}

console.log('\nAll Event Request contract checks passed.');
