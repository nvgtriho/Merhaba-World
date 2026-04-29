import test from "node:test";
import assert from "node:assert/strict";
import { turkeyWeatherSources } from "../src/lib/weather.js";

test("weather source links expose only the reliable Open-Meteo jump target", () => {
  const sources = turkeyWeatherSources("Oludeniz");

  assert.deepEqual(sources.map((source) => source.id), ["open-meteo"]);
  assert.equal(sources[0].tested, true);
  assert.equal(sources[0].url, "https://open-meteo.com/");
});
