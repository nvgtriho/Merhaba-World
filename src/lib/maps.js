export const GOOGLE_MAPS_API_KEY = "AIzaSyARZ1AKPkOvIjkkDnZ3MEMk6_W_9PgQUP4";

const STATIC_MAP_STYLES = [
  "feature:poi|element:labels|visibility:simplified",
  "feature:road|element:geometry|color:0xf4efe7",
  "feature:water|element:geometry|color:0x98d4cf",
  "feature:landscape|element:geometry|color:0xfffbf2",
  "feature:administrative|element:labels.text.fill|color:0x7b6f66"
];

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

export function createStaticMapUrl(place, options = {}) {
  const point = staticMapPoint(place);
  if (!point || !GOOGLE_MAPS_API_KEY) return "";

  const params = new URLSearchParams();
  params.set("center", point);
  params.set("zoom", String(options.zoom ?? 15));
  params.set("size", options.size ?? "360x190");
  params.set("scale", String(options.scale ?? 2));
  params.set("maptype", options.maptype ?? "roadmap");
  params.set("markers", `color:0xe46e55|label:${options.markerLabel ?? "M"}|${point}`);
  params.set("key", GOOGLE_MAPS_API_KEY);
  for (const style of STATIC_MAP_STYLES) {
    params.append("style", style);
  }

  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

export function inferCuisineInfo(restaurant = {}) {
  const text = [
    restaurant.title,
    restaurant.city,
    restaurant.url,
    restaurant.googleMapsMeta?.title,
    restaurant.googleMapsMeta?.query
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matched = CUISINE_RULES.find((rule) => rule.keywords.some((keyword) => text.includes(keyword)));
  return matched
    ? { chips: matched.chips, summary: matched.summary }
    : {
        chips: ["土耳其家常菜", "烤肉", "茶"],
        summary: "大概按土耳其本地餐厅处理：烤肉、炖菜、米饭或汤类都比较常见，适合到店后看当日菜单。"
      };
}

function placeQuery(place) {
  return [place?.name, place?.address].filter(Boolean).join(", ");
}

function staticMapPoint(place) {
  const latitude = numberOrUndefined(place?.latitude ?? place?.googleMapsMeta?.latitude);
  const longitude = numberOrUndefined(place?.longitude ?? place?.googleMapsMeta?.longitude);
  if (latitude !== undefined && longitude !== undefined) return `${latitude},${longitude}`;
  return [
    place?.name,
    place?.title,
    place?.googleMapsMeta?.query,
    place?.address,
    place?.city
  ]
    .filter(Boolean)
    .join(", ");
}

function numberOrUndefined(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

const CUISINE_RULES = [
  {
    keywords: ["seafood", "fish", "balik", "balık", "meze", "fethiye", "oludeniz", "费特希耶", "厄吕代尼兹", "海鲜", "烤鱼"],
    chips: ["海鲜", "meze", "烤鱼"],
    summary: "偏海边餐桌：烤鱼、meze 冷盘、柠檬沙拉和酸奶酱更稳，适合晚餐慢慢吃。"
  },
  {
    keywords: ["testi", "kebab", "kebap", "goreme", "göreme", "cappadocia", "格雷梅", "卡帕", "瓦罐"],
    chips: ["瓦罐炖肉", "烤肉", "酸奶酱"],
    summary: "卡帕多奇亚常见组合：瓦罐炖肉、烤肉、米饭或酸奶酱，适合到格雷梅后补一顿热的。"
  },
  {
    keywords: ["breakfast", "kahvalti", "kahvaltı", "menemen", "早餐", "土耳其早餐"],
    chips: ["土耳其早餐", "Menemen", "红茶"],
    summary: "早餐向：Menemen 炒蛋、奶酪橄榄、蜂蜜黄油和红茶，滑翔伞或日出前别吃太撑。"
  },
  {
    keywords: ["gozleme", "gözleme", "pide", "lahmacun", "煎饼"],
    chips: ["Gözleme", "Pide", "酸奶"],
    summary: "轻食面饼向：Gözleme、Pide 或 Lahmacun，适合古城日、转车日快速补能。"
  },
  {
    keywords: ["kumru", "izmir", "伊兹密尔"],
    chips: ["Kumru", "街头三明治", "奶酪"],
    summary: "伊兹密尔街头风味：Kumru 三明治、奶酪和香肠，适合落地后快速吃一点。"
  }
];

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
