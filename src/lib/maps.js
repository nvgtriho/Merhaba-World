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

function placeQuery(place) {
  return [place?.name, place?.address].filter(Boolean).join(", ");
}
