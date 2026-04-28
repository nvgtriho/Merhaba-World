import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("keeps import tooling and quick-jump wording out of the traveler-facing app", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");

  assert.equal(source.includes("ImportPanel"), false);
  assert.equal(source.includes("Markdown 导入"), false);
  assert.equal(source.includes("快速跳转"), false);
});

test("keeps navigation actions embedded in itinerary and traffic cards", async () => {
  const source = await readFile(new URL("../src/App.js", import.meta.url), "utf8");

  assert.equal(source.includes("ItineraryActionCard"), true);
  assert.equal(source.includes("inline-actions"), true);
  assert.equal(source.includes("导航出发点"), true);
});
