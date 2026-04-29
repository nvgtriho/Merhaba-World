import test from "node:test";
import assert from "node:assert/strict";
import { createDirectionsLink, createMapLinks } from "../src/lib/maps.js";

test("creates Google Maps and Apple Maps links from a named place", () => {
  const links = createMapLinks({
    name: "Saint John Hotel",
    address: "Isabey Mah. Sehit Polis Metin Tavaslioglu Cad. No:67, Selcuk"
  });

  assert.match(links.google, /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/);
  assert.match(links.apple, /^https:\/\/maps\.apple\.com\/\?q=/);
  assert.equal(links.copyText.includes("Saint John Hotel"), true);
});

test("creates a Google Maps directions link between two trip places", () => {
  const url = new URL(createDirectionsLink(
    { name: "Istanbul Airport", address: "IST" },
    { name: "Adnan Menderes Airport", address: "ADB" }
  ));

  assert.equal(url.origin, "https://www.google.com");
  assert.equal(url.pathname, "/maps/dir/");
  assert.equal(url.searchParams.get("api"), "1");
  assert.equal(url.searchParams.get("origin").includes("Istanbul Airport"), true);
  assert.equal(url.searchParams.get("destination").includes("Adnan Menderes Airport"), true);
});
