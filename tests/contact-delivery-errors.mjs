import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('assets/js/contact-submission.js', 'utf8');
function transport(fetch) {
  let expire;
  let timeoutMs;
  let cleared = false;
  const window = {
    fetch, AbortController,
    setTimeout(callback, ms) { expire = callback; timeoutMs = ms; return 1; },
    clearTimeout() { cleared = true; }
  };
  vm.runInNewContext(source, { window });
  return { api:window.AVENTURA_CONTACT_SUBMISSION, expire:() => expire(),
    timeout:() => timeoutMs, cleared:() => cleared };
}
for (const status of [429, 500, 522]) {
  let parsed = false;
  const item = transport(async () => ({ok:false, status, json:async () => { parsed = true; return {}; }}));
  await assert.rejects(item.api.sendEmail({}), error => error.code === 'EMAIL_SERVICE_UNAVAILABLE' && error.status === status);
  assert.equal(parsed, false, 'outage responses need not be JSON');
  assert.equal(item.cleared(), true);
}
for (const body of [{success:false}, {success:'false'}]) {
  const item = transport(async () => ({ok:true, status:200, json:async () => body}));
  await assert.rejects(item.api.sendEmail({}), error => error.code === 'EMAIL_REJECTED');
}
for (const body of [{}, {message:'not accepted'}, null]) {
  const item = transport(async () => ({ok:true, status:200, json:async () => body}));
  await assert.rejects(item.api.sendEmail({}), error => error.code === 'EMAIL_INVALID_RESPONSE');
}
const html = transport(async () => ({ok:true, status:200, json:async () => { throw new SyntaxError('HTML'); }}));
await assert.rejects(html.api.sendEmail({}), error => error.code === 'EMAIL_INVALID_RESPONSE');
for (const success of [true, 'true']) {
  const item = transport(async () => ({ok:true, status:200, json:async () => ({success})}));
  assert.equal((await item.api.sendEmail({})).success, success);
  assert.equal(item.cleared(), true);
}
const network = transport(async () => { throw new TypeError('Failed to fetch'); });
await assert.rejects(network.api.sendEmail({}), error => error.code === 'EMAIL_NETWORK');
let signal;
const timeout = transport((url, options) => { signal = options.signal; return new Promise(() => {}); });
const pending = timeout.api.sendEmail({});
assert.equal(timeout.timeout(), 25000);
timeout.expire();
await assert.rejects(pending, error => error.code === 'EMAIL_TIMEOUT');
assert.equal(signal.aborted, true);
assert.equal(timeout.cleared(), true);
console.log('Email delivery error, false-success and timeout tests passed.');
