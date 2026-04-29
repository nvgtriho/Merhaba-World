import test from "node:test";
import assert from "node:assert/strict";
import { seedMarkdown, seedTrip } from "../src/data/tripSeed.js";

test("imports the full markdown plan through May 6 into seed data", () => {
  assert.equal(seedMarkdown.includes("5.6"), true);
  assert.equal(seedMarkdown.includes("TK2001"), true);

  assert.deepEqual(
    seedTrip.days.map((day) => day.title),
    ["4.30", "5.1", "5.2", "5.3", "5.4", "5.5", "5.6"]
  );

  assert.equal(seedTrip.endDate, "2026-05-06");
  assert.equal(seedTrip.items.some((item) => item.date === "2026-05-06" && item.title.includes("TK2001")), true);
});

test("keeps the detailed May 3 markdown actions in structured itinerary items", () => {
  const may3Titles = seedTrip.items
    .filter((item) => item.date === "2026-05-03")
    .map((item) => item.title);

  assert.equal(may3Titles.includes("退房，行李寄存，吃饭"), true);
  assert.equal(may3Titles.includes("包车前往安塔利亚"), true);
  assert.equal(may3Titles.includes("KimilKoc 夜巴 → 格雷梅"), true);
});

test("adds recognized wiki hotel and ticket details into structured data", () => {
  const kingApart = seedTrip.lodgings.find((lodging) => lodging.title === "King Apart Goreme");
  const salonika = seedTrip.lodgings.find((lodging) => lodging.title === "Salonika Suites");
  const saintJohn = seedTrip.lodgings.find((lodging) => lodging.title === "Saint John Hotel");

  assert.equal(kingApart.phone, "+90 534 327 34 50");
  assert.equal(kingApart.address.includes("Orta Mah. Kazim Eren Sok. No: 4"), true);
  assert.equal(kingApart.keyPickup.includes("Aydinli Mahallesi"), true);
  assert.equal(salonika.confirmationCode, "1714659219");
  assert.equal(saintJohn.phone, "+90 232 892 63 22");

  assert.equal(seedTrip.assets.some((asset) => asset.title.includes("KamilKoç") && asset.src.includes("ticket-kamilkoc")), true);
  assert.equal(seedTrip.assets.some((asset) => asset.title.includes("TK2001") && asset.type === "image"), true);
});

test("records the full Salonika Suites Agoda booking confirmation", () => {
  const salonika = seedTrip.lodgings.find((lodging) => lodging.title === "Salonika Suites");
  const asset = seedTrip.assets.find((entry) => entry.id === "asset-salonika");

  assert.equal(asset.title, "Salonika Suites Agoda 酒店预订确认单");
  assert.equal(asset.src, "/assets/wiki/salonika-suites-confirmation.png");
  assert.equal(asset.tag, "住宿凭证");
  assert.equal(asset.date, "2026-05-02");
  assert.equal(salonika.address.includes("No. 12, 224 Sokak"), true);
  assert.equal(salonika.room, "Family Suite");
  assert.equal(salonika.checkIn, "2026-05-02");
  assert.equal(salonika.checkOut, "2026-05-03");
});

test("fills Cappadocia actions for May 5 and May 6 beyond the placeholder", () => {
  const may5Items = seedTrip.items.filter((item) => item.date === "2026-05-05");
  const may6Items = seedTrip.items.filter((item) => item.date === "2026-05-06");

  assert.equal(may5Items.length >= 4, true);
  assert.equal(may5Items.some((item) => item.title.includes("热气球")), true);
  assert.equal(may5Items.some((item) => item.title.includes("格雷梅露天博物馆")), true);
  assert.equal(may6Items.some((item) => item.title.includes("退房")), true);
  assert.equal(may6Items.some((item) => item.title.includes("TK2001")), true);
});

test("gives date chips and place cards varied trip-specific images", () => {
  const dayImages = seedTrip.days.map((day) => day.heroImageUrl).filter(Boolean);
  const placeImages = seedTrip.places.map((place) => place.imageUrl).filter(Boolean);

  assert.equal(dayImages.length, seedTrip.days.length);
  assert.equal(new Set(dayImages).size, dayImages.length);
  assert.equal(placeImages.length >= 12, true);
  assert.equal(new Set(placeImages).size, placeImages.length);
});

