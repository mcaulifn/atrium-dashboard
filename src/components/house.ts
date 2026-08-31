import type { ComponentOutput, AtriumComponent, LovelaceCard } from "../types";

interface HouseOptions {
  /** climate entity_ids to show; default: every available `climate.*` entity. */
  climate?: string[];
  /** weather entity_id, or false to hide; default: the first `weather.*`. */
  weather?: string | false;
  /** extra entities rendered as tiles (e.g. solar, alarm, locks). */
  entities?: string[];
  /** include climate entities whose state is `unavailable` (default false). */
  include_unavailable?: boolean;
}

// Whole-house overview widgets for the Home screen. Each widget is its own
// section so dense placement spreads them across the columns beside the music,
// keeping the screen full but not crowded. All cards are built-in (no HACS).
export const houseComponent: AtriumComponent<HouseOptions> = {
  id: "house",
  generate(ctx, options): ComponentOutput {
    const states = ctx.hass.states;
    const sections: LovelaceCard[] = [];

    let climate =
      options.climate ?? Object.keys(states).filter((id) => id.startsWith("climate."));
    if (!options.include_unavailable) {
      climate = climate.filter((id) => states[id] && states[id].state !== "unavailable");
    }
    for (const entity of climate) {
      if (states[entity]) sections.push({ type: "grid", cards: [{ type: "thermostat", entity }] });
    }

    const weather =
      options.weather === false
        ? undefined
        : (options.weather ?? Object.keys(states).find((id) => id.startsWith("weather.")));
    if (weather && states[weather]) {
      sections.push({
        type: "grid",
        cards: [{ type: "weather-forecast", entity: weather, forecast_type: "daily" }],
      });
    }

    for (const entity of options.entities ?? []) {
      if (states[entity]) sections.push({ type: "grid", cards: [{ type: "tile", entity }] });
    }

    return { sections };
  },
};
