import type { ComponentOutput, AtriumComponent, LovelaceCard } from "../types";
import { iconOf, sep } from "../ui";

interface ClimateOptions {
  title?: string;
}

// Opt-in climate strip: a per-room temperature/humidity readout for every area
// that exposes either sensor. Not in the default views (rooms tiles already
// carry temp/humidity) — add `{ climate: {} }` to a view to use it.
export const climateComponent: AtriumComponent<ClimateOptions> = {
  id: "climate",
  generate(ctx, options): ComponentOutput {
    const rooms = ctx.rooms.filter((a) => {
      const c = ctx.byArea[a.area_id];
      return c.tempEntity || c.humidityEntity;
    });
    if (!rooms.length) return {};

    const cards: LovelaceCard[] = [sep(options.title ?? "Climate", "mdi:thermometer")];
    for (const a of rooms) {
      const { tempEntity, humidityEntity } = ctx.byArea[a.area_id];
      const sub: LovelaceCard[] = [];
      if (humidityEntity) sub.push({ entity: humidityEntity });
      cards.push({
        type: "custom:bubble-card",
        card_type: "button",
        button_type: "name",
        name: a.name,
        icon: iconOf(a),
        entity: tempEntity ?? humidityEntity,
        show_state: true,
        sub_button: sub,
      });
    }
    return { sections: [{ type: "grid", cards }] };
  },
};