test("adds hotel jump targets and attraction guide material beyond map links", () => {
  const hotels = seedTrip.places.filter((place) => place.kind === "hotel");
  const attractions = seedTrip.places.filter((place) => place.kind === "attraction");

  assert.equal(hotels.length >= 3, true);
  assert.equal(hotels.every((place) => /^https?:\/\//.test(place.externalUrl ?? "")), true);
  assert.equal(hotels.every((place) => !/google\.com\/maps/i.test(place.externalUrl ?? "")), true);

  assert.equal(attractions.length >= 8, true);
  for (const place of attractions) {
    assert.equal(typeof place.guide?.summary, "string", place.id);
    assert.equal(place.guide.summary.length >= 80, true, place.id);
    assert.equal((place.guide.facts ?? []).length >= 2, true, place.id);
    assert.equal((place.guide.sources ?? []).length >= 1, true, place.id);
    assert.equal(Boolean(place.address), true, place.id);
  }
});

test("marks public scenic images with verifiable Wikimedia or local screenshot sources", () => {
  for (const place of seedTrip.places.filter((place) => place.imageUrl)) {
    if (place.imageUrl.startsWith("https://upload.wikimedia.org/")) {
      assert.equal(place.imageCredit.includes("Wikimedia Commons"), true, place.id);
      assert.equal(Boolean(place.imageSourceUrl), true, place.id);
      assert.equal(place.imageSourceUrl.includes("commons.wikimedia.org/wiki/File:"), true, place.id);
    } else {
      assert.equal(place.imageCredit.includes("截图"), true, place.id);
    }
  }
});

test("adds daily mystic summaries and hourly weather data for every trip day", () => {
  for (const day of seedTrip.days) {
    assert.equal(Boolean(day.mystic?.summary), true);
    assert.equal(Array.isArray(day.mystic?.links), true);
    assert.equal(day.mystic.links.length > 0, true);
    assert.equal(Array.isArray(day.hourlyForecast), true);
    assert.equal(day.hourlyForecast.length >= 5, true);
    assert.equal(day.hourlyForecast.every((point) => point.time && Number.isFinite(point.tempC)), true);
  }
});

test("uses curated mystic links instead of generic search result pages", () => {
  const trustedHosts = ["timeanddate.com", "astrology.com", "xzw.com"];

  for (const day of seedTrip.days) {
    const urls = day.mystic.links.map((link) => new URL(link.url));

    assert.equal(urls.some((url) => url.hostname.includes("timeanddate.com")), true);
    assert.equal(urls.some((url) => url.hostname.includes("astrology.com") || url.hostname.includes("xzw.com")), true);
    assert.equal(urls.every((url) => trustedHosts.some((host) => url.hostname.includes(host))), true);
    assert.equal(urls.every((url) => !url.hostname.includes("google.")), true);
  }
});

test("adds fetchable weather coordinates for every trip day", () => {
  for (const day of seedTrip.days) {
    assert.equal(Boolean(day.weatherLocation?.name), true);
    assert.equal(Number.isFinite(day.weatherLocation?.latitude), true);
    assert.equal(Number.isFinite(day.weatherLocation?.longitude), true);
  }
});

test("adds food recommendations and restaurant links separate from credentials", () => {
  assert.equal(Array.isArray(seedTrip.foodRecommendations), true);
  assert.equal(seedTrip.foodRecommendations.length >= 6, true);
  assert.equal(seedTrip.foodRecommendations.some((food) => food.city.includes("格雷梅")), true);
  assert.equal(Array.isArray(seedTrip.restaurantLinks), true);
  assert.equal(seedTrip.restaurantLinks.some((link) => link.url.includes("google.com/maps")), true);
});

test("scopes food recommendations and restaurant links to concrete trip days", () => {
  for (const food of seedTrip.foodRecommendations) {
    assert.equal(Array.isArray(food.dates), true);
    assert.equal(food.dates.length > 0, true);
  }

  for (const day of seedTrip.days.filter((day) => day.date >= "2026-05-01")) {
    assert.equal(seedTrip.foodRecommendations.some((food) => food.dates.includes(day.date)), true);
  }

  assert.equal(seedTrip.restaurantLinks.every((link) => link.date || link.city), true);
});

test("keeps homepage itinerary notes presentation-ready and free of raw booking details", () => {
  const blockedPatterns = [/订单号/, /PNR/i, /总价/, /截图识别/, /Booking/, /Agoda/, /电话\s*\+?\d/, /\b\d{10,}\b/, /TL\s*\d/i, /¥\d/];

  for (const item of seedTrip.items) {
    for (const note of item.notes ?? []) {
      assert.equal(blockedPatterns.some((pattern) => pattern.test(note)), false, `${item.id}: ${note}`);
    }
  }
});

test("keeps credential assets date-scoped only", () => {
  assert.equal(seedTrip.assets.some((asset) => asset.scope === "common"), false);
  assert.equal(seedTrip.assets.some((asset) => asset.date === "2026-05-03"), true);
  assert.equal(seedTrip.assets.every((asset) => asset.scope === "date" && asset.date), true);
});
