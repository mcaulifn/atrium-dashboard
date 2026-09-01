import { describe, expect, it } from "vitest";
import { musicComponent } from "../src/components/music";
import { cardsOfType, mockCtx } from "./helpers";

describe("music", () => {
  it("hero mode renders the conductor card and the now-playing pop-up", () => {
    const out = musicComponent.generate(mockCtx(), { mode: "hero" });
    expect(cardsOfType(out.sections, "custom:mass-conductor")).toHaveLength(1);
    expect(cardsOfType(out.popups, "custom:mass-conductor")).toHaveLength(1);
  });

  it("popup mode adds only the pop-up, no visible section", () => {
    const out = musicComponent.generate(mockCtx(), { mode: "popup" });
    expect(out.sections ?? []).toHaveLength(0);
    expect(cardsOfType(out.popups, "custom:mass-conductor")).toHaveLength(1);
  });

  it("header is opt-in", () => {
    const withHeader = musicComponent.generate(mockCtx(), { mode: "hero", header: true });
    const without = musicComponent.generate(mockCtx(), { mode: "hero" });
    expect(cardsOfType(withHeader.sections, "custom:bubble-card")).toHaveLength(1);
    expect(cardsOfType(without.sections, "custom:bubble-card")).toHaveLength(0);
  });

  it("passes a player through to the card", () => {
    const out = musicComponent.generate(mockCtx(), { mode: "hero", player: "media_player.kitchen" });
    expect(cardsOfType(out.sections, "custom:mass-conductor")[0].player).toBe("media_player.kitchen");
  });

  it("swaps the conductor for a custom card in both the hero and the pop-up", () => {
    const out = musicComponent.generate(mockCtx(), {
      mode: "hero",
      card: { type: "custom:mini-media-player", entity: "media_player.kitchen" },
    });
    expect(cardsOfType(out.sections, "custom:mass-conductor")).toHaveLength(0);
    expect(cardsOfType(out.sections, "custom:mini-media-player")).toHaveLength(1);
    expect(cardsOfType(out.popups, "custom:mini-media-player")).toHaveLength(1);
  });
});
