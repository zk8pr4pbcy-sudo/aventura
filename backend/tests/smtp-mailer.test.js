import assert from "node:assert/strict";
import test from "node:test";
import { createSmtpMailer } from "../src/notifications/smtp-mailer.js";

test("SMTP adapter can be constructed provider-neutrally without sending", () => {
  const mailer = createSmtpMailer({
    host: "smtp.example.test",
    port: 587,
    secure: false,
    auth: { user: "test-user", password: "test-password" },
    from: "Aventura <requests@example.test>"
  });
  assert.equal(typeof mailer.sendMail, "function");
  assert.equal(typeof mailer.verify, "function");
  assert.equal(typeof mailer.close, "function");
  mailer.close();
});
