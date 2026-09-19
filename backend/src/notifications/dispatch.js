import { fileURLToPath } from "node:url";
import { loadConfig } from "../config.js";
import { createDatabasePool } from "../database/pool.js";
import { loadEmailConfig } from "./email-config.js";
import { createSmtpMailer } from "./smtp-mailer.js";
import { createPostgresNotificationOutboxRepository } from "./postgres-outbox-repository.js";
import { createPostgresEmailContextRepository } from "./postgres-email-context.js";
import { createRequestCreatedEmailTransport } from "./request-created-email-transport.js";
import { createNotificationDispatcher } from "./dispatcher.js";

const DEFAULT_BATCH_SIZE = 50;

export async function dispatchPendingNotifications({ pool, mailer, emailConfig, batchSize = DEFAULT_BATCH_SIZE }) {
  if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 500) {
    throw new Error("notification batch size must be between 1 and 500");
  }

  const outbox = createPostgresNotificationOutboxRepository(pool);
  const transport = createRequestCreatedEmailTransport({
    contextRepository: createPostgresEmailContextRepository(pool),
    mailer,
    operationsEmail: emailConfig.operationsEmail
  });
  const dispatcher = createNotificationDispatcher(outbox, transport);

  let processed = 0;
  let sent = 0;
  let failed = 0;

  while (processed < batchSize) {
    const result = await dispatcher.dispatchOne();
    if (!result.processed) break;
    processed += 1;
    if (result.sent) sent += 1;
    else failed += 1;
  }

  return { processed, sent, failed };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const config = loadConfig();
  const emailConfig = loadEmailConfig();
  if (!config.databaseUrl) throw new Error("DATABASE_URL is required");
  if (!emailConfig) throw new Error("SMTP email configuration is required");

  const pool = createDatabasePool(config.databaseUrl);
  const mailer = createSmtpMailer(emailConfig);
  try {
    await mailer.verify();
    const result = await dispatchPendingNotifications({ pool, mailer, emailConfig });
    console.log(`Notification dispatch completed: processed=${result.processed} sent=${result.sent} failed=${result.failed}`);
  } finally {
    mailer.close();
    await pool.end();
  }
}
