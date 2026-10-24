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

  it("spans view-columns and stretches the card to fill the section", () => {
    const out = cardComponent.generate(mockCtx(), {
      card: { type: "custom:calendar-card-pro", entities: ["calendar.outlook"] },
      column_span: 3,
    });
    expect(out.sections?.[0].column_span).toBe(3);
    expect(cardsOfType(out.sections, "custom:calendar-card-pro")[0].grid_options).toEqual({ columns: "full" });
  });

  it("keeps column_span out of a card passed directly, and respects its own width", () => {
    const out = cardComponent.generate(mockCtx(), {
      type: "weather-forecast",
      grid_options: { columns: 18 },
      column_span: 2,
    });
    const card = cardsOfType(out.sections, "weather-forecast")[0];
    expect(out.sections?.[0].column_span).toBe(2);
    expect(card.column_span).toBeUndefined();
    expect(card.grid_options).toEqual({ columns: 18 });
  });

  it("leaves a single-column card at its default width", () => {
    const out = cardComponent.generate(mockCtx(), { card: { type: "weather-forecast" } });
    expect(out.sections?.[0].column_span).toBeUndefined();
    expect(cardsOfType(out.sections, "weather-forecast")[0].grid_options).toBeUndefined();
  });
});
