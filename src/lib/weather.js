export const WEATHER_THRESHOLDS = {
  highTemperatureC: 3,
  precipitationChance: 30,
  windKmh: 15
};

const DEFAULT_TURKEY_SOURCES = [
  {
    id: "mgm",
    name: "MGM",
    authority: "official",
    label: "土耳其国家气象局",
    url: "https://www.mgm.gov.tr/eng/forecast-cities.aspx"
  },
  {
    id: "yr",
    name: "Yr / MET Norway",
    authority: "model",
    label: "挪威气象研究所全球预报",
    url: "https://www.yr.no/"
  },
  {
    id: "open-meteo",
    name: "Open-Meteo",
    authority: "multi-model",
    label: "多模型校验",
    url: "https://open-meteo.com/"
  }
];

const MARINE_LOCATIONS = ["oludeniz", "ölüdeniz", "厄吕代尼兹", "费特希耶", "fethiye"];

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

export function turkeyWeatherSources(placeName = "") {
  const sources = [...DEFAULT_TURKEY_SOURCES];
  const normalized = placeName.toLocaleLowerCase("tr");
  if (MARINE_LOCATIONS.some((name) => normalized.includes(name))) {
    sources.push({
      id: "mgm-marine",
      name: "MGM Marine",
      authority: "official",
      label: "MGM 海洋天气",
      url: "https://www.mgm.gov.tr/eng/marine.aspx"
    });
  }
  return sources;
}

export function summarizeWeather(snapshots) {
  const report = compareWeatherSources(snapshots);
  const official = snapshots.find((snapshot) => snapshot.sourceId === "mgm") ?? snapshots[0] ?? {};
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
