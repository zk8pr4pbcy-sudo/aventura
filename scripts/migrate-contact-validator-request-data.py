from pathlib import Path

PATH = Path("scripts/validate-site.mjs")
source = PATH.read_text()

anchor = 'const contactWizardSource = fs.readFileSync(path.join(root, "assets/js/contact-wizard.js"), "utf8");\n'
replacement = anchor + 'const contactRequestDataSource = fs.readFileSync(path.join(root, "assets/js/contact-request-data.js"), "utf8");\n'
if 'const contactRequestDataSource = fs.readFileSync(path.join(root, "assets/js/contact-request-data.js"), "utf8");' not in source:
    if source.count(anchor) != 1:
        raise SystemExit(f"expected one contact wizard source anchor, found {source.count(anchor)}")
    source = source.replace(anchor, replacement)

old = '''if (!/\\["name", "company", "phone", "email", "preferredResponse"\\]\\.forEach\\(function \\(name\\) \\{ moveField\\(name, thirdGrid\\); \\}\\);/.test(contactWizardSource) || !contactBlock.includes('["preferredResponse", "contact.preferredContactLabel"]')) {
  fail("contact", "preferred response field is not included in the final request step and request details");
}'''
new = '''if (!/\\["name", "company", "phone", "email", "preferredResponse"\\]\\.forEach\\(function \\(name\\) \\{ moveField\\(name, thirdGrid\\); \\}\\);/.test(contactWizardSource) || !contactRequestDataSource.includes('["preferredResponse", "contact.preferredContactLabel"]')) {
  fail("contact", "preferred response field is not included in the final request step and request details");
}'''
if old in source:
    source = source.replace(old, new)
elif new not in source:
    raise SystemExit("preferred-response validator block not found")

PATH.write_text(source)
