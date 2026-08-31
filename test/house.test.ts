import { describe, expect, it } from "vitest";
import { houseComponent } from "../src/components/house";
import { cardsOfType, mockCtx, state } from "./helpers";

const states = {
  "climate.main": state("cool", { current_temperature: 74 }),
  "climate.hot_tub": state("unavailable"),
  "weather.home": state("cloudy"),
  "sensor.solar": state("13.8", { unit_of_measurement: "kWh" }),
};

describe("house", () => {
  it("shows available thermostats and hides unavailable ones", () => {
    const out = houseComponent.generate(mockCtx({ states }), {});
    const thermostats = cardsOfType(out.sections, "thermostat");
    expect(thermostats).toHaveLength(1);
    expect(thermostats[0].entity).toBe("climate.main");
  });

  it("include_unavailable keeps the unavailable thermostat", () => {
    const out = houseComponent.generate(mockCtx({ states }), { include_unavailable: true });
    expect(cardsOfType(out.sections, "thermostat")).toHaveLength(2);
  });

  it("auto-detects a weather entity and can be turned off", () => {
    expect(cardsOfType(houseComponent.generate(mockCtx({ states }), {}).sections, "weather-forecast")).toHaveLength(1);
    expect(
      cardsOfType(houseComponent.generate(mockCtx({ states }), { weather: false }).sections, "weather-forecast")
    ).toHaveLength(0);
  });

  it("renders extra entities as tiles", () => {
    const out = houseComponent.generate(mockCtx({ states }), { entities: ["sensor.solar"] });
    const tiles = cardsOfType(out.sections, "tile");
    expect(tiles.map((t) => t.entity)).toContain("sensor.solar");
  });
});
