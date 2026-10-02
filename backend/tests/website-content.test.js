import assert from "node:assert/strict";
import test from "node:test";
import { createWebsiteContentService } from "../src/website-content/service.js";

const ID = "11111111-1111-4111-8111-111111111111";
const USER_ID = "22222222-2222-4222-8222-222222222222";

function content(overrides = {}) {
  return {
    id: ID,
    contentType: "event",
    slug: "jeddah-test-event",
    status: "draft",
    titleAr: "فعالية تجريبية",
    titleEn: "Test event",
    titleEs: null,
    bodyAr: "تفاصيل",
    bodyEn: null,
    bodyEs: null,
    mediaUrl: null,
    startsAt: "2026-09-19T01:00:00.000Z",
    endsAt: "2026-09-20T01:00:00.000Z",
    publishedAt: null,
    contentPayload: { venue: "Jeddah" },
    sortOrder: 10,
    createdAt: "2026-09-19T00:00:00.000Z",
    updatedAt: "2026-09-19T00:00:00.000Z",
    createdBy: USER_ID,
    updatedBy: USER_ID,
    ...overrides
  };
}

function fakeRepository(current = content()) {
  let item = current;
  return {
    async create(input, actorUserId) {
      item = content({ ...input, createdBy: actorUserId, updatedBy: actorUserId });
      return item;
    },
    async update(id, patch, actorUserId) {
      if (id !== item.id) return null;
      item = { ...item, ...patch, updatedBy: actorUserId };
      return item;
    },
    async getById(id) { return id === item.id ? item : null; },
    async setStatus(id, status, actorUserId) {
      if (id !== item.id) return null;
      item = { ...item, status, updatedBy: actorUserId };
      return item;
    },
    async listAdmin() { return [item]; },
    async listPublic() { return item.status === "published" ? [item] : []; }
  };
}

test("published public content exposes only public fields", async () => {
  const repository = fakeRepository(content({ status: "published" }));
  const service = createWebsiteContentService(repository, {
    now: () => new Date("2026-09-19T02:00:00.000Z")
  });

  const [item] = await service.listPublic({ contentType: "event" });
  assert.equal(item.slug, "jeddah-test-event");
  assert.equal(item.titleAr, "فعالية تجريبية");
  assert.equal(Object.hasOwn(item, "id"), false);
  assert.equal(Object.hasOwn(item, "status"), false);
  assert.equal(Object.hasOwn(item, "createdBy"), false);
  assert.equal(Object.hasOwn(item, "updatedBy"), false);
});

test("expired content cannot be published", async () => {
  const repository = fakeRepository(content({
    endsAt: "2026-09-18T23:59:00.000Z"
  }));
  const service = createWebsiteContentService(repository, {
    now: () => new Date("2026-09-19T02:00:00.000Z")
  });

  await assert.rejects(
    service.publish(ID, USER_ID),
    (error) => error.message === "content_window_expired" && error.statusCode === 409
  );
});

test("content update rejects an end date before its existing start date", async () => {
  const repository = fakeRepository();
  const service = createWebsiteContentService(repository);

  await assert.rejects(
    service.update(ID, { endsAt: "2026-09-19T00:30:00.000Z" }, USER_ID),
    (error) => error.statusCode === 422 && error.fields?.endsAt === "must_be_after_start"
  );
});
