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
  vm.runInNewContext(source, { window, FormData });
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

// A verified public form key switches delivery once, without duplicate fallback sends.
const payload = new FormData();
for (const [name, value] of Object.entries({access_key:'test-public-key', email:'guest@example.com', _replyto:'guest@example.com', _subject:'طلب · AVE-TEST', _url:'https://aventuraksa.com/contact.html', _template:'table', _honey:'', submissionChannel:'email', request_reference:'AVE-TEST', request_language:'ar', request_summary:'الساعة الذهبية: قارب خاص، شخصان، ساعة واحدة', requestDuration:'60 minutes', privacy_consent:'on'})) payload.set(name, value);
let calls = 0;
const verified = transport(async (url, options) => {
  calls++;
  assert.equal(url, 'https://api.web3forms.com/submit');
  assert.equal(options.body.get('subject'), payload.get('_subject'));
  assert.equal(options.body.get('replyto'), 'guest@example.com');
  assert.equal(options.body.get('source_url'), payload.get('_url'));
  for (const name of ['access_key', 'request_reference', 'request_language', 'request_summary', 'requestDuration', 'privacy_consent']) assert.equal(options.body.get(name), payload.get(name));
  for (const name of ['_subject', '_replyto', '_template', '_honey', 'submissionChannel']) assert.equal(options.body.has(name), false);
  return {ok:true, status:200, json:async () => ({success:true})};
});
await verified.api.sendEmail(payload);
assert.equal(calls, 1);
payload.set('_honey', 'bot');
await assert.rejects(verified.api.sendEmail(payload), error => error.code === 'EMAIL_REJECTED');
assert.equal(calls, 1, 'honeypot blocks delivery');
payload.set('_honey', '');
const unavailable = transport(async () => { calls++; return {ok:false, status:500}; });
await assert.rejects(unavailable.api.sendEmail(payload), error => error.code === 'EMAIL_SERVICE_UNAVAILABLE');
assert.equal(calls, 2, 'provider failure does not send a duplicate to another provider');
const original = transport(async (url, options) => {
  assert.equal(url, original.api.formSubmitEndpoint);
  assert.equal(options.body, payload);
  return {ok:true, status:200, json:async () => ({success:true})};
});
payload.delete('access_key');
await original.api.sendEmail(payload);
console.log('Verified provider routing, request preservation and honeypot tests passed.');
