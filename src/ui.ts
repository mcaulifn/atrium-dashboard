import type { AreaEntry, LovelaceCard } from "./types";

/** A full-width Bubble Card section header. */
export const sep = (name: string, icon: string): LovelaceCard => ({
  type: "custom:bubble-card",
  card_type: "separator",
  name,
  icon,
  grid_options: { columns: 12 },
});

/**
 * A grid section spanning `span` view-columns. HA sizes cards in twelfths of a
 * single column, so a default-width card stays one column wide inside a wider
 * section; cards that don't set their own `grid_options.columns` are stretched
 * to `full` so the span is actually visible.
 */
export const spanSection = (cards: LovelaceCard[], span = 1): LovelaceCard => {
  if (span <= 1) return { type: "grid", cards };
  const fill = (c: LovelaceCard): LovelaceCard => {
    const grid = (c.grid_options ?? {}) as Record<string, unknown>;
    return grid.columns === undefined ? { ...c, grid_options: { ...grid, columns: "full" } } : c;
  };
  return { type: "grid", column_span: span, cards: cards.map(fill) };
};

export const hashOf = (a: AreaEntry): string => `#room-${a.area_id}`;
export const iconOf = (a: AreaEntry): string => a.icon || "mdi:home-outline";

/** URL-safe view path from a name, e.g. "Main Bedroom" -> "main-bedroom". */
export const slug = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
