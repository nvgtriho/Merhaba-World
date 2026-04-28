import test from "node:test";
import assert from "node:assert/strict";
import { createMapLinks } from "../src/lib/maps.js";

test("creates Google Maps and Apple Maps links from a named place", () => {
  const links = createMapLinks({
    name: "Saint John Hotel",
    address: "Isabey Mah. Sehit Polis Metin Tavaslioglu Cad. No:67, Selcuk"
  });

  assert.match(links.google, /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/);
  assert.match(links.apple, /^https:\/\/maps\.apple\.com\/\?q=/);
  assert.equal(links.copyText.includes("Saint John Hotel"), true);
});
