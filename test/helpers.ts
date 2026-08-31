import type { AreaContent, AreaEntry, AtriumContext, FloorEntry } from "../src/types";

/** Minimal HA state entry. */
export function state(s: string, attributes: Record<string, unknown> = {}) {
  return { state: s, attributes } as unknown;
}

export function area(area_id: string, over: Partial<AreaEntry> = {}): AreaEntry {
  return { area_id, name: over.name ?? area_id, icon: over.icon ?? null, floor_id: over.floor_id ?? null };
}

export function floor(floor_id: string, over: Partial<FloorEntry> = {}): FloorEntry {
  return { floor_id, name: over.name ?? floor_id, icon: over.icon ?? null, level: over.level ?? 0 };
}

export function content(over: Partial<AreaContent> = {}): AreaContent {
  return { lights: [], players: [], maPlayers: [], tempEntity: null, humidityEntity: null, ...over };
}

export function mockCtx(
  over: Partial<{
    states: Record<string, unknown>;
    user: { name?: string; id?: string };
    areas: AreaEntry[];
    floors: FloorEntry[];
    byArea: Record<string, AreaContent>;
    rooms: AreaEntry[];
  }> = {}
): AtriumContext {
  const states = over.states ?? {};
  const areas = over.areas ?? [];
  const byArea = over.byArea ?? {};
  const rooms = over.rooms ?? areas;
  const playersOf = (a: AreaEntry): string[] => {
    const c = byArea[a.area_id];
    return c ? (c.maPlayers.length ? c.maPlayers : c.players) : [];
  };
  const hass = { states, user: over.user } as unknown as AtriumContext["hass"];
  return { hass, areas, floors: over.floors ?? [], byArea, rooms, playersOf };
}

/** Depth-first collect every card object with a matching `type` from a component output. */
export function cardsOfType(sections: unknown[] | undefined, type: string): Record<string, unknown>[] {
  const found: Record<string, unknown>[] = [];
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (node && typeof node === "object") {
      const o = node as Record<string, unknown>;
      if (o.type === type) found.push(o);
      if (Array.isArray(o.cards)) o.cards.forEach(walk);
    }
  };
  (sections ?? []).forEach(walk);
  return found;
}
