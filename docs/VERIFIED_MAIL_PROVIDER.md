# Verified recipient email delivery

Status: prepared, disabled until the owner verifies the Aventura operations mailbox with Web3Forms. Production continues to use FormSubmit until activation. Its HTTP 522 outage cannot be fixed in this repository.

## Activation

1. Owner selects Web3Forms and obtains a public form access key for the operations mailbox from https://web3forms.com/. Never supply a mailbox password or SMTP credential to this field.
2. Update the privacy page and its translations to identify the selected processor, retention information and international processing based on its current documentation; replace obsolete FormSubmit-specific statements after switching.
3. Put the verified public key in contact.html input[name=access_key] and remove disabled. Build, run checks and deploy.
4. Make one explicitly authorized technical submission from the deployed site. Confirm the provider accepts it and the operations mailbox actually receives the full request and reference before declaring delivery restored. A successful mocked test is not proof of mailbox receipt.

The transport selects one provider per submission. No automatic cross-provider retry occurs. Empty or disabled keys keep the existing transport. Both providers must explicitly acknowledge success; timeout and rejection retain the form and recovery actions. Web3Forms requests map subject/replyto/source URL and retain request reference, language, full summary, experience data and consent. Honeypot entries are rejected before sending.

Official documentation: https://docs.web3forms.com/getting-started/api-reference and https://docs.web3forms.com/getting-started/faq.
