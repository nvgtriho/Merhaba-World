import test from "node:test";
import assert from "node:assert/strict";
import { seedTrip } from "../src/data/tripSeed.js";
import { getDayWeatherLocations, isTransitWeatherPlace } from "../src/lib/weatherLocations.js";

function day(date) {
  return seedTrip.days.find((entry) => entry.date === date);
}

function items(date) {
  return seedTrip.items.filter((entry) => entry.date === date);
}

function currentPlaceFor(selectedDay) {
  return seedTrip.places.find((place) => selectedDay.city.includes(place.city)) ?? seedTrip.places[0];
}

test("keeps airports and transfer hubs out of multi-location weather", () => {
  const selectedDay = day("2026-05-01");
  const locations = getDayWeatherLocations(selectedDay, items(selectedDay.date), seedTrip.places, currentPlaceFor(selectedDay));

  assert.deepEqual(locations.map((location) => location.shortLabel), ["Selcuk"]);
  assert.equal(locations.some((location) => ["IST", "ADB"].includes(location.shortLabel)), false);
});

test("shows city-level weather for real same-day stays instead of every waypoint", () => {
  const selectedDay = day("2026-05-02");
  const locations = getDayWeatherLocations(selectedDay, items(selectedDay.date), seedTrip.places, currentPlaceFor(selectedDay));

  assert.deepEqual(locations.map((location) => location.shortLabel), ["Selcuk", "Fethiye"]);
});

test("recognizes transit-only places as navigation points rather than weather points", () => {
  const airport = seedTrip.places.find((place) => place.id === "place-ist");
  const hotel = seedTrip.places.find((place) => place.id === "place-saint-john");

  assert.equal(isTransitWeatherPlace(airport), true);
  assert.equal(isTransitWeatherPlace(hotel), false);
});
