import test from "node:test";
import assert from "node:assert/strict";
import { createMemoryStore } from "../src/lib/offlineStore.js";

test("persists and lists trip-scoped offline records", async () => {
  const store = createMemoryStore();
  await store.put("phrases", { id: "p1", tripId: "turkey-2026", text: "Acı olmasın" });
  await store.put("phrases", { id: "p2", tripId: "other", text: "Bonjour" });

  const phrases = await store.listByTrip("phrases", "turkey-2026");

  assert.equal(phrases.length, 1);
  assert.equal(phrases[0].text, "Acı olmasın");
});
