from pathlib import Path

APP = Path("assets/js/app.js")
CONTACT = Path("contact.html")

app = APP.read_text()
contact = CONTACT.read_text()

already_wired = "window.AVENTURA_CONTACT_REQUEST_DATA" in app and "assets/js/contact-request-data.js?v=20260910" in contact
if already_wired:
    raise SystemExit(0)

anchor = '    updateSubmissionChannel();\n    var lastRequestMessage = "";\n    var isSubmitting = false;'
replacement = '''    updateSubmissionChannel();
    var lastRequestMessage = "";
    var isSubmitting = false;
    var contactRequestData = window.AVENTURA_CONTACT_REQUEST_DATA;
    if (!contactRequestData || typeof contactRequestData.createRequestId !== "function" || typeof contactRequestData.buildMessage !== "function") {
      throw new Error("Aventura contact request data module is unavailable");
    }'''
if app.count(anchor) != 1:
    raise SystemExit(f"expected one request-data dependency anchor, found {app.count(anchor)}")
app = app.replace(anchor, replacement)

start_marker = '      var selectedType = form.querySelector(\'[name="type"] option:checked\');\n'
end_marker = '      lastRequestMessage = lines.join("\\n");\n'
start = app.find(start_marker)
if start == -1:
    raise SystemExit("request summary start marker not found")
end = app.find(end_marker, start)
if end == -1:
    raise SystemExit("request summary end marker not found")
end += len(end_marker)

delegated = '''      var requestId = contactRequestData.createRequestId();
      lastRequestMessage = contactRequestData.buildMessage({
        form: form,
        data: data,
        translate: translate,
        requestId: requestId,
        name: name
      });
'''
app = app[:start] + delegated + app[end:]
APP.write_text(app)

script_anchor = '  <script src="assets/js/contact-wizard.js?v=20260910" defer></script>\n  <script src="assets/js/app.js?v=date-validation-20260830" defer></script>'
script_replacement = '  <script src="assets/js/contact-wizard.js?v=20260910" defer></script>\n  <script src="assets/js/contact-request-data.js?v=20260910" defer></script>\n  <script src="assets/js/app.js?v=date-validation-20260830" defer></script>'
if contact.count(script_anchor) != 1:
    raise SystemExit(f"expected one contact script anchor, found {contact.count(script_anchor)}")
CONTACT.write_text(contact.replace(script_anchor, script_replacement))
