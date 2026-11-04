// Hourly aggregate GA4 visit signal for Conan.
// Sessions are not individual visitors; GA4 reports can arrive late.
const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
const property = process.env.GA4_PROPERTY_ID;
const accessToken = process.env.GA4_ACCESS_TOKEN;
const dryRun = process.env.CONAN_DRY_RUN === 'true';
const activation = new Date('2026-11-03T01:00:00Z');
const now = new Date();
const issuesUrl = 'https://api.github.com/repos/' + repo + '/issues';
const headers = {
  Authorization: 'Bearer ' + token,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28'
};
function hourKey(date, tz) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', hourCycle: 'h23'
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return map.year + map.month + map.day + map.hour;
}
async function report() {
  const response = await fetch(
    'https://analyticsdata.googleapis.com/v1beta/properties/' + property + ':runReport',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: 'yesterday', endDate: 'today' }],
        dimensions: ['dateHour','country','city','sessionDefaultChannelGroup','sessionSourceMedium'].map(name => ({name})),
        metrics: [{ name: 'sessions' }],
        limit: '10000',
        keepEmptyRows: false
      })
    }
  );
  if (!response.ok) throw new Error('GA4 API HTTP ' + response.status);
  return response.json();
}
async function existingIssueTitles() {
  const response = await fetch(issuesUrl + '?state=all&sort=created&direction=desc&per_page=100', { headers });
  if (!response.ok) throw new Error('GitHub issue lookup HTTP ' + response.status);
  const issues = await response.json();
  return new Set(issues.map((i) => i.title));
}
async function createIssue(key, count, tz, breakdown) {
  const title = '[Conan Visit][' + key + '] زيارات موقع أفنتورا';
  const body = [
    'رصد كونان زيارات للموقع في ساعة مكتملة وفق توقيت Google Analytics.',
    '',
    '**الساعة (توقيت GA4):** ' + key.slice(0,4) + '-' + key.slice(4,6) +
      '-' + key.slice(6,8) + '، ' + key.slice(8,10) + ':00–:59',
    '**المنطقة الزمنية:** ' + tz,
    '**الجلسات المرصودة:** ' + count,
    '',
    '### الموقع الجغرافي ومصدر الزيارة (بيانات مجمعة)',
    '| الدولة | المدينة | القناة | المصدر / الوسيط | الجلسات |',
    '| --- | --- | --- | --- | ---: |',
    ...breakdown.map(r => '| ' + [r.country,r.city,r.channel,r.source].map(v => String(v).replace(/[|\r\n<>`]/g,' ').slice(0,80)).join(' | ') + ' | ' + r.sessions + ' |'),
    '',
    'الجلسة ليست بالضرورة زائرًا فريدًا. قد تصل البيانات متأخرة أو تتغير لاحقًا.',
    'لا يتضمن هذا التنبيه بيانات تعريف شخصية، ولا يثبت تقديم طلب حجز.',
    '',
    '[سجل التشغيل](https://github.com/' + repo + '/actions/runs/' +
      process.env.GITHUB_RUN_ID + ')'
  ].join('\n');
  const response = await fetch(issuesUrl, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body })
  });
  if (!response.ok) throw new Error('GitHub issue creation HTTP ' + response.status);
  console.log('Created hourly visit alert for ' + key);
}
async function main() {
  if (!repo || !token || !property || !accessToken) throw new Error('Missing required environment');
  const result = await report();
  const tz = result.metadata?.timeZone || 'Asia/Riyadh';
  const activatedHour = hourKey(activation, tz);
  const lastCompletedHour = hourKey(new Date(now.getTime() - 3600000), tz);
  const earliestHour = hourKey(new Date(now.getTime() - 24 * 3600000), tz);
  const detailRows = (result.rows || []).map((r) => ({
    hour: r.dimensionValues?.[0]?.value || '',
    sessions: Number(r.metricValues?.[0]?.value || 0),
    country: r.dimensionValues?.[1]?.value || '(not set)',
    city: r.dimensionValues?.[2]?.value || '(not set)',
    channel: r.dimensionValues?.[3]?.value || '(not set)',
    source: r.dimensionValues?.[4]?.value || '(not set)'
  })).filter((r) => /^\d{10}$/.test(r.hour) && Number.isFinite(r.sessions) &&
    r.sessions > 0 && r.hour >= activatedHour &&
    r.hour >= earliestHour && r.hour <= lastCompletedHour)
    .sort((a,b) => a.hour.localeCompare(b.hour));
  const grouped = new Map();
  for (const r of detailRows) {
    if (!grouped.has(r.hour)) grouped.set(r.hour, {hour:r.hour,sessions:0,breakdown:[]});
    const g=grouped.get(r.hour); g.sessions+=r.sessions; g.breakdown.push(r);
  }
  const rows=[...grouped.values()].sort((a,b)=>a.hour.localeCompare(b.hour));
  console.log('GA4 hourly query succeeded; positive eligible hours: ' + rows.length);
  const existing = await existingIssueTitles();
  const unseen = rows.filter((r) =>
    !existing.has('[Conan Visit][' + r.hour + '] زيارات موقع أفنتورا'));
  const { appendFileSync } = await import('node:fs');
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      '# كونان | مراقبة الزيارات كل ساعة\n\n' +
      '- الساعات التي ظهرت بها جلسات في آخر 24 ساعة منذ تفعيل المراقبة: **' +
        rows.length + '**\n' +
      '- الساعات الجديدة غير المبلغ عنها: **' + unseen.length + '**\n' +
      '- توقيت بيانات GA4: **' + tz + '**\n' +
      '- وضع الاختبار دون إنشاء تنبيهات: **' + (dryRun ? 'نعم' : 'لا') + '**\n\n' +
      'التنبيه عن جلسات مجمعة، وليس عن هوية زائر. بيانات GA4 قد تتأخر.\n');
  }
  if (dryRun) {
    console.log('Dry run: would alert on ' + unseen.length + ' hourly buckets.');
    return;
  }
  // Limit catch-up alerts to three per run to prevent floods on first deployment.
  for (const row of unseen.slice(-3)) await createIssue(row.hour, row.sessions, tz, row.breakdown);
  console.log('Conan hourly visit check finished.');
}
main().catch((e) => { console.error(e.message); process.exitCode = 1; });
