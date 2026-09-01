import type { ComponentOutput, AtriumComponent, LovelaceCard } from "../types";
import { sep } from "../ui";

interface FansOptions {
  /** entity_ids to show; default: every `fan.*` entity. */
  entities?: string[];
  /** include fans whose state is `unavailable` (default false). */
  include_unavailable?: boolean;
  /** show the "Fans" header (default true). */
  header?: boolean;
  title?: string;
}

// Fan tiles with a speed slider (built-in tile card).
export const fansComponent: AtriumComponent<FansOptions> = {
  id: "fans",
  generate(ctx, options): ComponentOutput {
    const states = ctx.hass.states;
    let ids = options.entities ?? Object.keys(states).filter((id) => id.startsWith("fan."));
    if (!options.include_unavailable) {
      ids = ids.filter((id) => states[id] && states[id].state !== "unavailable");
    }
    if (!ids.length) return {};

    const tiles: LovelaceCard[] = ids.map((id) => ({
      type: "tile",
      entity: id,
      features: [{ type: "fan-speed" }],
    }));
    const cards =
      options.header === false ? tiles : [sep(options.title ?? "Fans", "mdi:fan"), ...tiles];
    return { sections: [{ type: "grid", cards }] };
  },
};
