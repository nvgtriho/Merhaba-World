import test from "node:test";
import assert from "node:assert/strict";
import {
  createPlacePhotoUrl,
  fetchPlacePreview,
  normalizePlacePreview
} from "../src/lib/places.js";
import { GOOGLE_MAPS_API_KEY } from "../src/lib/maps.js";

test("creates a browser-usable Places Photo media URL", () => {
  const url = new URL(createPlacePhotoUrl("places/abc/photos/photo123", { maxWidthPx: 720 }));

  assert.equal(url.origin, "https://places.googleapis.com");
  assert.equal(url.pathname, "/v1/places/abc/photos/photo123/media");
  assert.equal(url.searchParams.get("maxWidthPx"), "720");
  assert.equal(url.searchParams.get("key"), GOOGLE_MAPS_API_KEY);
});

test("normalizes Places search results into restaurant preview data", () => {
  const preview = normalizePlacePreview({
    id: "place-id",
    displayName: { text: "Pumpkin Göreme Restaurant" },
    formattedAddress: "İçeridere Sk. No:21/A, Göreme",
    rating: 4.7,
    priceLevel: "PRICE_LEVEL_MODERATE",
    primaryTypeDisplayName: { text: "餐馆" },
    servesDinner: true,
    servesVegetarianFood: true,
    googleMapsUri: "https://maps.google.com/?cid=123",
    photos: [
      {
        name: "places/place-id/photos/photo-1",
        authorAttributions: [{ displayName: "Pumpkin Göreme Restaurant" }]
      }
    ]
  });

  assert.equal(preview.name, "Pumpkin Göreme Restaurant");
  assert.equal(preview.ratingLabel, "4.7");
  assert.equal(preview.priceLabel, "$$");
  assert.equal(preview.typeLabel, "餐馆");
  assert.equal(preview.serviceChips.includes("晚餐"), true);
  assert.equal(preview.serviceChips.includes("素食友好"), true);
  assert.equal(preview.photoAttribution, "Pumpkin Göreme Restaurant");
  assert.match(preview.photoUrl, /places\.googleapis\.com\/v1\/places\/place-id\/photos\/photo-1\/media/);
});

test("fetches the first Google Places restaurant preview with a tight field mask", async () => {
  let requested = null;
  const fetchImpl = async (url, options) => {
    requested = { url, options };
    return {
      ok: true,
      async json() {
        return {
          places: [
            {
              id: "place-id",
              displayName: { text: "Pumpkin Göreme Restaurant" },
              rating: 4.7,
              photos: [{ name: "places/place-id/photos/photo-1" }]
            }
          ]
        };
      }
    };
  };

  const preview = await fetchPlacePreview("Pumpkin Goreme Restaurant", { fetch: fetchImpl });

  assert.equal(preview.name, "Pumpkin Göreme Restaurant");
  assert.equal(requested.url, "https://places.googleapis.com/v1/places:searchText");
  assert.equal(requested.options.method, "POST");
  assert.equal(requested.options.headers["X-Goog-Api-Key"], GOOGLE_MAPS_API_KEY);
  assert.equal(requested.options.headers["X-Goog-FieldMask"].includes("places.photos"), true);
  assert.equal(JSON.parse(requested.options.body).textQuery, "Pumpkin Goreme Restaurant");
});
