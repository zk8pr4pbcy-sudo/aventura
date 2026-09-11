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

const legacyPage = fs.readFileSync(path.join(root, 'event-request', 'index.html'), 'utf8');
const legacyCss = fs.readFileSync(path.join(root, 'assets/css/event-request.css'), 'utf8');
const legacyRuntime = fs.readFileSync(path.join(root, 'assets/js/event-request.js'), 'utf8');
const calendarRuntime = fs.readFileSync(path.join(root, 'assets/js/curated-calendar.js'), 'utf8');
const requestPage = fs.readFileSync(path.join(root, 'jeddah-picks-request.html'), 'utf8');
const requestCss = fs.readFileSync(path.join(root, 'assets/css/jeddah-picks-request.css'), 'utf8');
const requestRuntime = fs.readFileSync(path.join(root, 'assets/js/jeddah-picks-request.js'), 'utf8');
const contactPage = fs.readFileSync(path.join(root, 'contact.html'), 'utf8');

check(legacyPage.includes('data-event-request-form'), 'legacy event request route remains intact for compatibility');
check(legacyPage.includes('name="robots" content="noindex, follow"'), 'legacy utility request route stays out of search indexing');
check(legacyCss.includes('.event-request-shell'), 'legacy event request styling remains isolated');
check(legacyRuntime.includes('data/curated-events.json'), 'legacy event request still reads the shared event data source');

check(requestPage.includes('data-jpr-form'), 'new Jeddah picks request page contains its own form');
check(requestPage.includes('assets/css/jeddah-picks-request.css'), 'new request page loads its isolated stylesheet');
check(requestPage.includes('assets/js/jeddah-picks-request.js'), 'new request page loads its isolated runtime');
check(requestPage.includes('name="robots" content="noindex, follow"'), 'new request utility remains noindex');
check(requestPage.includes('name="attendance_date"'), 'new request keeps attendance date as controlled submitted data');
check(requestPage.includes('data-jpr-date-control'), 'new request owns a dedicated event-date control');
check(requestPage.includes('data-jpr-services'), 'new request contains service selection');
check(requestPage.includes('privacy_consent'), 'new request requires privacy consent');
check(requestPage.includes('request_type') && requestPage.includes('curated_event'), 'new request identifies itself as a curated event request');
check(requestPage.includes('event_id') && requestPage.includes('event_title'), 'new request submits the event context');

for (const forbidden of ['contact-wizard.js', 'contact-request-data.js', 'contact-submission.js', 'contact-consent.js']) {
  check(!requestPage.includes(forbidden), `new Jeddah picks request does not depend on ${forbidden}`);
}

check(!contactPage.includes('jeddah-picks-request.js'), 'main Aventura contact page remains independent from Jeddah picks request runtime');
check(!contactPage.includes('data-jpr-form'), 'main Aventura contact form remains structurally independent');
check(calendarRuntime.includes('jeddah-picks-request.html?source=curated-calendar&event='), 'Curated Calendar CTA routes to the isolated Jeddah picks request page');
check(!calendarRuntime.includes('contact.html?source=curated-calendar'), 'Curated Calendar does not route event requests into the main contact form');
check(requestRuntime.includes('data/curated-events.json'), 'new request reads the shared curated event data source');
check(requestRuntime.includes('https://formsubmit.co/ajax/contact@aventuraksa.com'), 'new request owns its FormSubmit transport endpoint');
check(requestRuntime.includes('function availableDates'), 'new request owns event-day availability logic');
check(requestRuntime.includes('dates.length === 1'), 'single-day events render a fixed non-editable date state');
check(requestRuntime.includes('document.createElement("select")'), 'multi-day events render only controlled selectable event dates');
check(requestRuntime.includes('event.availableDates'), 'explicit per-event date lists are supported when an event is not continuous');
check(requestRuntime.includes('date >= start && date <= end'), 'past or out-of-range explicit event days are excluded');
check(requestCss.includes('.jpr-date-fixed') && requestCss.includes('.jpr-date-select'), 'fixed and multi-day date states have isolated styles');
check(requestCss.includes('.jpr-shell'), 'new request layout is isolated under Jeddah picks request classes');

await import('../assets/js/event-request.js');
const legacyApi = globalThis.AVENTURA_EVENT_REQUEST;
check(Boolean(legacyApi), 'legacy event request keeps its testable compatibility API');

if (legacyApi) {
  const events = [
    { id: 'active', active: true, startDate: '2026-09-14', endDate: '2026-09-16' },
    { id: 'disabled', active: false, startDate: '2026-09-14', endDate: '2026-09-16' }
  ];
  check(legacyApi.findEvent(events, 'active')?.id === 'active', 'legacy findEvent resolves an active curated event');
  check(legacyApi.findEvent(events, 'disabled') === null, 'legacy findEvent excludes disabled events');
  check(legacyApi.isRequestable(events[0], '2026-09-10') === true, 'future/ongoing curated event remains requestable');
  check(legacyApi.isRequestable(events[0], '2026-09-17') === false, 'expired curated event is not requestable');
}

if (failures) {
  console.error(`\n${failures} Event Request contract check(s) failed.`);
  process.exit(1);
}

console.log('\nAll Event Request contract checks passed.');
