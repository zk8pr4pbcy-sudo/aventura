import { randomUUID } from "node:crypto";

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:3200";
const total = Number(process.env.LOAD_TOTAL || 120);
const concurrency = Number(process.env.LOAD_CONCURRENCY || 12);

if (!Number.isInteger(total) || total < 1 || total > 2000) {
  throw new Error("LOAD_TOTAL must be an integer between 1 and 2000");
}
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 100) {
  throw new Error("LOAD_CONCURRENCY must be an integer between 1 and 100");
}

const durations = [];
const references = new Set();
let nextIndex = 0;

async function submit(index) {
  const started = performance.now();
  const response = await fetch(`${baseUrl}/api/v1/experience-requests`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": randomUUID()
    },
    body: JSON.stringify({
      fullName: `Load Test Guest ${index}`,
      phone: `+966500${String(index).padStart(6, "0")}`,
      language: "ar",
      experienceKey: "historic-jeddah",
      partySize: 2
    })
  });
  const body = await response.json();
  durations.push(performance.now() - started);

  if (response.status !== 201) {
    throw new Error(`request ${index} failed with ${response.status}: ${JSON.stringify(body)}`);
  }
  if (!/^AV-EXP-\d{4}-\d{6}$/.test(body.referenceNumber || "")) {
    throw new Error(`request ${index} returned invalid reference`);
  }
  if (references.has(body.referenceNumber)) {
    throw new Error(`duplicate public reference ${body.referenceNumber}`);
  }
  references.add(body.referenceNumber);
}

async function worker() {
  while (true) {
    const index = nextIndex;
    nextIndex += 1;
    if (index >= total) return;
    await submit(index);
  }
}

const suiteStarted = performance.now();
await Promise.all(Array.from({ length: Math.min(concurrency, total) }, () => worker()));
const elapsedMs = performance.now() - suiteStarted;
const sorted = durations.toSorted((a, b) => a - b);
const p95 = sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)];
const max = sorted.at(-1);

if (references.size !== total) {
  throw new Error(`expected ${total} unique references, got ${references.size}`);
}
if (p95 > 3000) {
  throw new Error(`p95 latency ${p95.toFixed(2)}ms exceeds 3000ms smoke threshold`);
}

console.log(JSON.stringify({
  ok: true,
  total,
  concurrency,
  elapsedMs: Number(elapsedMs.toFixed(2)),
  p95Ms: Number(p95.toFixed(2)),
  maxMs: Number(max.toFixed(2)),
  uniqueReferences: references.size
}));
