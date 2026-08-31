import type { HomeAssistant } from "custom-card-helpers";

/** A Lovelace card config object (structural — HA validates the real shape). */
export type LovelaceCard = Record<string, unknown>;

// ---- HA registry shapes (only the fields we read) -------------------------

export interface AreaEntry {
  area_id: string;
  name: string;
  icon: string | null;
  floor_id: string | null;
  // Newer HA lets an area name its own temperature/humidity sensor; we prefer
  // these when present and otherwise fall back to sensors found in the area.
  temperature_entity_id?: string | null;
  humidity_entity_id?: string | null;
}

export interface FloorEntry {
  floor_id: string;
  name: string;
  icon: string | null;
  level: number | null;
}

export interface EntityEntry {
  entity_id: string;
  area_id: string | null;
  device_id: string | null;
  platform: string;
  labels?: string[];
  disabled_by?: string | null;
  hidden_by?: string | null;
  entity_category?: string | null;
}

export interface DeviceEntry {
  id: string;
  area_id: string | null;
}

// ---- derived per-area content ---------------------------------------------

export interface AreaContent {
  lights: string[];
  players: string[];
  /** subset of players from the Music Assistant integration (preferred). */
  maPlayers: string[];
  tempEntity: string | null;
  humidityEntity: string | null;
}

/** Registry data resolved once and handed to every component. */
export interface AtriumContext {
  hass: HomeAssistant;
  areas: AreaEntry[];
  floors: FloorEntry[];
  byArea: Record<string, AreaContent>;
  /** areas that have displayable content, name-sorted. */
  rooms: AreaEntry[];
  /** a room's preferred players (its MA players if any, else all players). */
  playersOf(area: AreaEntry): string[];
}

// ---- components ------------------------------------------------------------

export interface ComponentOutput {
  /** cards appended to the view body, in order. */
  sections?: LovelaceCard[];
  /** bubble-card pop-ups, collected into a hidden trailing section. */
  popups?: LovelaceCard[];
}

export interface AtriumComponent<O = Record<string, unknown>> {
  id: string;
  generate(ctx: AtriumContext, options: O): ComponentOutput;
}

// ---- strategy config -------------------------------------------------------

/** `"rooms"` or `{ rooms: { group_by: "floor" } }`. */
export type ComponentEntry = string | { [id: string]: Record<string, unknown> };

export interface AtriumViewConfig {
  title?: string;
  path?: string;
  icon?: string;
  max_columns?: number;
  components?: ComponentEntry[];
}

export interface AtriumStrategyConfig {
  /** explicit views; overrides `layout`. Compose components per view yourself. */
  views?: AtriumViewConfig[];
  /** "tabs" (default): Home + one screen per floor. "single": one screen. */
  layout?: "tabs" | "single";
  /** prepend an in-dashboard nav bar to every view (for full-kiosk tablets). */
  nav?: boolean;
  /** CSS background applied to every generated view (image, gradient, colour). */
  background?: string;
  /** area_ids or names to omit entirely (e.g. a junk system area). */
  exclude_areas?: string[];
  /**
   * Options merged into every component of that id in the built-in views, so
   * you can tweak a default (e.g. `header: { names: {...} }`) without hand-
   * writing `views:`. Per-view options win over these.
   */
  component_options?: Record<string, Record<string, unknown>>;
  /**
   * Hide HA header + sidebar (needs the kiosk-mode plugin). `true` hides both
   * for everyone; pass a kiosk-mode config object to scope it (e.g. only
   * non-admins) so admins keep the chrome to edit — see README.
   */
  kiosk?: boolean | Record<string, unknown>;
}
