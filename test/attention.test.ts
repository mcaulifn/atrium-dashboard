import { describe, expect, it } from "vitest";
import { attentionComponent } from "../src/components/attention";
import { cardsOfType, mockCtx, state } from "./helpers";

describe("attention", () => {
  it("flags low batteries but not healthy ones", () => {
    const out = attentionComponent.generate(
      mockCtx({
        states: {
          "sensor.a_battery": state("12", { device_class: "battery" }),
          "sensor.b_battery": state("90", { device_class: "battery" }),
        },
      }),
      {}
    );
    const list = cardsOfType(out.sections, "entities")[0].entities as string[];
    expect(list).toContain("sensor.a_battery");
    expect(list).not.toContain("sensor.b_battery");
  });

  it("flags tripped problem sensors and respects exclude", () => {
    const states = { "binary_sensor.leak": state("on", { device_class: "moisture" }) };
    expect(
      (cardsOfType(attentionComponent.generate(mockCtx({ states }), {}).sections, "entities")[0].entities as string[])
    ).toContain("binary_sensor.leak");
    expect(
      attentionComponent.generate(mockCtx({ states }), { exclude: ["binary_sensor.leak"] }).sections ?? []
    ).toHaveLength(0);
  });

  it("renders nothing when all is well", () => {
    expect(
      attentionComponent.generate(mockCtx({ states: { "sensor.x": state("ok") } }), {}).sections ?? []
    ).toHaveLength(0);
  });
});
