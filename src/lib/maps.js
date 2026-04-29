export function createMapLinks(place) {
  const name = place?.name ?? "";
  const address = place?.address ?? "";
  const query = [name, address].filter(Boolean).join(", ");
  const encodedQuery = encodeURIComponent(query);

  return {
    google: `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`,
    apple: `https://maps.apple.com/?q=${encodedQuery}`,
    copyText: query
  };
}

export function createDirectionsLink(origin, destination) {
  const originQuery = placeQuery(origin);
  const destinationQuery = placeQuery(destination);
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("origin", originQuery);
  url.searchParams.set("destination", destinationQuery);
  return url.toString();
}

export function normalizeGoogleMapsPlace(raw) {
  const text = String(raw ?? "").trim();
  const foundUrl = extractFirstUrl(text);
  const href = foundUrl || createGoogleMapsSearchUrl(text || "place");
  const parsed = parseGoogleMapsUrl(foundUrl || "");
  const title = parsed.title || text || "Google Maps 地点";
  const query = parsed.query || title;

  return {
    href,
    title,
    query,
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    source: "google-maps"
  };
}

export function createGoogleMapsSearchUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function placeQuery(place) {
  return [place?.name, place?.address].filter(Boolean).join(", ");
}

function parseGoogleMapsUrl(url) {
  if (!url) return {};
  try {
    const parsed = new URL(url);
    const path = decodeURIComponent(parsed.pathname);
    const placeMatch = path.match(/\/maps\/place\/([^/@]+)/);
    const coordinateMatch = path.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    const query = parsed.searchParams.get("query") || parsed.searchParams.get("q") || "";
    return {
      title: cleanMapsTitle(placeMatch?.[1] || query),
      query: cleanMapsTitle(query || placeMatch?.[1] || ""),
      latitude: coordinateMatch ? Number(coordinateMatch[1]) : undefined,
      longitude: coordinateMatch ? Number(coordinateMatch[2]) : undefined
    };
  } catch {
    return {};
  }
}

function cleanMapsTitle(value) {
  return String(value ?? "")
    .replace(/\+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFirstUrl(raw) {
  return String(raw ?? "").match(/https?:\/\/[^\s，。)）]+/i)?.[0] ?? "";
}
