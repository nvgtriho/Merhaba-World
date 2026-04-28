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
