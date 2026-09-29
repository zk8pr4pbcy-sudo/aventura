import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const output = path.join(root, '_site');
const excludedTopLevel = new Set([
  '.git',
  '.github',
  '_site',
  'docs',
  'tests',
  'scripts',
  'node_modules',
  'README.md'
]);

const contactEmail = ['contact', '@', 'aventuraksa', '.com'].join('');
const whatsappNumber = ['966', '555', '884', '854'].join('');
const displayedWhatsappNumber = ['+966', ' 55', ' 588', ' 4854'].join('');
const ajaxEndpoint = `https://formsubmit.co/ajax/${contactEmail}`;
const directEndpoint = `https://formsubmit.co/${contactEmail}`;
const shift = 7;

function shiftedCodes(value) {
  return Array.from(value).map((character) => character.charCodeAt(0) + shift).join(', ');
}

function replaceRequired(source, from, to, label) {
  if (!source.includes(from)) {
    throw new Error(`Public build transform could not find expected source: ${label}`);
  }
  return source.replace(from, to);
}

function replaceAllRequired(source, from, to, label) {
  if (!source.includes(from)) {
    throw new Error(`Public build transform could not find expected source: ${label}`);
  }
  return source.split(from).join(to);
}

function transformFile(relativePath, transform) {
  const filePath = path.join(output, relativePath);
  const source = fs.readFileSync(filePath, 'utf8');
  const transformed = transform(source);
  fs.writeFileSync(filePath, transformed, 'utf8');
}

function copyPublicFiles() {
  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(output, { recursive: true });

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (excludedTopLevel.has(entry.name)) continue;
    const sourcePath = path.join(root, entry.name);
    const destinationPath = path.join(output, entry.name);
    fs.cpSync(sourcePath, destinationPath, { recursive: true });
  }
}

function hardenSharedApp() {
  transformFile('assets/js/app.js', (source) => {
    const declarations = `  var WHATSAPP_NUMBER = "${whatsappNumber}";\n  var REQUEST_EMAIL = "${contactEmail}";`;
    const hardenedDeclarations = [
      '  function decodeContactValue(values) {',
      `    return values.map(function (value) { return String.fromCharCode(value - ${shift}); }).join("");`,
      '  }',
      `  var WHATSAPP_NUMBER = decodeContactValue([${shiftedCodes(whatsappNumber)}]);`
    ].join('\n');
    source = replaceRequired(source, declarations, hardenedDeclarations, 'app contact declarations');

    const footerEmailLine = `      '        <li><a href="mailto:' + REQUEST_EMAIL + '">' + REQUEST_EMAIL + '</a></li>',`;
    const footerContactLine = `      '        <li><a href="contact.html" data-i18n="nav.contact">Contact</a></li>',`;
    source = replaceRequired(source, footerEmailLine, footerContactLine, 'footer email link');

    const footerWhatsappLine = `      '        <li><a href="https://wa.me/' + WHATSAPP_NUMBER + '" target="_blank" rel="noopener">${displayedWhatsappNumber}</a></li>',`;
    const footerWhatsappGeneric = `      '        <li><a href="https://wa.me/' + WHATSAPP_NUMBER + '" target="_blank" rel="noopener" data-i18n="common.whatsapp">Chat on WhatsApp</a></li>',`;
    source = replaceRequired(source, footerWhatsappLine, footerWhatsappGeneric, 'footer WhatsApp display');

    return source;
  });
}

function hardenContactTransport() {
  transformFile('assets/js/contact-submission.js', (source) => {
    const declarations = `  var FORM_SUBMIT_ENDPOINT = "${ajaxEndpoint}";\n  var WHATSAPP_NUMBER = "${whatsappNumber}";`;
    const hardenedDeclarations = [
      '  function decodeContactValue(values) {',
      `    return values.map(function (value) { return String.fromCharCode(value - ${shift}); }).join("");`,
      '  }',
      '',
      `  var FORM_SUBMIT_ENDPOINT = "https://formsubmit.co/ajax/" + decodeContactValue([${shiftedCodes(contactEmail)}]);`,
      `  var WHATSAPP_NUMBER = decodeContactValue([${shiftedCodes(whatsappNumber)}]);`
    ].join('\n');
    return replaceRequired(source, declarations, hardenedDeclarations, 'contact submission destinations');
  });
}

function hardenEventRequestTransport() {
  transformFile('assets/js/event-request.js', (source) => {
    const declaration = `  var FORM_SUBMIT_ENDPOINT = "${ajaxEndpoint}";`;
    const hardened = [
      '  function decodeContactValue(values) {',
      `    return values.map(function (value) { return String.fromCharCode(value - ${shift}); }).join("");`,
      '  }',
      '',
      `  var FORM_SUBMIT_ENDPOINT = "https://formsubmit.co/ajax/" + decodeContactValue([${shiftedCodes(contactEmail)}]);`
    ].join('\n');
    return replaceRequired(source, declaration, hardened, 'legacy event request endpoint');
  });

  transformFile('assets/js/jeddah-picks-request.js', (source) => {
    const declaration = `  var ENDPOINT = "${ajaxEndpoint}";`;
    const hardened = [
      '  function decodeContactValue(values) {',
      `    return values.map(function (value) { return String.fromCharCode(value - ${shift}); }).join("");`,
      '  }',
      '',
      `  var ENDPOINT = "https://formsubmit.co/ajax/" + decodeContactValue([${shiftedCodes(contactEmail)}]);`
    ].join('\n');
    return replaceRequired(source, declaration, hardened, 'Jeddah picks request endpoint');
  });
}

