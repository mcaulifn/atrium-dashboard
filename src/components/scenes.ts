import type { ComponentOutput, AtriumComponent, LovelaceCard } from "../types";
import { sep } from "../ui";

interface ScenesOptions {
  /** entity_ids to show; default: every `scene.*` (+ `script.*` if enabled). */
  entities?: string[];
  /** also include `script.*` as quick actions (default false). */
  include_scripts?: boolean;
  /** show the "Scenes" header (default true). */
  header?: boolean;
  title?: string;
}

// Scene / quick-action buttons. Auto-detects scenes (and optionally scripts);
// dormant (renders nothing) until such entities exist.
export const scenesComponent: AtriumComponent<ScenesOptions> = {
  id: "scenes",
  generate(ctx, options): ComponentOutput {
    const states = ctx.hass.states;
    const ids =
      options.entities ??
      Object.keys(states).filter(
        (id) => id.startsWith("scene.") || (options.include_scripts && id.startsWith("script."))
      );
    if (!ids.length) return {};

    const service = (id: string): string =>
      id.startsWith("script.") ? "script.turn_on" : "scene.turn_on";
    const buttons: LovelaceCard[] = ids.map((id) => {
      const action = {
        action: "perform-action",
        perform_action: service(id),
        target: { entity_id: id },
      };
      return {
        type: "custom:bubble-card",
        card_type: "button",
        button_type: "name",
        name: states[id]?.attributes?.friendly_name ?? id,
        icon: states[id]?.attributes?.icon ?? "mdi:palette",
        tap_action: action,
        button_action: { tap_action: action },
      };
    });

    const cards =
      options.header === false ? buttons : [sep(options.title ?? "Scenes", "mdi:palette"), ...buttons];
    return { sections: [{ type: "grid", cards }] };
  },
};
