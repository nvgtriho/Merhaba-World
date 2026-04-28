import test from "node:test";
import assert from "node:assert/strict";
import { compareWeatherSources, turkeyWeatherSources } from "../src/lib/weather.js";

test("flags divergent forecasts across temperature, precipitation, and wind", () => {
  const report = compareWeatherSources([
    { sourceId: "mgm", highC: 24, lowC: 15, precipitationChance: 20, windKmh: 14 },
    { sourceId: "open-meteo", highC: 29, lowC: 18, precipitationChance: 65, windKmh: 34 }
  ]);

  assert.equal(report.status, "divergent");
  assert.deepEqual(report.reasons, ["temperature", "precipitation", "wind"]);
});

test("keeps official MGM as the top Turkey source and adds marine weather for Oludeniz", () => {
  const sources = turkeyWeatherSources("Oludeniz");

  assert.equal(sources[0].authority, "official");
  assert.equal(sources[0].name, "MGM");
  assert.equal(sources.some((source) => source.id === "mgm-marine"), true);
});
