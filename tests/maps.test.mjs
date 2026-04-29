import test from "node:test";
import assert from "node:assert/strict";
import { createDirectionsLink, createMapLinks, normalizeGoogleMapsPlace } from "../src/lib/maps.js";

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

test("extracts useful no-key metadata from a Google Maps place URL", () => {
  const place = normalizeGoogleMapsPlace(
    "https://www.google.com/maps/place/Pumpkin+Goreme+Restaurant/@38.643721,34.830204,17z"
  );

  assert.equal(place.title, "Pumpkin Goreme Restaurant");
  assert.equal(place.latitude, 38.643721);
  assert.equal(place.longitude, 34.830204);
  assert.equal(place.href.includes("google.com/maps/place"), true);
  assert.equal(place.query, "Pumpkin Goreme Restaurant");
});

test("turns plain restaurant text into a Google Maps search URL without an API key", () => {
  const place = normalizeGoogleMapsPlace("Testi Kebab Goreme");
  const url = new URL(place.href);

  assert.equal(place.title, "Testi Kebab Goreme");
  assert.equal(url.origin, "https://www.google.com");
  assert.equal(url.pathname, "/maps/search/");
  assert.equal(url.searchParams.get("query"), "Testi Kebab Goreme");
});
