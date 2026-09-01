import { describe, expect, it } from "vitest";
import { scenesComponent } from "../src/components/scenes";
import { cardsOfType, mockCtx, state } from "./helpers";

describe("scenes", () => {
  it("is dormant when there are no scenes", () => {
    expect(scenesComponent.generate(mockCtx({ states: {} }), {}).sections ?? []).toHaveLength(0);
  });

  it("renders a button that activates each scene", () => {
    const out = scenesComponent.generate(
      mockCtx({ states: { "scene.movie": state("...", { friendly_name: "Movie" }) } }),
      {}
    );
    const buttons = cardsOfType(out.sections, "custom:bubble-card").filter((c) => c.card_type === "button");
    expect(buttons).toHaveLength(1);
    const action = buttons[0].tap_action as Record<string, unknown>;
    expect(action.perform_action).toBe("scene.turn_on");
    expect((action.target as Record<string, unknown>).entity_id).toBe("scene.movie");
  });

  it("includes scripts as quick actions when enabled, using script.turn_on", () => {
    const out = scenesComponent.generate(
      mockCtx({ states: { "script.night": state("off") } }),
      { include_scripts: true }
    );
    const button = cardsOfType(out.sections, "custom:bubble-card").find((c) => c.card_type === "button");
    expect((button?.tap_action as Record<string, unknown>).perform_action).toBe("script.turn_on");
  });
});
