import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const translationsPath = path.join(root, 'assets/js/translations.js');
const smokePath = path.join(root, 'tests/smoke.mjs');
const browserSmokePath = path.join(root, 'tests/browser-smoke.mjs');
const overrideToken = 'assets/js/experience-copy-overrides.js';

const approved = {
  en: {
    'experiences.historicItem3': 'Saudi coffee, dates and selected heritage stops',
    'experiences.readyHistoricText': 'All walking formats include Saudi coffee, dates and a licensed guide. Any additional paid entries are confirmed separately.',
    'experiences.stbStep3Text': 'A licensed guided walk with Saudi coffee, dates and selected heritage stops.',
    'experiences.signature1Text': 'A relaxed resort stay, a Yacht Club sunset stop and a licensed guided walk through Historic Jeddah.',
    'experiences.stbLead': 'A relaxed resort stay, a sunset stop at Jeddah Yacht Club and a licensed guided evening through Historic Jeddah—one unhurried day.',
    'journey.seaToBalad.text': 'A relaxed resort stay, a Yacht Club pause and a guided evening in Historic Jeddah become one private day with a clear change of scene.',
    'world.historic.text': 'Before the walk begins, your guide reads your interests and adjusts the pace, turning each alley into a personal way into Historic Jeddah.',
    'world.historic.note': 'We do not rush the story. We leave room to notice the Roshan, stone, sounds and small details.',
    'world.historic.step1Title': 'Meet your guide',
    'world.historic.step1Text': 'Your guide is more than a voice telling stories; they are a living memory that knows every doorway by name and every alley by its story.',
    'world.historic.step2Title': 'Read the Roshan',
    'world.historic.step2Text': 'The Roshan is not understood from the street alone. Its shadows shift with the hours, and its carving holds a story left untold.',
    'world.historic.step3Text': 'The walk ends where time—not the schedule—decides: a cup of Saudi coffee, a date, and enough quiet to hear the city.'
  },
  ar: {
    'experiences.historicItem3': 'القهوة السعودية والتمر ومحطات تراثية مختارة',
    'experiences.readyHistoricText': 'تشمل جميع جولات المشي القهوة السعودية والتمر ومرشدًا سياحيًا مرخصًا، وتُؤكد أي رسوم دخول إضافية بشكل منفصل.',
    'experiences.stbStep3Text': 'جولة مع مرشد سياحي مرخص تشمل القهوة السعودية والتمر ومحطات تراثية مختارة.',
    'experiences.signature1Text': 'وقت هادئ في المنتجع، وتوقف عند الغروب في نادي جدة لليخوت، وجولة مرخصة في جدة التاريخية.',
    'experiences.stbLead': 'تجربة تبدأ بوقت هادئ في المنتجع، وتوقفًا عند الغروب في نادي جدة لليخوت، وأمسية بجولة مرخصة في جدة التاريخية ضمن يوم واحد مريح.',
    'world.historic.text': 'قبل أن تبدأ الجولة، يقرأ مرشدك اهتماماتك ويطوّع الإيقاع، ليتحوّل الزقاق إلى مدخل شخصي لجدة التاريخية.',
    'world.historic.note': 'لا نستعجل الحكاية. نترك مساحة لملاحظة الروشان والحجر والأصوات والتفاصيل الصغيرة.',
    'world.historic.step1Title': 'تعرّف إلى مرشدك',
    'world.historic.step1Text': 'مرشدك ليس صوتًا يروي فقط، بل ذاكرة تعرف كل باب باسمه، وكل زقاق بحكايته.',
    'world.historic.step2Title': 'اقرأ الروشان',
    'world.historic.step2Text': 'الروشان لا يُرى من الشارع وحده. ظلاله تتبدّل مع الوقت، ونقشه يُخفي حكاية لا تُروى.',
    'world.historic.step3Text': 'تختم الجولة حيث يشاء الوقت لا الجدول: فنجان قهوة، وتمرة، وصمت يكفي لسماع المدينة.'
  },
  es: {
    'experiences.historicItem3': 'Café saudí, dátiles y paradas patrimoniales seleccionadas',
    'experiences.readyHistoricText': 'Todos los recorridos a pie incluyen café saudí, dátiles y un guía autorizado. Las entradas adicionales de pago se confirman por separado.',
    'experiences.stbStep3Text': 'Paseo con guía autorizado, café saudí, dátiles y paradas patrimoniales seleccionadas.',
    'world.historic.text': 'Antes de empezar, tu guía interpreta tus intereses y adapta el ritmo, haciendo de cada callejón una entrada personal a la Yeda Histórica.',
    'world.historic.note': 'No apresuramos la historia. Dejamos espacio para observar el roshan, la piedra, los sonidos y los pequeños detalles.',
    'world.historic.step1Title': 'Conoce a tu guía',
    'world.historic.step1Text': 'Tu guía no es solo una voz que cuenta historias; es una memoria viva que conoce cada puerta por su nombre y cada callejón por su historia.',
    'world.historic.step2Title': 'Lee el roshan',
    'world.historic.step2Text': 'El roshan no se comprende solo desde la calle. Sus sombras cambian con las horas y sus tallas guardan una historia que queda sin contar.',
    'world.historic.step3Text': 'El recorrido termina donde lo decide el tiempo, no el horario: una taza de café saudí, un dátil y el silencio suficiente para escuchar la ciudad.'
  }
};

let source = fs.readFileSync(translationsPath, 'utf8');
let language = null;
const counts = Object.fromEntries(Object.entries(approved).map(([lang, values]) => [lang, Object.fromEntries(Object.keys(values).map((key) => [key, 0]))]));

