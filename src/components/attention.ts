import type { ComponentOutput, AtriumComponent, LovelaceCard } from "../types";
import { sep } from "../ui";

interface AttentionOptions {
  /** flag battery sensors at or below this percent (default 20). */
  battery_threshold?: number;
  /** also flag `unavailable` controllable entities (default false — noisy). */
  include_unavailable?: boolean;
  /** entity_ids to never flag. */
  exclude?: string[];
  /** show the "Needs attention" header (default true). */
  header?: boolean;
  title?: string;
}

const PROBLEM_CLASSES = ["problem", "smoke", "gas", "moisture", "safety", "carbon_monoxide"];
const UNAVAILABLE_DOMAINS = ["light", "switch", "climate", "lock", "cover", "fan", "media_player"];

// A dynamic "things that want a look" list: low batteries, tripped
// problem/smoke/moisture sensors, and (optionally) unavailable devices. Renders
// nothing when all is well.
export const attentionComponent: AtriumComponent<AttentionOptions> = {
  id: "attention",
  generate(ctx, options): ComponentOutput {
    const states = ctx.hass.states;
    const threshold = options.battery_threshold ?? 20;
    const exclude = new Set(options.exclude ?? []);
    const problems: string[] = [];

    for (const [id, s] of Object.entries(states)) {
      if (exclude.has(id)) continue;
      const dom = id.split(".")[0];
      const dc = s.attributes?.device_class;
      if (dom === "sensor" && dc === "battery") {
        const v = Number(s.state);
        if (!Number.isNaN(v) && v <= threshold) problems.push(id);
      } else if (
        dom === "binary_sensor" &&
        typeof dc === "string" &&
        PROBLEM_CLASSES.includes(dc) &&
        s.state === "on"
      ) {
        problems.push(id);
      } else if (
        options.include_unavailable &&
        s.state === "unavailable" &&
        UNAVAILABLE_DOMAINS.includes(dom)
      ) {
        problems.push(id);
      }
    }

    if (!problems.length) return {};
    const cards: LovelaceCard[] = [{ type: "entities", entities: problems }];
    if (options.header !== false) {
      cards.unshift(sep(options.title ?? "Needs attention", "mdi:alert-circle"));
    }
    return { sections: [{ type: "grid", cards }] };
  },
};
