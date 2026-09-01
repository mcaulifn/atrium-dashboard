import type { AtriumStrategyConfig, ComponentEntry } from "./types";

// The auto-overview: a default, presence-gated list that composes the Home
// screen. Each summary renders nothing when its entities are absent, so the
// highlight reflects whatever the home actually has — and every part is
// overridable from config (`overview`).
export const DEFAULT_HERO: ComponentEntry = { music: { mode: "hero" } };
export const DEFAULT_SUMMARIES: ComponentEntry[] = [
  { house: {} },
  { attention: {} },
  { scenes: {} },
  { fans: {} },
];

export const componentId = (e: ComponentEntry): string =>
  typeof e === "string" ? e : Object.keys(e)[0];

/**
 * Build the Home view's component list: greeting header + hero + summaries,
 * applying any `overview` overrides.
 *
 * :param config: The strategy config (reads `config.overview`).
 */
export function overviewComponents(config: AtriumStrategyConfig): ComponentEntry[] {
  const ov = config.overview ?? {};
  const out: ComponentEntry[] = [];

  if (ov.header !== false) {
    out.push(typeof ov.header === "object" ? { header: ov.header } : { header: {} });
  }

  out.push(ov.hero ?? DEFAULT_HERO);

  let summaries = ov.summaries ?? DEFAULT_SUMMARIES;
  if (ov.exclude?.length) {
    const excluded = new Set(ov.exclude);
    summaries = summaries.filter((e) => !excluded.has(componentId(e)));
  }
  out.push(...summaries);

  return out;
}
