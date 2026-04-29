import test from "node:test";
import assert from "node:assert/strict";
import * as weather from "../src/lib/weather.js";

test("flags divergent forecasts across temperature, precipitation, and wind", () => {
  const report = weather.compareWeatherSources([
    { sourceId: "mgm", highC: 24, lowC: 15, precipitationChance: 20, windKmh: 14 },
    { sourceId: "open-meteo", highC: 29, lowC: 18, precipitationChance: 65, windKmh: 34 }
  ]);

  assert.equal(report.status, "divergent");
  assert.deepEqual(report.reasons, ["temperature", "precipitation", "wind"]);
});

test("keeps only Open-Meteo as the retained weather jump source", () => {
  const sources = weather.turkeyWeatherSources("Oludeniz");

  assert.deepEqual(sources.map((source) => source.id), ["open-meteo"]);
  assert.equal(sources[0].authority, "multi-model");
  assert.equal(sources[0].tested, true);
});

test("chooses the nearest trip day for the current date", () => {
  const days = [
    { date: "2026-04-30" },
    { date: "2026-05-01" },
    { date: "2026-05-03" }
  ];

  assert.equal(typeof weather.getNearestTripDate, "function");
  assert.equal(weather.getNearestTripDate(days, new Date("2026-04-29T12:00:00.000Z")), "2026-04-30");
  assert.equal(weather.getNearestTripDate(days, new Date("2026-05-01T12:00:00.000Z")), "2026-05-01");
  assert.equal(weather.getNearestTripDate(days, new Date("2026-05-02T12:00:00.000Z")), "2026-05-03");
  assert.equal(weather.getNearestTripDate(days, new Date("2026-05-08T12:00:00.000Z")), "2026-05-03");
});

test("builds an Open-Meteo forecast URL without requiring an API key", () => {
  assert.equal(typeof weather.createOpenMeteoUrl, "function");

  const url = new URL(weather.createOpenMeteoUrl({ latitude: 38.6431, longitude: 34.8289 }));

  assert.equal(url.origin, "https://api.open-meteo.com");
  assert.equal(url.searchParams.get("latitude"), "38.6431");
  assert.equal(url.searchParams.get("longitude"), "34.8289");
  assert.equal(url.searchParams.get("timezone"), "auto");
  assert.equal(url.searchParams.get("forecast_days"), "16");
  assert.equal(url.searchParams.get("daily").includes("temperature_2m_max"), true);
  assert.equal(url.searchParams.get("hourly").includes("precipitation_probability"), true);
});

test("normalizes Open-Meteo daily and hourly data for the requested date", () => {
  assert.equal(typeof weather.normalizeOpenMeteoForecast, "function");

  const result = weather.normalizeOpenMeteoForecast({
    daily: {
      time: ["2026-05-01", "2026-05-02"],
      temperature_2m_max: [24.6, 25.2],
      temperature_2m_min: [15.2, 16.4],
      precipitation_probability_max: [35, 42],
      wind_speed_10m_max: [18.4, 20.1]
    },
    hourly: {
      time: ["2026-05-01T00:00", "2026-05-01T03:00", "2026-05-02T00:00"],
      temperature_2m: [16.2, 18.6, 17.1],
      precipitation_probability: [20, 25, 30],
      wind_speed_10m: [9.8, 12.3, 10.1]
    }
  }, "2026-05-01");

  assert.equal(result.source, "open-meteo");
  assert.equal(result.sourceLabel, "Open-Meteo 实时");
  assert.equal(result.matchedDate, "2026-05-01");
  assert.deepEqual(result.snapshot, {
    sourceId: "open-meteo-live",
    sourceName: "Open-Meteo",
    highC: 25,
    lowC: 15,
    precipitationChance: 35,
    windKmh: 18
  });
  assert.deepEqual(result.hourlyForecast, [
    { time: "00:00", tempC: 16, precipitationChance: 20, windKmh: 10 },
    { time: "03:00", tempC: 19, precipitationChance: 25, windKmh: 12 }
  ]);
});

test("uses the nearest available Open-Meteo forecast date when the target is outside the response", () => {
  const result = weather.normalizeOpenMeteoForecast({
    daily: {
      time: ["2026-05-01", "2026-05-03"],
      temperature_2m_max: [24, 27],
      temperature_2m_min: [15, 17],
      precipitation_probability_max: [35, 18],
      wind_speed_10m_max: [18, 24]
    },
    hourly: {
      time: ["2026-05-01T00:00", "2026-05-03T06:00"],
      temperature_2m: [16, 19],
      precipitation_probability: [20, 10],
      wind_speed_10m: [10, 14]
    }
  }, "2026-05-04");

  assert.equal(result.matchedDate, "2026-05-03");
  assert.equal(result.snapshot.highC, 27);
  assert.deepEqual(result.hourlyForecast, [
    { time: "06:00", tempC: 19, precipitationChance: 10, windKmh: 14 }
  ]);
});

test("fetches Open-Meteo data through an injectable fetch implementation", async () => {
  assert.equal(typeof weather.fetchOpenMeteoForecast, "function");

  const calls = [];
  const result = await weather.fetchOpenMeteoForecast(
    { latitude: 41.0082, longitude: 28.9784 },
    "2026-05-01",
    async (url) => {
      calls.push(url);
      return {
        ok: true,
        async json() {
          return {
            daily: {
              time: ["2026-05-01"],
              temperature_2m_max: [22],
              temperature_2m_min: [13],
              precipitation_probability_max: [12],
              wind_speed_10m_max: [17]
            },
            hourly: {
              time: ["2026-05-01T09:00"],
              temperature_2m: [18],
              precipitation_probability: [10],
              wind_speed_10m: [11]
            }
          };
        }
      };
    }
  );

  assert.equal(calls.length, 1);
  assert.equal(new URL(calls[0]).searchParams.get("latitude"), "41.0082");
  assert.equal(result.matchedDate, "2026-05-01");
  assert.equal(result.snapshot.sourceId, "open-meteo-live");
});
