export function createGracefulShutdown({
  server,
  closeDatabase,
  timeoutMs = 10_000,
  exit = (code) => process.exit(code),
  setTimer = setTimeout,
  clearTimer = clearTimeout
}) {
  if (!server || typeof server.close !== "function") {
    throw new Error("HTTP server is required");
  }
  if (typeof closeDatabase !== "function") {
    throw new Error("database close function is required");
  }

  let inFlight = null;

  return function shutdown() {
    if (inFlight) return inFlight;

    inFlight = new Promise((resolve) => {
      let finished = false;
      let timer = null;

      const finish = async (code) => {
        if (finished) return;
        finished = true;
        if (timer) clearTimer(timer);
        try {
          await closeDatabase();
        } finally {
          exit(code);
          resolve(code);
        }
      };

      timer = setTimer(() => {
        if (typeof server.closeAllConnections === "function") {
          server.closeAllConnections();
        }
        void finish(1);
      }, timeoutMs);
      timer.unref?.();

      if (typeof server.closeIdleConnections === "function") {
        server.closeIdleConnections();
      }

      server.close((error) => {
        void finish(error ? 1 : 0);
      });
    });

    return inFlight;
  };
}
