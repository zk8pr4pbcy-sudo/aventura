import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const collectionPath = path.join(root, 'collection.html');
const modulePath = path.join(root, 'assets/js/boutique-last-light.js');
const browserSmokePath = path.join(root, 'tests/browser-smoke.mjs');
const smokePath = path.join(root, 'tests/smoke.mjs');

let collection = fs.readFileSync(collectionPath, 'utf8');
const marker = 'data-prelaunch-last-light';
if (!collection.includes(marker)) {
  const taifAnchor = '          <article class="perfume-card perfume-card-with-actions" data-boutique-item data-product-id="perfume-taif"';
  if (!collection.includes(taifAnchor)) throw new Error('Taif perfume anchor not found');

  const staticCard = '          <article class="perfume-card perfume-card-pending prelaunch-last-light-card" data-prelaunch-last-light data-category="desert" data-product-type="fragrance"><div><span class="eyebrow">LAST LIGHT</span><strong data-i18n="collection.p3Title">Last Light</strong><p data-i18n="collection.p3Text">Dry woods, sun-warmed sand, vetiver and a mineral accord.</p><span class="status coming" data-i18n="common.comingSoon">Coming soon</span><small data-i18n="collection.lastLightPending">Original campaign artwork pending</small></div></article>\n';
  collection = collection.replace(taifAnchor, staticCard + taifAnchor);
  fs.writeFileSync(collectionPath, collection);
}

const moduleSource = `(function () {\n  "use strict";\n\n  function syncBoutiqueLastLight() {\n    var boutique = document.querySelector("[data-boutique]");\n    var card = boutique && boutique.querySelector("[data-prelaunch-last-light]");\n    if (!boutique || !card) return;\n\n    var activeExperience = boutique.querySelector("[data-boutique-filter].is-active");\n    var selected = activeExperience ? activeExperience.getAttribute("data-boutique-filter") : "all";\n    var show = !selected || selected === "all" || selected === "desert";\n    card.hidden = !show;\n\n    if (show) {\n      var fragranceSection = boutique.querySelector("#fragrances");\n      if (fragranceSection) fragranceSection.hidden = false;\n    }\n  }\n\n  function initialize() {\n    var boutique = document.querySelector("[data-boutique]");\n    if (!boutique) return;\n\n    syncBoutiqueLastLight();\n    boutique.querySelectorAll("[data-boutique-filter], [data-boutique-type]").forEach(function (button) {\n      button.addEventListener("click", function () {\n        window.setTimeout(syncBoutiqueLastLight, 0);\n      });\n    });\n  }\n\n  if (document.readyState === "loading") {\n    document.addEventListener("DOMContentLoaded", initialize, { once: true });\n  } else {\n    initialize();\n  }\n}());\n`;
fs.writeFileSync(modulePath, moduleSource);

let browserSmoke = fs.readFileSync(browserSmokePath, 'utf8');
browserSmoke = browserSmoke.replace('exactly one Last Light card is injected', 'exactly one static Last Light card is present');
browserSmoke = browserSmoke.replace("lastLightCard.locator('[data-last-light-copy=\"title\"]')", "lastLightCard.locator('[data-i18n=\"collection.p3Title\"]')");
fs.writeFileSync(browserSmokePath, browserSmoke);

let smoke = fs.readFileSync(smokePath, 'utf8');
smoke = smoke.replace("check(boutiqueLastLight.includes('data-prelaunch-last-light'), 'Last Light module owns the boutique Last Light card');", "check(collection.includes('<article class=\"perfume-card perfume-card-pending prelaunch-last-light-card\" data-prelaunch-last-light'), 'Last Light card is owned by static collection HTML');\ncheck(!boutiqueLastLight.includes('createElement('), 'Last Light module no longer creates DOM nodes');\ncheck(boutiqueLastLight.includes('card.hidden = !show;'), 'Last Light module only synchronizes filter visibility');");
fs.writeFileSync(smokePath, smoke);

const updatedCollection = fs.readFileSync(collectionPath, 'utf8');
if ((updatedCollection.match(/data-prelaunch-last-light/g) || []).length !== 1) throw new Error('Expected exactly one static Last Light card');
if (!updatedCollection.includes('data-i18n="collection.p3Title"')) throw new Error('Static Last Light title is not wired to i18n');
if (moduleSource.includes('createElement(')) throw new Error('Last Light module still creates DOM');

console.log('Static Last Light migration applied.');
