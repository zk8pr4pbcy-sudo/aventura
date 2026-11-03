// Conan: read-only GA4 aggregate monitoring. No personal identifiers or credentials are stored.
const property = process.env.GA4_PROPERTY_ID;
const token = process.env.GA4_ACCESS_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;
const runUrl = 'https://github.com/' + repo + '/actions/runs/' + process.env.GITHUB_RUN_ID;
const issueToken = process.env.GITHUB_TOKEN;
const issueApi = 'https://api.github.com/repos/' + repo + '/issues';
const events = ['journey_page_viewed', 'request_page_reached', 'request_form_started',
  'request_type_selected', 'request_channel_selected', 'request_submit_attempt',
  'request_completed'];
const fmt = new Intl.NumberFormat('ar-SA-u-nu-latn');
const n = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
const clean = (v) => String(v ?? '').replace(/[\r\n|<>`]/g, ' ').slice(0, 90);
const num = (v) => fmt.format(n(v));

async function ga4(dimensions, metrics, startDate, endDate, filter, limit = 10) {
  if (!property || !token) throw new Error('Missing GA4 access token or property ID');
  const body = {
    dateRanges: [{ startDate, endDate }],
    dimensions: dimensions.map((name) => ({ name })),
    metrics: metrics.map((name) => ({ name })),
    limit: String(limit),
    keepEmptyRows: false
  };
  if (filter) body.dimensionFilter = filter;
  const url = 'https://analyticsdata.googleapis.com/v1beta/properties/' +
    property + ':runReport';
  let response;
  for (let attempt = 0; attempt < 2; attempt++) {
    response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (response.ok) return response.json();
    if (![429, 500, 502, 503, 504].includes(response.status) || attempt) break;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error('GA4 Data API returned HTTP ' + response.status);
}
function metric(report, key) {
  const i = (report.metricHeaders || []).findIndex((h) => h.name === key);
  return i < 0 ? 0 : n(report.rows?.[0]?.metricValues?.[i]?.value);
}
function pairs(report, metricName, min = 0) {
  const i = (report.metricHeaders || []).findIndex((h) => h.name === metricName);
  return (report.rows || []).map((r) => ({
    label: r.dimensionValues?.[0]?.value || '(not set)',
    value: n(r.metricValues?.[i]?.value)
  })).filter((r) => r.value >= min).sort((a, b) => b.value - a.value);
}
function table(lines, title, rows, label) {
  lines.push('### ' + title, '', '| ' + label + ' | العدد |', '| --- | ---: |');
  if (!rows.length) lines.push('| لا توجد بيانات كافية | — |');
  else for (const row of rows.slice(0, 8)) {
    lines.push('| ' + clean(row.label) + ' | ' + num(row.value) + ' |');
  }
  lines.push('');
}
async function notify(code, title, description) {
  if (!issueToken || !repo) throw new Error('Missing GitHub token/repository for alert');
  const key = '[Conan GA4][' + code + ']';
  const headers = {
    Authorization: 'Bearer ' + issueToken,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  // Deduplicate by stable alert code while an issue is open.
  const existing = await fetch(issueApi + '?state=open&per_page=100', { headers });
  if (!existing.ok) throw new Error('GitHub issues lookup HTTP ' + existing.status);
  const issues = await existing.json();
  if (issues.some((issue) => issue.title?.startsWith(key))) {
    console.log('Existing open alert: ' + code);
    return;
  }
  const response = await fetch(issueApi, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: key + ' ' + title,
      body: description + '\n\n[مراجعة تشغيل كونان](' + runUrl + ')\n\n' +
        'تنبيه آلي يعتمد على بيانات GA4 المجمّعة؛ ليس إثباتًا لطلب حجز أو لهوية زائر.',
      assignees: ['zk8pr4pbcy-sudo']
    })
  });
  if (!response.ok) throw new Error('GitHub alert creation HTTP ' + response.status);
  console.log('Created alert: ' + code);
}
async function main() {
  const names = ['sessions', 'activeUsers', 'screenPageViews'];
  const filter = {
    filter: { fieldName: 'eventName', inListFilter: { values: events } }
  };
  const [week, prior, yesterday, channels, cities, devices, pages, funnel, daily] =
    await Promise.all([
      ga4([], names, '7daysAgo', 'yesterday'),
      ga4([], names, '14daysAgo', '8daysAgo'),
      ga4([], names, 'yesterday', 'yesterday'),
      ga4(['sessionDefaultChannelGroup'], ['sessions'], '7daysAgo', 'yesterday'),
      ga4(['city'], ['activeUsers'], '7daysAgo', 'yesterday'),
      ga4(['deviceCategory'], ['activeUsers'], '7daysAgo', 'yesterday'),
      ga4(['pagePath'], ['screenPageViews'], '7daysAgo', 'yesterday'),
      ga4(['eventName'], ['eventCount'], '7daysAgo', 'yesterday', filter, 20),
      ga4(['date'], ['sessions'], '7daysAgo', 'yesterday', undefined, 10)
    ]);
  const sessions = metric(week, 'sessions');
  const previousSessions = metric(prior, 'sessions');
  const yesterdaySessions = metric(yesterday, 'sessions');
  const funnelRows = pairs(funnel, 'eventCount');
  const funnelMap = Object.fromEntries(funnelRows.map((x) => [x.label, x.value]));
  const report = [
    '# كونان | تقرير أفنتورا من Google Analytics 4',
    '',
    '**الفترة:** آخر 7 أيام مكتملة حتى أمس، بتوقيت موقع GA4. ' +
      'المقارنة مع الأيام السبعة السابقة.',
    '',
    '| المؤشر | آخر 7 أيام | 7 أيام سابقة | أمس |',
    '| --- | ---: | ---: | ---: |',
    '| الجلسات | ' + num(sessions) + ' | ' + num(previousSessions) +
      ' | ' + num(yesterdaySessions) + ' |',
    '| المستخدمون النشطون | ' + num(metric(week, 'activeUsers')) + ' | ' +
      num(metric(prior, 'activeUsers')) + ' | ' +
      num(metric(yesterday, 'activeUsers')) + ' |',
    '| مشاهدات الصفحات | ' + num(metric(week, 'screenPageViews')) + ' | ' +
      num(metric(prior, 'screenPageViews')) + ' | ' +
      num(metric(yesterday, 'screenPageViews')) + ' |',
    ''
  ];
  table(report, 'مصادر الزيارات (القنوات)', pairs(channels, 'sessions'), 'القناة');
  // Suppress tiny city groups to avoid unnecessarily exposing low-volume locations.
  table(report, 'المدن (3 مستخدمين نشطين أو أكثر)', pairs(cities, 'activeUsers', 3), 'المدينة');
  table(report, 'الأجهزة', pairs(devices, 'activeUsers'), 'الجهاز');
  table(report, 'الصفحات الأكثر مشاهدة', pairs(pages, 'screenPageViews'), 'المسار');
  table(report, 'مؤشرات مسار الطلب (أحداث، لا تعادل عملاء مؤكدين)',
    events.map((label) => ({ label, value: funnelMap[label] || 0 })), 'الحدث');
  table(report, 'الجلسات حسب اليوم', pairs(daily, 'sessions'), 'تاريخ GA4');
  report.push('---', '',
    'النتائج مجمّعة وقد تتأخر بسبب معالجة GA4 أو الموافقة على التتبع أو أدوات الحجب. ' +
    'لا تتضمن هوية الزائر أو مسارًا فرديًا مفصلًا. الأرقام لا تمثل جميع زوار الموقع بالضرورة.',
    '',
    'هذا التقرير ظاهر في ملخص GitHub Actions للمستودع؛ لا تنشر بيانات شخصية هنا.');
  const { appendFileSync } = await import('node:fs');
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, report.join('\n') + '\n');
  }
  console.log('Conan GA4 aggregate report succeeded. Open the job summary.');
  const dryRun = process.env.CONAN_DRY_RUN === 'true';
  const alerts = [];
  if (previousSessions >= 20 && sessions <= previousSessions * 0.5) {
    alerts.push(['traffic-drop', 'انخفاض كبير في الزيارات',
      'انخفضت الجلسات في آخر 7 أيام بنسبة 50% أو أكثر مقارنة بالأسبوع السابق. ' +
      'تحقق من المصدر والتتبع قبل اتخاذ قرار.']);
  }
  if (previousSessions >= 20 && yesterdaySessions === 0) {
    alerts.push(['no-sessions', 'لم تُسجّل جلسات أمس',
      'لم تظهر جلسات في تقرير أمس رغم وجود حجم زيارات سابق كافٍ. ' +
      'تحقق من GA4 والموقع وتأخر المعالجة.']);
  }
  if ((funnelMap.request_form_started || 0) >= 5 &&
      (funnelMap.request_completed || 0) === 0) {
    alerts.push(['form-dropoff', 'بدء نماذج دون اكتمال مرصود',
      'رُصدت خمسة أحداث بدء نموذج على الأقل خلال 7 أيام دون حدث إكمال. ' +
      'قد يكون السبب انخفاض التحويل أو مشكلة في القياس.']);
  }
  // Do not claim a booking: GA4 completion is an event, not a verified lead.
  const completedYesterday = await ga4(['eventName'], ['eventCount'],
    'yesterday', 'yesterday',
    { filter: { fieldName: 'eventName',
      stringFilter: { matchType: 'EXACT', value: 'request_completed' } } }, 5);
  if (pairs(completedYesterday, 'eventCount').some((x) => x.value > 0)) {
    alerts.push(['request-event', 'رُصد حدث إكمال طلب أمس',
      'ظهر حدث request_completed في بيانات أمس. راجع طلبات أفنتورا الفعلية ' +
      'للتحقق من وصول الطلب، ولا تعتبر الحدث حجزًا مؤكدًا.']);
  }
  if (dryRun) {
    console.log('Dry run: ' + alerts.map((x) => x[0]).join(', '));
    return;
  }
  for (const [code, title, body] of alerts) await notify(code, title, body);
  console.log('Conan alert evaluation completed (' + alerts.length + ' rules triggered).');
}
main().catch((error) => {
  console.error('Conan GA4 monitoring failed: ' + error.message);
  process.exitCode = 1;
});
