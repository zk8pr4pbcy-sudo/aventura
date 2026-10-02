(() => {
  'use strict';

  const SOURCE_PARAM = 'avsrc';
  const ALLOWED_SOURCES = new Set([
    'chatgpt',
    'chatgpt-ad',
    'chatgpt-sponsored-agent'
  ]);

  const ALLOWED_TYPES = new Set([
    'experience',
    'event',
    'corporate',
    'service',
    'other'
  ]);

  const ALLOWED_DURATIONS = new Set([
    'short',
    'half-day',
    'full-day',
    'flexible'
  ]);

  const MAX_TEXT_LENGTH = 180;

  function cleanText(value, maxLength = MAX_TEXT_LENGTH) {
    if (typeof value !== 'string') return '';
    return value.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, maxLength);
  }

  function validDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '';
  }

  function validTime(value) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : '';
  }

  function validGuests(value) {
    const number = Number.parseInt(value, 10);
    return Number.isInteger(number) && number >= 1 && number <= 10000 ? String(number) : '';
  }

  function setField(form, name, value, allowedValues) {
    if (!value) return;
    if (allowedValues && !allowedValues.has(value)) return;

    const field = form.elements.namedItem(name);
    if (!field || typeof field.value === 'undefined') return;

    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function ensureHiddenField(form, name, value) {
    if (!value) return;

    let field = form.querySelector(`input[type="hidden"][name="${name}"]`);
    if (!field) {
      field = document.createElement('input');
      field.type = 'hidden';
      field.name = name;
      form.appendChild(field);
    }
    field.value = value;
  }

  function buildAgentSummary(params) {
    const rows = [
      ['Experience', cleanText(params.get('experience'))],
      ['Transport', cleanText(params.get('transport'))],
      ['Guide language', cleanText(params.get('guide_language'))],
      ['Guest profile', cleanText(params.get('guest_profile'))],
      ['Occasion', cleanText(params.get('occasion'))]
    ].filter(([, value]) => value);

    if (!rows.length) return '';
    return rows.map(([label, value]) => `${label}: ${value}`).join('\n');
  }

  function appendSummaryToMessage(form, summary) {
    if (!summary) return;
    const message = form.elements.namedItem('message');
    if (!message || typeof message.value === 'undefined') return;

    const marker = '[ChatGPT request details]';
    if (message.value.includes(marker)) return;

    const existing = message.value.trim();
    message.value = existing
      ? `${existing}\n\n${marker}\n${summary}`
      : `${marker}\n${summary}`;
    message.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function applySponsoredAgentPrefill() {
    const params = new URLSearchParams(window.location.search);
    const source = cleanText(params.get(SOURCE_PARAM), 60).toLowerCase();
    if (!ALLOWED_SOURCES.has(source)) return;

    const form = document.querySelector('[data-contact-form]');
    if (!form) return;

    const requestType = cleanText(params.get('type'), 40);
    const duration = cleanText(params.get('duration'), 40);

    setField(form, 'type', requestType, ALLOWED_TYPES);
    setField(form, 'date', validDate(cleanText(params.get('date'), 20)));
    setField(form, 'time', validTime(cleanText(params.get('time'), 10)));
    setField(form, 'duration', duration, ALLOWED_DURATIONS);
    setField(form, 'guests', validGuests(cleanText(params.get('guests'), 10)));

    const requestLanguage = cleanText(params.get('request_language'), 12).toLowerCase();
    if (['ar', 'en', 'es'].includes(requestLanguage)) {
      setField(form, 'request_language', requestLanguage);
    }

    ensureHiddenField(form, 'request_source', source);
    ensureHiddenField(form, 'agent_prefill_version', '1');

    const experience = cleanText(params.get('experience'));
    const transport = cleanText(params.get('transport'));
    const guideLanguage = cleanText(params.get('guide_language'));

    ensureHiddenField(form, 'agent_experience', experience);
    ensureHiddenField(form, 'agent_transport', transport);
    ensureHiddenField(form, 'agent_guide_language', guideLanguage);

    appendSummaryToMessage(form, buildAgentSummary(params));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applySponsoredAgentPrefill, { once: true });
  } else {
    applySponsoredAgentPrefill();
  }
})();
