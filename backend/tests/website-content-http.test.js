import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createServer } from "../src/server.js";

async function withServer(dependencies, fn) {
  const server = createServer(
    { env: "test", port: 0, serviceName: "aventura-backend" },
    dependencies
  );
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.close();
  }
}

const publicItem = {
  contentType: "event",
  slug: "gulf-cup-27",
  titleAr: "كأس الخليج 27",
  titleEn: "Gulf Cup 27",
  titleEs: null,
  bodyAr: null,
  bodyEn: null,
  bodyEs: null,
  mediaUrl: "/assets/img/gulf-cup.jpg",
  startsAt: null,
  endsAt: null,
  contentPayload: {},
  sortOrder: 50,
  publishedAt: "2026-09-19T00:00:00.000Z"
};

test("public content feed does not require admin authentication", async () => {
  await withServer({
    websiteContent: {
      async listPublic(input) {
        assert.equal(input.contentType, "event");
        return [publicItem];
      }
    }
  }, async (base) => {
    const response = await fetch(`${base}/api/v1/content/event`);
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.deepEqual(body, { items: [publicItem] });
  });
});

test("content manager can create draft content through protected admin route", async () => {
  let actor;
  await withServer({
    auth: {
      async authenticate() {
        return {
          id: "22222222-2222-4222-8222-222222222222",
          role: "content",
          isActive: true
        };
      }
    },
    websiteContent: {
      async create(input, actorUserId) {
        actor = actorUserId;
        return {
          id: "11111111-1111-4111-8111-111111111111",
          status: "draft",
          ...input
        };
      }
    }
  }, async (base) => {
    const response = await fetch(`${base}/api/v1/admin/content`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "aventura_admin_session=test-token"
      },
      body: JSON.stringify({
        contentType: "event",
        slug: "new-event",
        titleAr: "فعالية جديدة"
      })
    });
    const body = await response.json();
    assert.equal(response.status, 201);
    assert.equal(body.item.status, "draft");
    assert.equal(actor, "22222222-2222-4222-8222-222222222222");
  });
});

test("operations role cannot manage website content", async () => {
  await withServer({
    auth: {
      async authenticate() {
        return {
          id: "33333333-3333-4333-8333-333333333333",
          role: "operations",
          isActive: true
        };
      }
    },
    websiteContent: {
      async listAdmin() { throw new Error("must_not_run"); }
    }
  }, async (base) => {
    const response = await fetch(`${base}/api/v1/admin/content`, {
      headers: { cookie: "aventura_admin_session=test-token" }
    });
    const body = await response.json();
    assert.equal(response.status, 403);
    assert.equal(body.error, "forbidden");
  });
});