function hardenContactPage() {
  transformFile('contact.html', (source) => {
    return replaceRequired(
      source,
      `action="${directEndpoint}"`,
      'action="contact.html"',
      'contact form direct destination'
    );
  });
}

function hardenPrivacyCopy() {
  transformFile('privacy.html', (source) => {
    return replaceRequired(
      source,
      `Please enable JavaScript to view this policy, or email ${contactEmail} to request a copy.`,
      'Please enable JavaScript to view this policy, or use the contact page to request a copy.',
      'privacy noscript email'
    );
  });

  transformFile('assets/js/translations.js', (source) => {
    source = replaceAllRequired(
      source,
      `"privacy.p8": "For privacy questions, email ${contactEmail}."`,
      '"privacy.p8": "For privacy questions, use the contact page."',
      'legacy English privacy contact copy'
    );
    source = replaceAllRequired(
      source,
      `"privacy.p8": "للاستفسارات المتعلقة بالخصوصية تواصل عبر ${contactEmail}."`,
      '"privacy.p8": "للاستفسارات المتعلقة بالخصوصية استخدم صفحة التواصل."',
      'legacy Arabic privacy contact copy'
    );
    source = replaceAllRequired(
      source,
      `"privacy.p8": "Para consultas de privacidad, escribe a ${contactEmail}."`,
      '"privacy.p8": "Para consultas de privacidad, utiliza la página de contacto."',
      'legacy Spanish privacy contact copy'
    );
    return source;
  });

  transformFile('assets/js/legal-content.js', (source) => {
    const replacements = [
      [`لأسئلة الخصوصية أو ممارسة الحقوق: ${contactEmail} — يرجى كتابة «الخصوصية» في عنوان الرسالة.`, 'لأسئلة الخصوصية أو ممارسة الحقوق: استخدم صفحة التواصل في الموقع واختر البريد الإلكتروني، واكتب «الخصوصية» في الرسالة.'],
      [`يمكن سحب موافقة النشر في أي وقت عبر ${contactEmail}.`, 'يمكن سحب موافقة النشر في أي وقت عبر صفحة التواصل في الموقع.'],
      [`أرسل طلبك إلى ${contactEmail} بعنوان «طلب خصوصية».`, 'أرسل طلبك عبر صفحة التواصل واختر البريد الإلكتروني، واكتب «طلب خصوصية» في الرسالة.'],
      [`للاستفسارات المتعلقة بالطلب أو الحجز: ${contactEmail}`, 'للاستفسارات المتعلقة بالطلب أو الحجز: استخدم صفحة التواصل في الموقع.'],
      [`For privacy questions or rights requests: ${contactEmail} — please use “Privacy” in the subject line.`, 'For privacy questions or rights requests, use the contact page, choose email, and write “Privacy” in your message.'],
      [`You may withdraw publication consent at any time through ${contactEmail}.`, 'You may withdraw publication consent at any time through the contact page.'],
      [`Email ${contactEmail} with the subject “Privacy request”.`, 'Use the contact page, choose email, and write “Privacy request” in your message.'],
      [`For questions about a request or booking: ${contactEmail}`, 'For questions about a request or booking, use the contact page.'],
      [`Para consultas de privacidad o ejercicio de derechos: ${contactEmail} — indica «Privacidad» en el asunto.`, 'Para consultas de privacidad o ejercicio de derechos, utiliza la página de contacto, elige correo electrónico y escribe «Privacidad» en el mensaje.'],
      [`Puedes retirar el consentimiento de publicación en cualquier momento escribiendo a ${contactEmail}.`, 'Puedes retirar el consentimiento de publicación en cualquier momento a través de la página de contacto.'],
      [`Escribe a ${contactEmail} con el asunto «Solicitud de privacidad».`, 'Utiliza la página de contacto, elige correo electrónico y escribe «Solicitud de privacidad» en el mensaje.'],
      [`Para consultas sobre una solicitud o reserva: ${contactEmail}`, 'Para consultas sobre una solicitud o reserva, utiliza la página de contacto.']
    ];

    for (const [from, to] of replacements) {
      source = replaceAllRequired(source, from, to, `legal copy: ${from.slice(0, 42)}`);
    }
    return source;
  });
}

function walkFiles(directory, results = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walkFiles(fullPath, results);
    else results.push(fullPath);
  }
  return results;
}

function verifyPublicArtifact() {
  for (const internalPath of ['docs', 'tests', 'scripts', '.github', 'README.md']) {
    if (fs.existsSync(path.join(output, internalPath))) {
      throw new Error(`Internal project material leaked into public artifact: ${internalPath}`);
    }
  }

  const textExtensions = new Set(['.html', '.js', '.json', '.xml', '.txt', '.css', '.webmanifest', '.md']);
  const leaks = [];

  for (const filePath of walkFiles(output)) {
    const extension = path.extname(filePath).toLowerCase();
    if (!textExtensions.has(extension) && path.basename(filePath) !== 'CNAME') continue;
    const source = fs.readFileSync(filePath, 'utf8');
    const relative = path.relative(output, filePath);
    if (source.includes(contactEmail)) leaks.push(`${relative}: public email`);
    if (source.includes(whatsappNumber) || source.includes(displayedWhatsappNumber)) leaks.push(`${relative}: WhatsApp number`);
  }

  if (leaks.length) {
    throw new Error(`Public contact exposure check failed:\n${leaks.map((item) => `- ${item}`).join('\n')}`);
  }
}

copyPublicFiles();
hardenSharedApp();
hardenContactTransport();
hardenEventRequestTransport();
hardenContactPage();
hardenPrivacyCopy();
verifyPublicArtifact();

console.log('Public artifact built in _site with internal project files excluded.');
console.log('Static source no longer contains the naked contact email or WhatsApp number.');
