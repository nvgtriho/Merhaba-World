export const WEATHER_THRESHOLDS = {
  highTemperatureC: 3,
  precipitationChance: 30,
  windKmh: 15
};

const DEFAULT_TURKEY_SOURCES = [
  {
    id: "open-meteo",
    name: "Open-Meteo",
    authority: "multi-model",
    label: "免 key 天气数据",
    url: "https://open-meteo.com/",
    tested: true,
    testNote: "当前保留的唯一可用外链入口"
  }
];

const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const OPEN_METEO_DAILY_FIELDS = [
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_probability_max",
  "wind_speed_10m_max"
];
const OPEN_METEO_HOURLY_FIELDS = [
  "temperature_2m",
  "precipitation_probability",
  "wind_speed_10m"
];
const DAY_MS = 24 * 60 * 60 * 1000;

export function getNearestTripDate(days = [], now = new Date()) {
  const dates = days
    .map((day) => day?.date)
    .filter(isIsoDate)
    .sort();
  return findNearestForecastDate(dates, toIsoDate(now)) ?? dates[0] ?? "";
}

export function createOpenMeteoUrl(location, options = {}) {
  const latitude = Number(location?.latitude);
  const longitude = Number(location?.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new TypeError("Open-Meteo location requires numeric latitude and longitude");
  }

  const url = new URL(OPEN_METEO_FORECAST_URL);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("daily", OPEN_METEO_DAILY_FIELDS.join(","));
  url.searchParams.set("hourly", OPEN_METEO_HOURLY_FIELDS.join(","));
  url.searchParams.set("timezone", options.timezone ?? "auto");
  url.searchParams.set("forecast_days", String(options.forecastDays ?? 16));
  url.searchParams.set("temperature_unit", "celsius");
  url.searchParams.set("wind_speed_unit", "kmh");
  return url.toString();
}

export function normalizeOpenMeteoForecast(payload, targetDate) {
  const daily = payload?.daily ?? {};
  const dates = Array.isArray(daily.time) ? daily.time : [];
  const matchedDate = findNearestForecastDate(dates, targetDate);
  if (!matchedDate) return null;

  const dayIndex = dates.indexOf(matchedDate);
  const snapshot = {
    sourceId: "open-meteo-live",
    sourceName: "Open-Meteo",
    highC: roundWeatherValue(daily.temperature_2m_max?.[dayIndex]),
    lowC: roundWeatherValue(daily.temperature_2m_min?.[dayIndex]),
    precipitationChance: roundWeatherValue(daily.precipitation_probability_max?.[dayIndex]),
    windKmh: roundWeatherValue(daily.wind_speed_10m_max?.[dayIndex])
  };

  return {
    source: "open-meteo",
    sourceLabel: "Open-Meteo 实时",
    matchedDate,
    snapshot,
    hourlyForecast: normalizeOpenMeteoHourly(payload?.hourly, matchedDate)
  };
}

export function findNearestForecastDate(dates = [], targetDate) {
  const target = dateToDayNumber(toIsoDate(targetDate));
  if (!Number.isFinite(target)) return null;

  const candidates = dates
    .filter(isIsoDate)
    .map((date) => ({ date, dayNumber: dateToDayNumber(date) }))
    .filter((entry) => Number.isFinite(entry.dayNumber));

  if (!candidates.length) return null;

  return candidates.reduce((best, entry) => {
    const distance = Math.abs(entry.dayNumber - target);
    const bestDistance = Math.abs(best.dayNumber - target);
    const shouldPreferFutureTie = distance === bestDistance && entry.dayNumber >= target && best.dayNumber < target;
    return distance < bestDistance || shouldPreferFutureTie ? entry : best;
  }).date;
}

export async function fetchOpenMeteoForecast(location, targetDate, fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== "function") return null;
  const response = await fetchImpl(createOpenMeteoUrl(location));
  if (!response?.ok) {
    throw new Error(`Open-Meteo request failed with status ${response?.status ?? "unknown"}`);
  }
  return normalizeOpenMeteoForecast(await response.json(), targetDate);
}

export function compareWeatherSources(snapshots) {
  const usable = snapshots.filter(Boolean);
  if (usable.length < 2) {
    return { status: "single-source", reasons: [], sourceCount: usable.length };
  }

  const reasons = [];
  if (spread(usable, "highC") > WEATHER_THRESHOLDS.highTemperatureC) {
    reasons.push("temperature");
  }
  if (spread(usable, "precipitationChance") > WEATHER_THRESHOLDS.precipitationChance) {
    reasons.push("precipitation");
  }
  if (spread(usable, "windKmh") > WEATHER_THRESHOLDS.windKmh) {
    reasons.push("wind");
  }
  if (usable.some((snapshot) => snapshot.warning || snapshot.gustKmh >= 50)) {
    reasons.push("warning");
  }

  return {
    status: reasons.length ? "divergent" : "aligned",
    reasons,
    sourceCount: usable.length,
    officialSource: usable.find((snapshot) => snapshot.sourceId === "mgm")?.sourceId ?? null
  };
}

export function turkeyWeatherSources() {
  return [...DEFAULT_TURKEY_SOURCES];
}

export function summarizeWeather(snapshots) {
  const report = compareWeatherSources(snapshots);
  const official =
    snapshots.find((snapshot) => snapshot.sourceId === "open-meteo-live") ??
    snapshots.find((snapshot) => snapshot.sourceId === "mgm") ??
    snapshots[0] ??
    {};
  return {
    ...official,
    status: report.status,
    reasons: report.reasons,
    sourceCount: report.sourceCount
  };
}

function spread(items, field) {
  const values = items
    .map((item) => Number(item[field]))
    .filter((value) => Number.isFinite(value));
  if (values.length < 2) return 0;
  return Math.max(...values) - Math.min(...values);
}

function normalizeOpenMeteoHourly(hourly = {}, matchedDate) {
  const times = Array.isArray(hourly.time) ? hourly.time : [];
  const rows = times
    .map((time, index) => {
      const isoTime = String(time);
      return {
        date: isoTime.slice(0, 10),
        hour: isoTime.slice(11, 16),
        tempC: roundWeatherValue(hourly.temperature_2m?.[index]),
        precipitationChance: roundWeatherValue(hourly.precipitation_probability?.[index]),
        windKmh: roundWeatherValue(hourly.wind_speed_10m?.[index])
      };
    })
    .filter((point) => point.date === matchedDate && point.hour && Number.isFinite(point.tempC));

  const sampled = rows.filter((point, index) => {
    const hour = Number(point.hour.slice(0, 2));
    return index === 0 || index === rows.length - 1 || hour % 3 === 0;
  });

  return (sampled.length ? sampled : rows).slice(0, 12).map(({ hour, tempC, precipitationChance, windKmh }) => ({
    time: hour,
    tempC,
    precipitationChance,
    windKmh
  }));
}

function roundWeatherValue(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : fallback;
}

function toIsoDate(value) {
  if (typeof value === "string" && isIsoDate(value)) return value.slice(0, 10);
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function dateToDayNumber(date) {
  if (!isIsoDate(date)) return NaN;
  const [year, month, day] = date.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS);
}

function isIsoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value);
}
