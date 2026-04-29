import test from "node:test";
import assert from "node:assert/strict";
import { createSupabaseAdapter, createTripSnapshot } from "../src/lib/supabaseAdapter.js";

const baseTrip = {
  id: "turkey-2026",
  name: "Turkey Plan",
  destinationTemplate: "turkey",
  startDate: "2026-04-30",
  endDate: "2026-05-06",
  members: [{ id: "m1", name: "A" }],
  days: [],
  items: [{ id: "item-1", title: "Airport", notes: ["leave early"] }]
};

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    }
  };
}

test("creates a complete trip snapshot row", () => {
  const row = createTripSnapshot(baseTrip, {
    version: 4,
    updatedAt: "2026-05-01T08:00:00.000Z",
    updatedBy: "旅伴 A"
  });

  assert.equal(row.id, "turkey-2026");
  assert.equal(row.version, 4);
  assert.equal(row.updated_at, "2026-05-01T08:00:00.000Z");
  assert.equal(row.updated_by, "旅伴 A");
  assert.deepEqual(row.payload, baseTrip);
});

test("local demo mode stores full trip snapshots and pulls them back", async () => {
  const adapter = createSupabaseAdapter({
    storage: createMemoryStorage(),
    now: () => "2026-05-01T08:00:00.000Z"
  });

  const pushResult = await adapter.pushTrip(baseTrip, { updatedBy: "A" });
  const pullResult = await adapter.pullTrip(baseTrip.id);

  assert.equal(adapter.mode, "local-demo");
  assert.equal(pushResult.ok, true);
  assert.equal(pushResult.version, 1);
  assert.equal(pullResult.ok, true);
  assert.equal(pullResult.version, 1);
  assert.deepEqual(pullResult.trip, baseTrip);
});

test("local demo mode refuses stale pushes instead of overwriting newer cloud data", async () => {
  const adapter = createSupabaseAdapter({
    storage: createMemoryStorage(),
    now: () => "2026-05-01T08:00:00.000Z"
  });

  const first = await adapter.pushTrip(baseTrip, { updatedBy: "A" });
  const newer = await adapter.pushTrip({ ...baseTrip, name: "Remote edit" }, {
    baseVersion: first.version,
    updatedBy: "B"
  });
  const stale = await adapter.pushTrip({ ...baseTrip, name: "Stale edit" }, {
    baseVersion: first.version,
    updatedBy: "A"
  });

  assert.equal(newer.version, 2);
  assert.equal(stale.ok, false);
  assert.equal(stale.conflict, true);
  assert.equal(stale.remoteVersion, 2);
});

test("supabase mode upserts the JSON payload with editor metadata", async () => {
  let storedRow = null;
  const fakeClient = {
    from(tableName) {
      assert.equal(tableName, "trip_snapshots");
      return {
        select() {
          return {
            eq(_field, id) {
              return {
                async maybeSingle() {
                  return { data: storedRow?.id === id ? storedRow : null, error: null };
                }
              };
            }
          };
        },
        upsert(row) {
          storedRow = row;
          return {
            select() {
              return {
                async maybeSingle() {
                  return { data: row, error: null };
                }
              };
            }
          };
        }
      };
    }
  };
  const adapter = createSupabaseAdapter({
    url: "https://example.supabase.co",
    anonKey: "anon",
    clientFactory: async () => fakeClient,
    now: () => "2026-05-01T08:00:00.000Z"
  });

  const result = await adapter.pushTrip(baseTrip, { updatedBy: "A" });

  assert.equal(adapter.mode, "supabase");
  assert.equal(result.ok, true);
  assert.equal(result.version, 1);
  assert.equal(storedRow.id, baseTrip.id);
  assert.equal(storedRow.updated_by, "A");
  assert.deepEqual(storedRow.payload.items, baseTrip.items);
});
