import test from "node:test";
import assert from "node:assert/strict";
import { createAssistantLinks, createClockReminderLink } from "../src/lib/assistantLinks.js";

test("keeps assistant entries app-only without web fallbacks", () => {
  const links = createAssistantLinks("translate this politely", "Mozilla/5.0 (iPhone)");

  assert.equal(links.find((link) => link.id === "chatgpt-app")?.href, "chatgpt://");
  assert.equal(links.find((link) => link.id === "gemini-app")?.href, "googlegemini://");
  assert.equal(links.some((link) => link.kind === "web"), false);
  assert.equal(links.some((link) => String(link.href).startsWith("https://")), false);
  assert.equal(links.some((link) => link.autoFallback), false);
});

test("uses the Gemini Android package intent when running on Android", () => {
  const links = createAssistantLinks("translate this politely", "Mozilla/5.0 (Linux; Android 15)");
  const gemini = links.find((link) => link.id === "gemini-app");

  assert.equal(gemini?.label, "Gemini App");
  assert.match(gemini?.href ?? "", /^intent:\/\/gemini\.google\.com/);
  assert.match(gemini?.href ?? "", /package=com\.google\.android\.apps\.bard/);
  assert.equal(gemini?.href.includes("browser_fallback_url"), false);
});

test("uses the native clock intent for day reminders instead of a calendar template", () => {
  const href = createClockReminderLink({ title: "5.2" }, [{ startTime: "08:00", title: "出发" }]);

  assert.equal(href.startsWith("clock-alarm://"), true);
  assert.equal(href.includes("calendar.google.com"), false);
});
