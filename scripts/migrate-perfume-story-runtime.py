from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "assets/js/app.js"

app = APP.read_text(encoding="utf-8")
pattern = re.compile(
    r'  function setupPerfumeStoryCards\(\) \{.*?\n  \}\n\n  function setupReveals\(\) \{',
    re.S,
)
replacement = '''  function setupPerfumeStoryCards() {
    var storyRuntime = window.AVENTURA_PERFUME_STORY;
    if (!storyRuntime || typeof storyRuntime.setup !== "function") {
      throw new Error("Aventura perfume story runtime is unavailable");
    }
    storyRuntime.setup({
      translate: translate,
      dialogRuntime: window.AVENTURA_DIALOG_RUNTIME
    });
  }

  function setupReveals() {'''

app, count = pattern.subn(replacement, app, count=1)
if count != 1:
    raise SystemExit(f"Expected one perfume story setup block, replaced {count}")
APP.write_text(app, encoding="utf-8")

script_pattern = re.compile(r'(<script\s+src="assets/js/dialog-runtime\.js[^\"]*"\s+defer></script>)')
changed_html = 0
for html_path in ROOT.glob("*.html"):
    html = html_path.read_text(encoding="utf-8")
    if "assets/js/app.js" not in html or "assets/js/perfume-story-runtime.js" in html:
        continue
    html, inserted = script_pattern.subn(
        r'\1<script src="assets/js/perfume-story-runtime.js?v=20260910" defer></script>',
        html,
        count=1,
    )
    if inserted != 1:
        raise SystemExit(f"Could not place perfume story runtime before app.js in {html_path.name}")
    html_path.write_text(html, encoding="utf-8")
    changed_html += 1

if changed_html == 0:
    raise SystemExit("No HTML pages were updated")

print(f"Migrated perfume story runtime across {changed_html} HTML pages")
