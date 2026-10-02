import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ga4 = fs.readFileSync(path.join(root, 'assets/js/ga4.js'), 'utf8');
let failures = 0;

function check(condition, message) {
  if (condition) console.log(`✓ ${message}`);
  else { failures += 1; console.error(`✗ ${message}`); }
}

console.log('\nAventura GA4 journey contract\n');
check(ga4.includes('aventura_journey_session_v1'), 'session journey state exists');
check(ga4.includes('JOURNEY_TIMEOUT_MS = 30 * 60 * 1000'), '30-minute inactivity boundary exists');
check(ga4.includes('request_page_reached'), 'request page reach is tracked');
check(ga4.includes('request_form_started'), 'form start is tracked');
check(ga4.includes('seconds_to_type_select'), 'time to request type is tracked');
check(ga4.includes('seconds_to_submit'), 'time to submit is tracked');
check(ga4.includes('request_completed'), 'request completion is tracked');
check(ga4.includes('journey_pattern'), 'journey pattern is tracked');
check(ga4.includes('pages_before_contact'), 'pre-request page count is tracked');

if (failures) process.exit(1);
console.log('\nAventura GA4 journey contract passed.');
