import type { AtriumComponent, ComponentOutput, LovelaceCard } from "../types";

interface CardOptions {
  /** any Lovelace card config; or pass the card's fields directly as options. */
  card?: LovelaceCard;
}

// Passthrough: drop any Lovelace card into a view. Everything else Atrium ships
// is a convenience on top of this — a whole screen can be built from raw cards.
// Add `grid_options: { columns }` on the card itself to control its width.
//   - card: { type: custom:mini-media-player, entity: media_player.kitchen }
//   - card: { card: { type: weather-forecast, entity: weather.home } }
export const cardComponent: AtriumComponent<CardOptions> = {
  id: "card",
  generate(_ctx, options): ComponentOutput {
    const card = (options.card ?? options) as LovelaceCard;
    if (!card || typeof card.type !== "string") return {};
    return { sections: [{ type: "grid", cards: [card] }] };
  },
};
