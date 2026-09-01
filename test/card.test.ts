import { describe, expect, it } from "vitest";
import { cardComponent } from "../src/components/card";
import { cardsOfType, mockCtx } from "./helpers";

describe("card passthrough", () => {
  it("emits the card given via `card`", () => {
    const out = cardComponent.generate(mockCtx(), {
      card: { type: "custom:mini-media-player", entity: "media_player.kitchen" },
    });
    expect(cardsOfType(out.sections, "custom:mini-media-player")).toHaveLength(1);
  });

  it("also accepts the card fields passed directly", () => {
    const out = cardComponent.generate(mockCtx(), { type: "weather-forecast", entity: "weather.home" });
    expect(cardsOfType(out.sections, "weather-forecast")[0].entity).toBe("weather.home");
  });

  it("renders nothing without a card type", () => {
    expect(cardComponent.generate(mockCtx(), {}).sections ?? []).toHaveLength(0);
  });
});