const lines = source.split('\n').map((line) => {
  const languageMatch = line.match(/^  "(en|ar|es)": \{$/);
  if (languageMatch) language = languageMatch[1];
  if (!language || !approved[language]) return line;

  const keyMatch = line.match(/^    "([^"]+)": /);
  if (!keyMatch) return line;
  const key = keyMatch[1];
  if (!(key in approved[language])) return line;

  counts[language][key] += 1;
  const comma = line.trimEnd().endsWith(',') ? ',' : '';
  return `    ${JSON.stringify(key)}: ${JSON.stringify(approved[language][key])}${comma}`;
});

for (const [lang, keys] of Object.entries(counts)) {
  for (const [key, count] of Object.entries(keys)) {
    if (count !== 1) throw new Error(`${lang}.${key}: expected exactly one translation entry, found ${count}`);
  }
}

fs.writeFileSync(translationsPath, lines.join('\n'));

let touchedPages = 0;
for (const file of fs.readdirSync(root).filter((name) => name.endsWith('.html'))) {
  const filePath = path.join(root, file);
  let html = fs.readFileSync(filePath, 'utf8');
  if (!html.includes(overrideToken)) continue;
  html = html.replace(/^\s*<script\s+src="assets\/js\/experience-copy-overrides\.js(?:\?v=[^"]+)?"\s+defer><\/script>\s*\n/gm, '');
  if (html.includes(overrideToken)) throw new Error(`${file}: experience copy override reference remains`);
  fs.writeFileSync(filePath, html);
  touchedPages += 1;
}
if (!touchedPages) throw new Error('No HTML pages referenced the experience copy override module');

let smoke = fs.readFileSync(smokePath, 'utf8');
smoke = smoke.replace("const experienceCopyOverrides = read('assets/js/experience-copy-overrides.js');\n", '');
smoke = smoke.replace("const legacyLaunchRecoveryPath = path.join(root, 'assets/js/launch-v2-recovery.js');", "const legacyLaunchRecoveryPath = path.join(root, 'assets/js/launch-v2-recovery.js');\nconst legacyExperienceCopyOverridesPath = path.join(root, 'assets/js/experience-copy-overrides.js');");
smoke = smoke.replace("check(collection.includes('assets/js/experience-copy-overrides.js?v=20260910'), 'collection loads the focused experience copy module');\n", "check(!fs.existsSync(legacyExperienceCopyOverridesPath), 'experience copy override module has been removed');\ncheck(!collection.includes('experience-copy-overrides.js'), 'collection has no experience copy override script');\n");
smoke = smoke.replace("check(experienceCopyOverrides.includes('world.historic.step1Title'), 'experience copy overrides remain isolated from boutique behavior');", "check(translations.includes('\\\"experiences.readyHistoricText\\\": \\\"تشمل جميع جولات المشي القهوة السعودية والتمر ومرشدًا سياحيًا مرخصًا، وتُؤكد أي رسوم دخول إضافية بشكل منفصل.\\\"'), 'approved Arabic Historic Jeddah copy lives in translations');\ncheck(translations.includes('\\\"world.historic.step1Title\\\": \\\"Conoce a tu guía\\\"'), 'approved Spanish Historic Jeddah copy lives in translations');");
smoke = smoke.replace("check(!html.includes('assets/js/launch-v2-recovery.js'), `${file}: legacy launch recovery reference is absent`);", "check(!html.includes('assets/js/launch-v2-recovery.js'), `${file}: legacy launch recovery reference is absent`);\n  check(!html.includes('assets/js/experience-copy-overrides.js'), `${file}: experience copy override reference is absent`);");
if (smoke.includes('experienceCopyOverrides')) throw new Error('Smoke test still references experienceCopyOverrides variable');
fs.writeFileSync(smokePath, smoke);

let browserSmoke = fs.readFileSync(browserSmokePath, 'utf8');
const anchor = "  for (const { lang, query } of languageCases) {\n    const { page } = await openChecked(browser, `/experience-desert.html${query}`, `desert ${lang}`);";
if (!browserSmoke.includes('historic detail ${lang}: approved guide title is localized')) {
  if (!browserSmoke.includes(anchor)) throw new Error('Historic browser test insertion anchor not found');
  const historicBlock = `  const historicGuideTitles = { ar: 'تعرّف إلى مرشدك', en: 'Meet your guide', es: 'Conoce a tu guía' };\n  for (const { lang, query } of languageCases) {\n    const { page } = await openChecked(browser, \`/experience-historic-jeddah.html\${query}\`, \`historic detail \${lang}\`);\n    const guideTitle = (await page.locator('[data-i18n="world.historic.step1Title"]').textContent() || '').trim();\n    check(guideTitle === historicGuideTitles[lang], \`historic detail \${lang}: approved guide title is localized\`);\n    await page.close();\n  }\n\n`;
  browserSmoke = browserSmoke.replace(anchor, historicBlock + anchor);
}
fs.writeFileSync(browserSmokePath, browserSmoke);

const updatedTranslations = fs.readFileSync(translationsPath, 'utf8');
for (const [lang, values] of Object.entries(approved)) {
  for (const [key, value] of Object.entries(values)) {
    if (!updatedTranslations.includes(`${JSON.stringify(key)}: ${JSON.stringify(value)}`)) {
      throw new Error(`${lang}.${key}: approved value missing after migration`);
    }
  }
}
for (const file of fs.readdirSync(root).filter((name) => name.endsWith('.html'))) {
  if (fs.readFileSync(path.join(root, file), 'utf8').includes(overrideToken)) throw new Error(`${file}: override script still loaded`);
}

console.log(`Merged approved experience copy into translations and removed override script from ${touchedPages} HTML files.`);
