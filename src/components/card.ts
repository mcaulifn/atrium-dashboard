import type { AtriumComponent, ComponentOutput, LovelaceCard } from "../types";
import { spanSection } from "../ui";

interface CardOptions {
  /** any Lovelace card config; or pass the card's fields directly as options. */
  card?: LovelaceCard;
  /** how many of the view's columns the card's section spans (default 1). */
  column_span?: number;
}

// Passthrough: drop any Lovelace card into a view. Everything else Atrium ships
// is a convenience on top of this — a whole screen can be built from raw cards.
// `column_span` widens the card's section across view-columns; add
// `grid_options: { columns }` on the card itself to control its width within it.
//   - card: { type: custom:mini-media-player, entity: media_player.kitchen }
//   - card: { card: { type: weather-forecast, entity: weather.home }, column_span: 3 }
export const cardComponent: AtriumComponent<CardOptions> = {
  id: "card",
  generate(_ctx, options): ComponentOutput {
    const { column_span, ...rest } = options;
    const card = (options.card ?? rest) as LovelaceCard;
    if (!card || typeof card.type !== "string") return {};
    return { sections: [spanSection([card], column_span)] };
  },
};
