import type {
  AreaEntry,
  ComponentOutput,
  AtriumComponent,
  AtriumContext,
  LovelaceCard,
} from "../types";
import { hashOf, iconOf, sep } from "../ui";

interface RoomsOptions {
  /** "floor" groups tiles under floor headers (default); "none" is one grid. */
  group_by?: "floor" | "none";
  /** prepend an "All Lights Off" button (default true). */
  all_lights_off?: boolean;
  /** render only this floor's rooms (its floor_id, or "__orphans__" for none). */
  floor?: string;
}

/** One room tile: name, temp/humidity readouts, now-playing + lights badges. */
const roomTile = (ctx: AtriumContext, a: AreaEntry): LovelaceCard => {
  const { lights, tempEntity, humidityEntity } = ctx.byArea[a.area_id];
  const players = ctx.playersOf(a);
  const sub: LovelaceCard[] = [];

  // Always-on climate readouts on the tile — show the value, not just an icon.
  if (tempEntity)
    sub.push({ entity: tempEntity, show_background: false, show_icon: false, show_state: true });
  if (humidityEntity)
    sub.push({
      entity: humidityEntity,
      show_background: false,
      show_icon: false,
      show_state: true,
    });

  // Now-playing badge — visible only while the room's player is playing.
  if (players.length) {
    sub.push({
      entity: players[0],
      icon: "mdi:music",
      show_background: true,
      show_attribute: true,
      attribute: "media_title",
      tap_action: { action: "navigate", navigation_path: "#now-playing" },
      visibility: [{ condition: "state", entity: players[0], state: "playing" }],
    });
  }

  // Lights badge — visible when any light in the room is on.
  if (lights.length) {
    sub.push({
      icon: "mdi:lightbulb-group",
      show_background: true,
      tap_action: { action: "navigate", navigation_path: hashOf(a) },
      visibility: [
        {
          condition: "or",
          conditions: lights.map((entity) => ({ condition: "state", entity, state: "on" })),
        },
      ],
    });
  }

  // Tapping the tile opens its lights pop-up, or jumps to now-playing if the
  // room only has a player, or does nothing if it has neither.
  const primary = lights.length ? hashOf(a) : players.length ? "#now-playing" : null;
  return {
    type: "custom:bubble-card",
    card_type: "button",
    button_type: "name",
    name: a.name,
    icon: iconOf(a),
    tap_action: primary ? { action: "navigate", navigation_path: primary } : { action: "none" },
    button_action: primary
      ? { tap_action: { action: "navigate", navigation_path: primary } }
      : undefined,
    sub_button: sub,
  };
};

/** The room's lights pop-up (null when the room has no lights to control). */
const roomPopup = (ctx: AtriumContext, a: AreaEntry): LovelaceCard | null => {
  const { lights } = ctx.byArea[a.area_id];
  if (!lights.length) return null;
  return {
    type: "custom:bubble-card",
    card_type: "pop-up",
    hash: hashOf(a),
    name: a.name,
    icon: iconOf(a),
    cards: [
      sep("Lights", "mdi:lightbulb-group"),
      {
        type: "grid",
        columns: 2,
        square: false,
        cards: lights.map((entity) => ({
          type: "custom:bubble-card",
          card_type: "button",
          button_type: "switch",
          entity,
        })),
      },
    ],
  };
};

const allLightsOff = (allLights: string[]): LovelaceCard => ({
  type: "grid",
  cards: [
    {
      type: "custom:bubble-card",
      card_type: "button",
      button_type: "name",
      name: "All Lights Off",
      icon: "mdi:lightbulb-group-off",
      tap_action: {
        action: "perform-action",
        perform_action: "light.turn_off",
        target: { entity_id: allLights },
      },
      button_action: {
        tap_action: {
          action: "perform-action",
          perform_action: "light.turn_off",
          target: { entity_id: allLights },
        },
      },
    },
  ],
});

export const roomsComponent: AtriumComponent<RoomsOptions> = {
  id: "rooms",
  generate(ctx, options): ComponentOutput {
    const sections: LovelaceCard[] = [];
    const popups: LovelaceCard[] = [];

    const floorIds = new Set(ctx.floors.map((f) => f.floor_id));
    const rooms = options.floor
      ? options.floor === "__orphans__"
        ? ctx.rooms.filter((a) => !a.floor_id || !floorIds.has(a.floor_id))
        : ctx.rooms.filter((a) => a.floor_id === options.floor)
      : ctx.rooms;

    if (options.all_lights_off !== false) {
      const allLights = rooms.flatMap((a) => ctx.byArea[a.area_id].lights);
      if (allLights.length) sections.push(allLightsOff(allLights));
    }

    if (options.floor || (options.group_by ?? "floor") === "none") {
      // Single-floor (or ungrouped) view — the view title already names it, so
      // just the tiles, one per section so dense placement can pack them.
      for (const a of rooms) sections.push({ type: "grid", cards: [roomTile(ctx, a)] });
    } else {
      const floorsSorted = [...ctx.floors].sort((x, y) => (x.level ?? 0) - (y.level ?? 0));
      const placed = new Set<string>();
      for (const f of floorsSorted) {
        const inFloor = rooms.filter((a) => a.floor_id === f.floor_id);
        if (!inFloor.length) continue;
        inFloor.forEach((a) => placed.add(a.area_id));
        sections.push({
          type: "grid",
          cards: [
            sep(f.name, f.icon || "mdi:layers-triple-outline"),
            ...inFloor.map((a) => roomTile(ctx, a)),
          ],
        });
      }
      const orphans = rooms.filter((a) => !placed.has(a.area_id));
      if (orphans.length) {
        sections.push({
          type: "grid",
          cards: [sep("Other", "mdi:home-outline"), ...orphans.map((a) => roomTile(ctx, a))],
        });
      }
    }

    for (const a of rooms) {
      const p = roomPopup(ctx, a);
      if (p) popups.push(p);
    }

    return { sections, popups };
  },
};
