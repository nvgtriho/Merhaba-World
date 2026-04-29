import test from "node:test";
import assert from "node:assert/strict";
import { createAssistantLinks, createClockReminderLink } from "../src/lib/assistantLinks.js";

test("opens assistants through universal links instead of brittle private schemes", () => {
  const links = createAssistantLinks("translate this politely", "Mozilla/5.0 (iPhone)");

  assert.match(links.find((link) => link.id === "chatgpt-link")?.href ?? "", /^https:\/\/chatgpt\.com\//);
  assert.match(links.find((link) => link.id === "gemini-link")?.href ?? "", /^https:\/\/gemini\.google\.com\/app/);
  assert.equal(links.some((link) => String(link.href).startsWith("chatgpt://")), false);
  assert.equal(links.some((link) => String(link.href).startsWith("googlegemini://")), false);
  assert.equal(links.some((link) => String(link.href).startsWith("intent://")), false);
  assert.equal(links.some((link) => link.autoFallback), false);
});

test("keeps Gemini Android links away from package intents that open Google Play", () => {
  const links = createAssistantLinks("translate this politely", "Mozilla/5.0 (Linux; Android 15)");
  const gemini = links.find((link) => link.id === "gemini-link");

  assert.equal(gemini?.label, "复制并打开 Gemini");
  assert.match(gemini?.href ?? "", /^https:\/\/gemini\.google\.com\/app/);
  assert.equal(gemini?.href.includes("package="), false);
  assert.equal(gemini?.href.includes("browser_fallback_url"), false);
});

test("uses Android SET_ALARM intent for day reminders instead of unsupported clock schemes", () => {
  const href = createClockReminderLink(
    { title: "5.2", city: "费特希耶" },
    [{ startTime: "08:15", title: "出发去海边" }],
    "Mozilla/5.0 (Linux; Android 15)"
  );

  assert.match(href, /^intent:#Intent;/);
  assert.match(href, /action=android\.intent\.action\.SET_ALARM/);
  assert.match(href, /i\.android\.intent\.extra\.alarm\.HOUR=8/);
  assert.match(href, /i\.android\.intent\.extra\.alarm\.MINUTES=15/);
  assert.equal(href.includes("clock-alarm://"), false);
  assert.equal(href.includes("calendar.google.com"), false);
});

test("falls back to a copyable reminder note when native alarm intents are unavailable", () => {
  const href = createClockReminderLink(
    { title: "5.2", city: "费特希耶" },
    [{ startTime: "08:15", title: "出发去海边" }],
    "Mozilla/5.0 (iPhone)"
  );

  assert.equal(href, "");
});
