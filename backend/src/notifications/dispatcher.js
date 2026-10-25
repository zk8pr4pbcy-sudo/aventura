function retryDelayMs(attempts) {
  const minutes = Math.min(60, 2 ** Math.max(0, attempts - 1));
  return minutes * 60 * 1000;
}

function safeFailureCode(error) {
  const value = error?.code || error?.name || "delivery_failed";
  return String(value).replace(/[^A-Za-z0-9_.-]/g, "_").slice(0, 120) || "delivery_failed";
}

export function createNotificationDispatcher(outbox, transport, options = {}) {
  if (!outbox || typeof outbox.claimNext !== "function" || typeof outbox.markSent !== "function" || typeof outbox.markFailed !== "function") {
    throw new Error("notification outbox repository is required");
  }
  if (!transport || typeof transport.send !== "function") {
    throw new Error("notification transport is required");
  }

  const now = options.now || (() => new Date());

  return {
    async dispatchOne() {
      const event = await outbox.claimNext();
      if (!event) return { processed: false };

      try {
        await transport.send(event);
        await outbox.markSent(event.id);
        return { processed: true, sent: true, eventId: event.id };
      } catch (error) {
        const retryAt = new Date(now().getTime() + retryDelayMs(event.attempts));
        await outbox.markFailed(event.id, safeFailureCode(error), retryAt);
        return {
          processed: true,
          sent: false,
          eventId: event.id,
          retryAt
        };
      }
    }
  };
}
