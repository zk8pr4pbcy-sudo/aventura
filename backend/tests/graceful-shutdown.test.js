import assert from "node:assert/strict";
import test from "node:test";
import { createGracefulShutdown } from "../src/runtime/graceful-shutdown.js";

test("graceful shutdown is idempotent and closes database after HTTP server", async () => {
  let closeCallback;
  let closeCalls = 0;
  let idleCalls = 0;
  let databaseCalls = 0;
  const exits = [];

  const server = {
    close(callback) {
      closeCalls += 1;
      closeCallback = callback;
    },
    closeIdleConnections() {
      idleCalls += 1;
    }
  };

  const shutdown = createGracefulShutdown({
    server,
    closeDatabase: async () => { databaseCalls += 1; },
    exit: (code) => exits.push(code),
    setTimer: () => ({ unref() {} }),
    clearTimer: () => {}
  });

  const first = shutdown();
  const second = shutdown();
  assert.equal(first, second);
  assert.equal(closeCalls, 1);
  assert.equal(idleCalls, 1);

  closeCallback(null);
  assert.equal(await first, 0);
  assert.equal(databaseCalls, 1);
  assert.deepEqual(exits, [0]);
});

test("graceful shutdown force-closes connections after timeout", async () => {
  let timeoutCallback;
  let forceCalls = 0;
  let databaseCalls = 0;
  const exits = [];

  const server = {
    close() {},
    closeIdleConnections() {},
    closeAllConnections() { forceCalls += 1; }
  };

  const shutdown = createGracefulShutdown({
    server,
    closeDatabase: async () => { databaseCalls += 1; },
    exit: (code) => exits.push(code),
    setTimer: (callback) => {
      timeoutCallback = callback;
      return { unref() {} };
    },
    clearTimer: () => {}
  });

  const result = shutdown();
  timeoutCallback();
  assert.equal(await result, 1);
  assert.equal(forceCalls, 1);
  assert.equal(databaseCalls, 1);
  assert.deepEqual(exits, [1]);
});
