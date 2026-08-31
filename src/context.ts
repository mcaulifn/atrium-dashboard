import type { HomeAssistant } from "custom-card-helpers";
import type {
  AreaContent,
  AreaEntry,
  DeviceEntry,
  EntityEntry,
  FloorEntry,
  AtriumContext,
} from "./types";

// Tag-based filtering via HA Labels — no code edits to add/hide entities:
//   label "no-dashboard" -> always hidden (opt-out; tag junk like status LEDs)
//   label "dashboard"    -> force-shown (override the TV default below)
//   otherwise: lights always show; players show unless they look like a TV/cast.
export const HIDE_LABEL = "no-dashboard";
export const SHOW_LABEL = "dashboard";
export const TV_RE = /roku|_tv|sony_xr|xbox|carplay|chromecast/i;

/**
 * Resolve the HA registries into the shared context every component reads.
 *
 * :param hass: The Home Assistant connection object passed to the strategy.
 */
export async function buildContext(
  hass: HomeAssistant,
  excludeAreas: string[] = []
): Promise<AtriumContext> {
  const [allAreas, floors, entities, devices] = await Promise.all([
    hass.callWS<AreaEntry[]>({ type: "config/area_registry/list" }),
    hass.callWS<FloorEntry[]>({ type: "config/floor_registry/list" }),
    hass.callWS<EntityEntry[]>({ type: "config/entity_registry/list" }),
    hass.callWS<DeviceEntry[]>({ type: "config/device_registry/list" }),
  ]);

  // Drop excluded areas up front (matched by area_id or name, case-insensitive)
  // so their entities never enter byArea/rooms below.
  const excluded = new Set(excludeAreas.map((s) => s.toLowerCase()));
  const areas = allAreas.filter(
    (a) => !excluded.has(a.area_id.toLowerCase()) && !excluded.has(a.name.toLowerCase())
  );

  const deviceArea: Record<string, string | null> = Object.fromEntries(
    devices.map((d) => [d.id, d.area_id])
  );
  const areaOfEntity = (e: EntityEntry): string | null =>
    e.area_id ?? (e.device_id ? (deviceArea[e.device_id] ?? null) : null);

  const byArea: Record<string, AreaContent> = Object.fromEntries(
    areas.map((a): [string, AreaContent] => [
      a.area_id,
      {
        lights: [],
        players: [],
        maPlayers: [],
        tempEntity: a.temperature_entity_id ?? null,
        humidityEntity: a.humidity_entity_id ?? null,
      },
    ])
  );

  for (const e of entities) {
    if (e.disabled_by || e.hidden_by || e.entity_category) continue;
    const labels = e.labels ?? [];
    if (labels.includes(HIDE_LABEL)) continue;
    const forceShow = labels.includes(SHOW_LABEL);
    const aid = areaOfEntity(e);
    if (!aid || !byArea[aid]) continue;
    const domain = e.entity_id.split(".")[0];
    if (domain === "light") {
      byArea[aid].lights.push(e.entity_id);
    } else if (domain === "media_player" && (forceShow || !TV_RE.test(e.entity_id))) {
      byArea[aid].players.push(e.entity_id);
      if (e.platform === "music_assistant") byArea[aid].maPlayers.push(e.entity_id);
    } else if (domain === "sensor") {
      // Only claim a sensor for the tile when the area hasn't already named one.
      const dc = hass.states[e.entity_id]?.attributes?.device_class;
      if (dc === "temperature" && !byArea[aid].tempEntity) byArea[aid].tempEntity = e.entity_id;
      else if (dc === "humidity" && !byArea[aid].humidityEntity) byArea[aid].humidityEntity = e.entity_id;
    }
  }

  const playersOf = (a: AreaEntry): string[] =>
    byArea[a.area_id].maPlayers.length ? byArea[a.area_id].maPlayers : byArea[a.area_id].players;

  // A "room" is an area worth a tile: it has lights or players. Temp/humidity
  // ride along on those tiles but don't, by themselves, create one.
  const hasContent = (a: AreaEntry): boolean =>
    Boolean(byArea[a.area_id].lights.length || byArea[a.area_id].players.length);
  const rooms = areas.filter(hasContent).sort((x, y) => x.name.localeCompare(y.name));

  return { hass, areas, floors, byArea, rooms, playersOf };
}
