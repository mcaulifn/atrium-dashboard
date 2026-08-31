import type { AreaEntry, LovelaceCard } from "./types";

/** A full-width Bubble Card section header. */
export const sep = (name: string, icon: string): LovelaceCard => ({
  type: "custom:bubble-card",
  card_type: "separator",
  name,
  icon,
  grid_options: { columns: 12 },
});

export const hashOf = (a: AreaEntry): string => `#room-${a.area_id}`;
export const iconOf = (a: AreaEntry): string => a.icon || "mdi:home-outline";

/** URL-safe view path from a name, e.g. "Main Bedroom" -> "main-bedroom". */
export const slug = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
