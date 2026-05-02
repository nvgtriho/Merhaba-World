import test from "node:test";
import assert from "node:assert/strict";
import {
  createClearedTripSnapshot,
  createSupabaseAdapter,
  createTripSnapshot,
  DEFAULT_SUPABASE_ANON_KEY,
  DEFAULT_SUPABASE_URL
} from "../src/lib/supabaseAdapter.js";

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

function createFakeSupabaseClient(options = {}) {
  const { select: selectFn, upsert: upsertFn, storage = new Map() } = options;
  
  return {
    from(tableName) {
      return {
        select() {
          return {
            eq(field, value) {
              return {
                order(orderField, { ascending = true } = {}) {
                  return {
                    limit(n) {
                      return {
                        async maybeSingle() {
                          const data = selectFn?.(field, value);
                          if (!data) return { data: null, error: null };
                          
                          const array = Array.isArray(data) ? data : [data];
                          const sorted = [...array].sort((a, b) => {
                            const aVal = a[orderField];
                            const bVal = b[orderField];
                            if (aVal === bVal) return 0;
                            return ascending 
                              ? (aVal < bVal ? -1 : 1) 
                              : (aVal > bVal ? -1 : 1);
                          });
                          return { data: sorted[0] ?? null, error: null };
                        }
                      };
                    }
                  };
                }
              };
            }
          };
        },
        upsert(row) {
          if (upsertFn) upsertFn(row);
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
    url: "",
    anonKey: "",
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

test("uses the bundled Supabase project by default for zero-config phone sync", () => {
  const adapter = createSupabaseAdapter({ storage: createMemoryStorage() });

  assert.equal(DEFAULT_SUPABASE_URL, "https://dzbvfsjeuqjjhxiyavyt.supabase.co");
  assert.equal(DEFAULT_SUPABASE_ANON_KEY, "sb_publishable_13qf67r3pdiLyWF5R-7J-g_DuIu8dpr");
  assert.equal(adapter.mode, "supabase");
});

test("saved cloud config overrides built-in default Supabase config", async () => {
  const storage = createMemoryStorage();
  storage.setItem("short-trip-supabase-url", "https://old.example.supabase.co");
  storage.setItem("short-trip-supabase-anon-key", "old-key");
  let clientConfig = null;
  
  const fakeClient = createFakeSupabaseClient({
    select: () => null,
    upsert: () => {}
  });
  
  const adapter = createSupabaseAdapter({
    storage,
    clientFactory: async (config) => {
      clientConfig = config;
      return fakeClient;
    }
  });

  await adapter.pushTrip(baseTrip, { updatedBy: "A" });

  assert.equal(clientConfig.url, "https://old.example.supabase.co");
  assert.equal(clientConfig.anonKey, "old-key");
});

test("supabase mode can be enabled from saved public config on both phones", () => {
  const storage = createMemoryStorage();
  storage.setItem("short-trip-supabase-url", "https://example.supabase.co");
  storage.setItem("short-trip-supabase-anon-key", "anon-key");

  const adapter = createSupabaseAdapter({ storage });

  assert.equal(adapter.mode, "supabase");
});

test("missing cloud snapshots use neutral retry copy instead of no-trip copy", async () => {
  const fakeClient = createFakeSupabaseClient({
    select: (field, tripId) => {
      assert.equal(tripId, "turkey-2026");
      return null;
    }
  });
  
  const adapter = createSupabaseAdapter({
    url: "https://example.supabase.co",
    anonKey: "anon",
    clientFactory: async () => fakeClient
  });

  const result = await adapter.pullTrip("turkey-2026");

  assert.equal(result.ok, false);
  assert.equal(result.missing, true);
  assert.equal(result.tripId, "turkey-2026");
  assert.equal(result.message, "云端暂无可拉取版本");
  assert.equal(result.message.includes("还没有这份行程"), false);
});

test("cloud-cleared snapshots behave like an empty cloud instead of a broken trip", async () => {
  const row = createClearedTripSnapshot("turkey-2026", {
    updatedAt: "2026-05-01T08:00:00.000Z",
    updatedBy: "A"
  });
  
  const fakeClient = createFakeSupabaseClient({
    select: () => row
  });
  
  const adapter = createSupabaseAdapter({
    url: "https://example.supabase.co",
    anonKey: "anon",
    clientFactory: async () => fakeClient
  });

  const result = await adapter.pullTrip("turkey-2026");

  assert.equal(row.payload.cloudCleared, true);
  assert.equal(result.ok, false);
  assert.equal(result.missing, true);
  assert.equal(result.cleared, true);
  assert.equal(result.trip, undefined);
  assert.equal(result.message, "云端已清空，暂无可拉取版本");
});

test("push after a cloud clear writes one complete all-days trip snapshot", async () => {
  let storedRow = createClearedTripSnapshot("turkey-2026", {
    updatedAt: "2026-05-01T08:00:00.000Z",
    updatedBy: "A"
  });
  
  const fakeClient = createFakeSupabaseClient({
    select: (field, id) => {
      return storedRow?.id === id ? storedRow : null;
    },
    upsert: (row) => {
      storedRow = row;
    }
  });
  
  const adapter = createSupabaseAdapter({
    url: "https://example.supabase.co",
    anonKey: "anon",
    clientFactory: async () => fakeClient,
    now: () => "2026-05-01T09:00:00.000Z"
  });

  const result = await adapter.pushTrip(baseTrip, { updatedBy: "B" });

  assert.equal(result.ok, true);
  assert.equal(result.version, 1);
  assert.deepEqual(storedRow.payload, baseTrip);
  assert.deepEqual(storedRow.payload.items, baseTrip.items);
  assert.equal(storedRow.updated_by, "B");
});

test("local demo mode refuses stale pushes instead of overwriting newer cloud data", async () => {
  const adapter = createSupabaseAdapter({
    url: "",
    anonKey: "",
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

test("push assigns next version based on highest existing version, ignoring cleared markers", async () => {
  let allSnapshots = [
    createTripSnapshot(baseTrip, { version: 1, updatedAt: "2026-05-01T08:00:00.000Z", updatedBy: "A" }),
    createTripSnapshot({ ...baseTrip, name: "v2" }, { version: 2, updatedAt: "2026-05-01T09:00:00.000Z", updatedBy: "B" }),
    createClearedTripSnapshot("turkey-2026", { updatedAt: "2026-05-01T10:00:00.000Z", updatedBy: "C" })
  ];

  const fakeClient = {
    from() {
      return {
        select() {
          return {
            eq(_field, id) {
              return {
                order(field, { ascending }) {
                  return {
                    limit(n) {
                      // For select("version") queries, return array directly
                      const filtered = allSnapshots.filter(s => s.id === id);
                      const sorted = [...filtered].sort((a, b) => {
                        return ascending ? a[field] - b[field] : b[field] - a[field];
                      });
                      const limited = sorted.slice(0, n);
                      const result = { data: limited.map(s => ({ version: s.version })), error: null };
                      // For pullTrip, we need maybeSingle
                      result.maybeSingle = async () => {
                        const data = limited[0] ? { ...limited[0], payload: limited[0] } : null;
                        return { data, error: null };
                      };
                      return result;
                    }
                  };
                }
              };
            }
          };
        },
        upsert(row) {
          allSnapshots = allSnapshots.filter(s => s.version !== row.version || s.id !== row.id);
          allSnapshots.push(row);
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
    now: () => "2026-05-01T11:00:00.000Z"
  });

  const result = await adapter.pushTrip(baseTrip, { updatedBy: "D" });

  assert.equal(result.ok, true);
  assert.equal(result.version, 3);
  assert.equal(result.message, "已推送云端第 3 版");
});

test("pull always returns the highest version when multiple versions exist", async () => {
  let storedSnapshots = [];
  const fakeClient = {
    from() {
      return {
        select() {
          return {
            eq(_field, id) {
              return {
                order(field, { ascending }) {
                  return {
                    limit(n) {
                      return {
                        async maybeSingle() {
                          const filtered = storedSnapshots.filter(s => s.id === id);
                          if (ascending) {
                            filtered.sort((a, b) => a.version - b.version);
                          } else {
                            filtered.sort((a, b) => b.version - a.version);
                          }
                          return { data: filtered[0] ?? null, error: null };
                        }
                      };
                    }
                  };
                }
              };
            }
          };
        },
        upsert(row) {
          storedSnapshots = storedSnapshots.filter(s => s.id !== row.id || s.version !== row.version);
          storedSnapshots.push(row);
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

  // Store a cleared snapshot (version 0) and a normal snapshot (version 1)
  const clearedSnap = createClearedTripSnapshot("turkey-2026", {
    updatedAt: "2026-05-01T08:00:00.000Z",
    updatedBy: "A"
  });
  storedSnapshots.push(clearedSnap);

  const normalSnap = createTripSnapshot(baseTrip, {
    version: 1,
    updatedAt: "2026-05-01T09:00:00.000Z",
    updatedBy: "B"
  });
  storedSnapshots.push(normalSnap);

  const result = await adapter.pullTrip("turkey-2026");

  assert.equal(result.ok, true);
  assert.equal(result.version, 1);
  assert.deepEqual(result.trip, baseTrip);
  assert.equal(result.message, "已拉取云端版本");
});


