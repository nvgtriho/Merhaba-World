import { GOOGLE_MAPS_API_KEY } from "./maps.js";

const TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const PLACES_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.googleMapsUri",
  "places.photos",
  "places.primaryType",
  "places.primaryTypeDisplayName",
  "places.types",
  "places.rating",
  "places.priceLevel",
  "places.servesBreakfast",
  "places.servesLunch",
  "places.servesDinner",
  "places.servesVegetarianFood",
  "places.editorialSummary"
].join(",");

export function createPlacePhotoUrl(photoName, options = {}) {
  if (!photoName || !GOOGLE_MAPS_API_KEY) return "";
  const params = new URLSearchParams();
  params.set("maxWidthPx", String(options.maxWidthPx ?? 720));
  params.set("key", GOOGLE_MAPS_API_KEY);
  return `https://places.googleapis.com/v1/${photoName}/media?${params.toString()}`;
}

export async function fetchPlacePreview(query, options = {}) {
  const textQuery = String(query ?? "").trim();
  if (!textQuery || !GOOGLE_MAPS_API_KEY) return null;
  const fetchImpl = options.fetch ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") return null;

  try {
    const response = await fetchImpl(TEXT_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": PLACES_FIELD_MASK
      },
      body: JSON.stringify({
        textQuery,
        languageCode: "zh-CN",
        regionCode: "TR",
        includedType: "restaurant"
      })
    });
    if (!response.ok) return null;
    const data = await response.json();
    return normalizePlacePreview(data.places?.[0]);
  } catch {
    return null;
  }
}

export function normalizePlacePreview(place) {
  if (!place) return null;
  const photo = place.photos?.[0];
  const serviceChips = [
    place.servesBreakfast && "早餐",
    place.servesLunch && "午餐",
    place.servesDinner && "晚餐",
    place.servesVegetarianFood && "素食友好"
  ].filter(Boolean);

  return {
    id: place.id,
    name: place.displayName?.text ?? "",
    address: place.formattedAddress ?? "",
    googleMapsUri: place.googleMapsUri ?? "",
    ratingLabel: typeof place.rating === "number" ? place.rating.toFixed(1) : "",
    priceLabel: priceLevelLabel(place.priceLevel),
    typeLabel: place.primaryTypeDisplayName?.text ?? place.primaryType ?? "",
    serviceChips,
    editorialSummary: place.editorialSummary?.text ?? "",
    photoUrl: createPlacePhotoUrl(photo?.name),
    photoAttribution: photo?.authorAttributions?.[0]?.displayName ?? ""
  };
}

export function createRestaurantPlaceQuery(restaurant = {}) {
  return [
    restaurant.googleMapsMeta?.query,
    restaurant.googleMapsMeta?.title,
    restaurant.title,
    restaurant.city
  ]
    .filter(Boolean)
    .join(", ");
}

function priceLevelLabel(priceLevel) {
  const labels = {
    PRICE_LEVEL_FREE: "免费",
    PRICE_LEVEL_INEXPENSIVE: "$",
    PRICE_LEVEL_MODERATE: "$$",
    PRICE_LEVEL_EXPENSIVE: "$$$",
    PRICE_LEVEL_VERY_EXPENSIVE: "$$$$"
  };
  return labels[priceLevel] ?? "";
}
