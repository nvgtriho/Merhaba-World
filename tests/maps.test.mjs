import test from "node:test";
import assert from "node:assert/strict";
import {
  GOOGLE_MAPS_API_KEY,
  createDirectionsLink,
  createMapLinks,
  createStaticMapUrl,
  inferCuisineInfo,
  normalizeGoogleMapsPlace
} from "../src/lib/maps.js";

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

test("creates a Google Static Maps thumbnail URL for place cards", () => {
  const url = new URL(createStaticMapUrl({
    name: "Pumpkin Goreme Restaurant",
    address: "Goreme",
    latitude: 38.643721,
    longitude: 34.830204
  }));

  assert.equal(url.origin, "https://maps.googleapis.com");
  assert.equal(url.pathname, "/maps/api/staticmap");
  assert.equal(url.searchParams.get("key"), GOOGLE_MAPS_API_KEY);
  assert.equal(url.searchParams.get("scale"), "2");
  assert.equal(url.searchParams.get("size"), "360x190");
  assert.equal(url.searchParams.get("center"), "38.643721,34.830204");
  assert.match(url.searchParams.get("markers"), /38\.643721,34\.830204/);
  assert.ok(url.searchParams.getAll("style").length >= 3);
});

test("creates a Google Static Maps thumbnail URL from search text when coordinates are missing", () => {
  const url = new URL(createStaticMapUrl({
    title: "Fethiye seafood restaurant",
    city: "费特希耶"
  }, { zoom: 13 }));

  assert.equal(url.searchParams.get("center"), "Fethiye seafood restaurant, 费特希耶");
  assert.match(url.searchParams.get("markers"), /Fethiye seafood restaurant/);
  assert.equal(url.searchParams.get("zoom"), "13");
});

test("infers approximate Turkish cuisine notes from restaurant hints", () => {
  const seafood = inferCuisineInfo({
    title: "费特希耶海鲜搜索",
    city: "费特希耶",
    googleMapsMeta: { query: "Fethiye seafood meze restaurant" }
  });
  const kebab = inferCuisineInfo({
    title: "格雷梅 Testi Kebab 搜索",
    city: "格雷梅",
    googleMapsMeta: { query: "Testi Kebab Goreme" }
  });
  const fallback = inferCuisineInfo({ title: "Local restaurant" });

  assert.deepEqual(seafood.chips.slice(0, 2), ["海鲜", "meze"]);
  assert.equal(seafood.summary.includes("烤鱼"), true);
  assert.equal(kebab.chips.includes("瓦罐炖肉"), true);
  assert.equal(kebab.summary.includes("卡帕多奇亚"), true);
  assert.equal(fallback.chips.includes("土耳其家常菜"), true);
});
