import { describe, expect, it } from "vitest";
import { fansComponent } from "../src/components/fans";
import { cardsOfType, mockCtx, state } from "./helpers";

const states = {
  "fan.ceiling": state("on"),
  "fan.hot_tub_jets": state("unavailable"),
};

describe("fans", () => {
  it("renders a fan-speed tile per available fan, hiding unavailable ones", () => {
    const tiles = cardsOfType(fansComponent.generate(mockCtx({ states }), {}).sections, "tile");
    expect(tiles).toHaveLength(1);
    expect(tiles[0].entity).toBe("fan.ceiling");
    expect((tiles[0].features as unknown[])[0]).toEqual({ type: "fan-speed" });
  });

  it("include_unavailable keeps unavailable fans", () => {
    expect(cardsOfType(fansComponent.generate(mockCtx({ states }), { include_unavailable: true }).sections, "tile")).toHaveLength(2);
  });

  it("is dormant when there are no fans", () => {
    expect(fansComponent.generate(mockCtx({ states: {} }), {}).sections ?? []).toHaveLength(0);
  });
});
