import type {
  ComponentOutput,
  AtriumComponent,
  AtriumContext,
  LovelaceCard,
} from "../types";
import { slug } from "../ui";

interface NavItem {
  title: string;
  path: string;
  icon?: string;
}
interface NavOptions {
  /** explicit nav entries; default: Home + each floor (+ Other), matching the
   *  built-in tab layout. */
  items?: NavItem[];
  /** grid width per button out of 12 (default 6 ≈ two per column). Lower = more
   *  per row / narrower; higher = fewer / wider. */
  columns?: number;
}

function defaultItems(ctx: AtriumContext): NavItem[] {
  const items: NavItem[] = [{ title: "Home", path: "home", icon: "mdi:home" }];
  const floorsSorted = [...ctx.floors].sort((x, y) => (x.level ?? 0) - (y.level ?? 0));
  const floorIds = new Set(ctx.floors.map((f) => f.floor_id));
  for (const f of floorsSorted) {
    if (!ctx.rooms.some((a) => a.floor_id === f.floor_id)) continue;
    items.push({ title: f.name, path: slug(f.name), icon: f.icon || "mdi:floor-plan" });
  }
  if (ctx.rooms.some((a) => !a.floor_id || !floorIds.has(a.floor_id))) {
    items.push({ title: "Other", path: "other", icon: "mdi:home-outline" });
  }
  return items;
}

// An in-dashboard tab bar for when the HA header (and its view tabs) is hidden
// by kiosk mode. Plain bubble-card name buttons (same type as the room tiles)
// laid out as direct grid children across a full-width section, so each pill is
// wide enough for its label instead of being crammed into one column. Navigates
// within the current dashboard via its URL base, so it works whatever it's named.
export const navComponent: AtriumComponent<NavOptions> = {
  id: "nav",
  generate(ctx, options): ComponentOutput {
    const items = options.items ?? defaultItems(ctx);
    if (items.length < 2) return {};

    const parts = window.location.pathname.split("/").filter(Boolean);
    const base = parts.length ? `/${parts[0]}` : "";
    const columns = options.columns ?? 6;
    const buttons: LovelaceCard[] = items.map((it) => {
      const action = { action: "navigate", navigation_path: `${base}/${it.path}` };
      return {
        type: "custom:bubble-card",
        card_type: "button",
        button_type: "name",
        name: it.title,
        icon: it.icon ?? "mdi:circle-small",
        tap_action: action,
        button_action: { tap_action: action },
        grid_options: { columns },
      };
    });

    return { sections: [{ type: "grid", column_span: 3, cards: buttons }] };
  },
};
