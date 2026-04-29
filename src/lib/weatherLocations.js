export const WEATHER_LOCATION_PRESETS = [
  { match: /伊斯坦布尔|Istanbul/i, name: "伊斯坦布尔", shortLabel: "Istanbul", latitude: 41.0082, longitude: 28.9784 },
  { match: /伊兹密尔|Izmir/i, name: "伊兹密尔", shortLabel: "Izmir", latitude: 38.4237, longitude: 27.1428 },
  { match: /塞尔丘克|Selcuk|以弗所|Ephesus/i, name: "塞尔丘克", shortLabel: "Selcuk", latitude: 37.9514, longitude: 27.3685 },
  { match: /厄吕代尼兹|Oludeniz|费特希耶|Fethiye|Lycian|蝴蝶谷/i, name: "费特希耶", shortLabel: "Fethiye", latitude: 36.6596, longitude: 29.1263 },
  { match: /安塔利亚|Antalya/i, name: "安塔利亚", shortLabel: "Antalya", latitude: 36.8969, longitude: 30.7133 },
  { match: /格雷梅|Goreme|Göreme|卡帕多奇亚|Cappadocia|内夫谢希尔|Nevsehir|Uchisar|Love Valley/i, name: "格雷梅", shortLabel: "Goreme", latitude: 38.6431, longitude: 34.8289 }
];

export function weatherCacheKey(date, key) {
  return `${date}:${key ?? "primary"}`;
}

export function getDayWeatherLocations(selectedDay, dayItems, places, currentPlace) {
  const candidates = [
    ...dayItems.flatMap((item) => [
      { place: resolveItemPlace(item, places), weatherOnly: false },
      { place: resolveDestinationPlace(item, places), weatherOnly: false }
    ]),
    { place: currentPlace, weatherOnly: false },
    { place: selectedDay.weatherLocation, weatherOnly: true }
  ];
  const seen = new Set();
  const locations = [];

  for (const candidate of candidates) {
    if (!candidate.place) continue;
    if (!candidate.weatherOnly && isTransitWeatherPlace(candidate.place)) continue;

    const location = resolveWeatherLocation(candidate.place);
    if (!location) continue;

    const key = location.key ?? `${location.name}-${location.latitude}-${location.longitude}`;
    if (seen.has(key)) continue;

    seen.add(key);
    locations.push({ ...location, key });
    if (locations.length >= 3) break;
  }

  return locations;
}

export function isTransitWeatherPlace(place) {
  if (!place) return true;
  if (place.kind === "transit") return true;
  const text = `${place.name ?? ""} ${place.address ?? ""}`;
  return /\b[A-Z]{3}\b/.test(text) || /airport|机场|otogar|bus station|车站/i.test(text);
}

export function createLocationFallbackSnapshots(location, baseSnapshots = []) {
  return baseSnapshots.map((snapshot) => ({
    ...snapshot,
    sourceId: `${location.key}-${snapshot.sourceId}`,
    sourceName: `${location.shortLabel ?? location.name} · ${snapshot.sourceName}`
  }));
}

function resolveWeatherLocation(place) {
  const primaryText = `${place?.name ?? ""} ${place?.city ?? ""}`;
  const addressText = `${place?.address ?? ""}`;
  const preset = WEATHER_LOCATION_PRESETS.find((entry) => entry.match.test(primaryText))
    ?? WEATHER_LOCATION_PRESETS.find((entry) => entry.match.test(addressText));
  if (preset) {
    return {
      key: preset.shortLabel,
      name: preset.name,
      shortLabel: preset.shortLabel,
      latitude: preset.latitude,
      longitude: preset.longitude
    };
  }
  if (Number.isFinite(place?.latitude) && Number.isFinite(place?.longitude)) {
    return {
      key: place.id ?? place.name,
      name: place.name,
      shortLabel: shortWeatherLabel(place.name),
      latitude: place.latitude,
      longitude: place.longitude
    };
  }
  return null;
}

function resolveItemPlace(item, places) {
  if (item?.primaryPlaceId) return places.find((place) => place.id === item.primaryPlaceId);
  if (item?.placeId) return places.find((place) => place.id === item.placeId);
  return places.find((place) => {
    const haystack = `${item.title ?? ""} ${(item.notes ?? []).join(" ")}`;
    return haystack.includes(place.name) || haystack.includes(place.city);
  });
}

function resolveDestinationPlace(item, places) {
  if (!item?.destinationPlaceId) return null;
  return places.find((place) => place.id === item.destinationPlaceId) ?? null;
}

function shortWeatherLabel(name) {
  const cleanName = String(name ?? "").trim();
  const airportCode = cleanName.match(/\b[A-Z]{3}\b$/);
  if (airportCode) return airportCode[0];
  return cleanName.slice(0, 10);
}
