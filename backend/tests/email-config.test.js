import assert from "node:assert/strict";
import test from "node:test";
import { loadEmailConfig } from "../src/notifications/email-config.js";

test("email configuration stays disabled when no SMTP variables are supplied", () => {
  assert.equal(loadEmailConfig({}), null);
});

test("email configuration supports provider-neutral authenticated SMTP", () => {
  const config = loadEmailConfig({
    SMTP_HOST: "smtp.example.test",
    SMTP_PORT: "465",
    SMTP_SECURE: "true",
    SMTP_USER: "smtp-user",
    SMTP_PASS: "smtp-secret",
    SMTP_FROM: "Aventura <requests@example.test>",
    OPERATIONS_NOTIFICATION_EMAIL: "operations@example.test"
  });

  assert.deepEqual(config, {
    host: "smtp.example.test",
    port: 465,
    secure: true,
    auth: { user: "smtp-user", password: "smtp-secret" },
    from: "Aventura <requests@example.test>",
    operationsEmail: "operations@example.test"
  });
});

test("partial SMTP credentials are rejected", () => {
  assert.throws(() => loadEmailConfig({
    SMTP_HOST: "smtp.example.test",
    SMTP_USER: "smtp-user",
    SMTP_FROM: "requests@example.test",
    OPERATIONS_NOTIFICATION_EMAIL: "operations@example.test"
  }), /SMTP_USER and SMTP_PASS/);
});

test("invalid operations recipient is rejected", () => {
  assert.throws(() => loadEmailConfig({
    SMTP_HOST: "smtp.example.test",
    SMTP_FROM: "requests@example.test",
    OPERATIONS_NOTIFICATION_EMAIL: "not-an-email"
  }), /OPERATIONS_NOTIFICATION_EMAIL/);
});
