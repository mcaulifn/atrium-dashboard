import type { ComponentOutput, AtriumComponent, LovelaceCard } from "../types";
import { sep } from "../ui";

interface MusicOptions {
  /** "hero" adds a full player card to the view; both modes add the pop-up. */
  mode?: "hero" | "popup";
  title?: string;
  /** optional player_id passed through to the card (if it supports one). */
  player?: string;
  /** how many of the view's columns the hero section spans (default 1). */
  column_span?: number;
  /** show the "Music" header above the player (default false). */
  header?: boolean;
  /** override the player card (default: custom:mass-conductor). Any media card. */
  card?: LovelaceCard;
}

// The default player is the Music Assistant Conductor card (custom:mass-conductor)
// — its own room/player switcher makes a single instance the whole music surface.
// Swap it for any card via the `card` option; conductor is the default, not a
// requirement.
const conductor = (player?: string): LovelaceCard => ({
  type: "custom:mass-conductor",
  ...(player ? { player } : {}),
  grid_options: { columns: 12 },
});

export const musicComponent: AtriumComponent<MusicOptions> = {
  id: "music",
  generate(_ctx, options): ComponentOutput {
    const mode = options.mode ?? "hero";
    const playerCard = (): LovelaceCard =>
      options.card ? { ...options.card } : conductor(options.player);
    // Header + player as one single-column section so they stack together. We
    // don't widen it: a card can't span past one view-column, so a wider
    // section just lays the header beside the player. Horizontal space is
    // filled by dense section placement pulling the room grids up alongside.
    const span = options.column_span ?? 1;
    const cards: LovelaceCard[] = [];
    if (options.header) cards.push(sep(options.title ?? "Music", "mdi:music"));
    cards.push(playerCard());
    const sections: LovelaceCard[] =
      mode === "hero" ? [{ type: "grid", ...(span > 1 ? { column_span: span } : {}), cards }] : [];
    const popups: LovelaceCard[] = [
      {
        type: "custom:bubble-card",
        card_type: "pop-up",
        hash: "#now-playing",
        name: "Now Playing",
        icon: "mdi:music",
        cards: [playerCard()],
      },
    ];
    return { sections, popups };
  },
};
