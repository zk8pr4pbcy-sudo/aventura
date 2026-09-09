import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync("assets/js/app.js", "utf8");
const contact = fs.readFileSync("contact.html", "utf8");

const runtimeIndex = contact.indexOf("assets/js/runtime-state.js");
const appIndex = contact.indexOf("assets/js/app.js");
assert.ok(runtimeIndex >= 0, "contact must load runtime-state.js");
assert.ok(appIndex >= 0, "contact must load app.js");
assert.ok(runtimeIndex < appIndex, "runtime-state.js must load before app.js");

assert.match(app, /function normalizeLanguage\(language\)/, "app must expose a runtime-aware language normalizer");
assert.match(app, /runtime\.language\.normalize\(language\)/, "app must use runtime language normalization when available");
assert.match(app, /function getActiveLanguage\(\)/, "app must expose a runtime-aware language reader");
assert.match(app, /submissionData\.set\("request_language", getActiveLanguage\(\)\)/, "contact submission must use active runtime language");

console.log("Runtime integration checks passed");
