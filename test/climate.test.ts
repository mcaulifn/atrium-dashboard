import { describe, expect, it } from "vitest";
import { climateComponent } from "../src/components/climate";
import { area, content, mockCtx } from "./helpers";

describe("climate", () => {
  it("lists rooms that expose a temperature or humidity sensor", () => {
    const out = climateComponent.generate(
      mockCtx({
        rooms: [area("lr", { name: "Living Room" }), area("bar", { name: "Bar" })],
        byArea: {
          lr: content({ tempEntity: "sensor.lr_t", humidityEntity: "sensor.lr_h" }),
          bar: content(),
        },
      }),
      {}
    );
    const json = JSON.stringify(out.sections);
    expect(json).toContain("Living Room");
    expect(json).toContain("sensor.lr_t");
    expect(json).not.toContain("Bar");
  });

  it("renders nothing when no room has climate sensors", () => {
    const out = climateComponent.generate(
      mockCtx({ rooms: [area("bar")], byArea: { bar: content() } }),
      {}
    );
    expect(out.sections ?? []).toHaveLength(0);
  });
});
