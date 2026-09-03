import type { HomeAssistant } from "custom-card-helpers";
import { COMPONENTS } from "./components";
import { buildContext } from "./context";
import type {
  ComponentEntry,
  AtriumContext,
  AtriumStrategyConfig,
  AtriumViewConfig,
  LovelaceCard,
} from "./types";
import { overviewComponents } from "./overview";
import { slug } from "./ui";

// Default when no `views:` are given and `layout: tabs`. Lean and tablet-first:
// Home is the auto-overview (hero + presence-gated summaries); each floor with
// rooms gets its own screen. Every room screen pulls in the shared #now-playing
// pop-up (mode: popup) so a tile's music badge has somewhere to open.
function tabViews(
  ctx: AtriumContext,
  config: AtriumStrategyConfig,
): AtriumViewConfig[] {
  const views: AtriumViewConfig[] = [
    {
      title: "Home",
      path: "home",
      icon: "mdi:home",
      components: overviewComponents(config),
    },
  ];

  const floorsSorted = [...ctx.floors].sort(
    (x, y) => (x.level ?? 0) - (y.level ?? 0),
  );
  const floorIds = new Set(ctx.floors.map((f) => f.floor_id));
  for (const f of floorsSorted) {
    if (!ctx.rooms.some((a) => a.floor_id === f.floor_id)) continue;
    views.push({
      title: f.name,
      path: slug(f.name),
      icon: f.icon || "mdi:floor-plan",
      components: [
        { rooms: { floor: f.floor_id } },
        { music: { mode: "popup" } },
      ],
    });
  }

  if (ctx.rooms.some((a) => !a.floor_id || !floorIds.has(a.floor_id))) {
    views.push({
      title: "Other",
      path: "other",
      icon: "mdi:home-outline",
      components: [
        { rooms: { floor: "__orphans__" } },
        { music: { mode: "popup" } },
      ],
    });
  }

  return views;
}

// Default when `layout: single` — the overview plus all rooms grouped by floor
// on one screen. Dense placement keeps it tidy.
function singleViews(config: AtriumStrategyConfig): AtriumViewConfig[] {
  return [
    {
      title: "Home",
      path: "home",
      icon: "mdi:home",
      components: [...overviewComponents(config), { rooms: {} }],
    },
  ];
}

function normalize(entry: ComponentEntry): {
  id: string;
  options: Record<string, unknown>;
} {
  if (typeof entry === "string") return { id: entry, options: {} };
  const id = Object.keys(entry)[0];
  return { id, options: entry[id] ?? {} };
}

// kiosk-mode is a separate plugin (HACS). Atrium only emits the `kiosk_mode`
// key it reads; `true` is shorthand for hiding both chrome elements, and any
// object is passed through so its own scoping (non_admin_settings, user_settings,
// mobile_settings, debug) works unchanged.
export function kioskMode(
  kiosk: AtriumStrategyConfig["kiosk"],
): Record<string, unknown> | undefined {
  if (!kiosk) return undefined;
  return kiosk === true ? { hide_header: true, hide_sidebar: true } : kiosk;
}

// Without the plugin installed, `kiosk:` is inert and the header/sidebar simply
// stay visible with no error anywhere — the one failure mode a user cannot see.
// kiosk-mode publishes itself as window.KioskMode; give resources time to load
// before deciding it is absent.
const KIOSK_PLUGIN_GRACE_MS = 5000;

interface KioskModeWindow extends Window {
  KioskMode?: unknown;
}

function warnIfKioskPluginMissing(): void {
  window.setTimeout(() => {
    if ((window as KioskModeWindow).KioskMode) return;
    console.warn(
      "[atrium] `kiosk:` is set but the kiosk-mode plugin was not detected. " +
        "Install kiosk-mode (HACS) and add it as a dashboard resource, or the " +
        "header and sidebar stay visible. https://github.com/NemesisRE/kiosk-mode",
    );
  }, KIOSK_PLUGIN_GRACE_MS);
}

class AtriumStrategy extends HTMLElement {
  static async generate(config: AtriumStrategyConfig, hass: HomeAssistant) {
    const ctx = await buildContext(hass, config.exclude_areas);
    const viewConfigs = config.views?.length
      ? config.views
      : config.layout === "single"
        ? singleViews(config)
        : tabViews(ctx, config);

    const views = viewConfigs.map((v) => {
      const sections: LovelaceCard[] = [];
      const popups: LovelaceCard[] = [];

      // Prepend the nav bar to every view when enabled (kiosk hides the tabs).
      const components: ComponentEntry[] = config.nav
        ? [{ nav: {} }, ...(v.components ?? [])]
        : (v.components ?? []);

      for (const entry of components) {
        const { id, options } = normalize(entry);
        const component = COMPONENTS[id];
        if (!component) {
          console.warn(`[atrium] unknown component: ${id}`);
          continue;
        }
        // Merge any strategy-level defaults for this component id under the
        // per-view options (per-view wins), so `component_options` can tweak the
        // built-in views without hand-writing `views:`.
        const merged = {
          ...(config.component_options?.[id] ?? {}),
          ...options,
        };
        // A broken component must never take the whole dashboard down with it.
        try {
          const out = component.generate(ctx, merged);
          if (out.sections) sections.push(...out.sections);
          if (out.popups) popups.push(...out.popups);
        } catch (err) {
          console.error(`[atrium] component "${id}" failed`, err);
        }
      }

      // Bubble pop-ups render as overlays but must live in the view body.
      if (popups.length) sections.push({ type: "grid", cards: popups });

      return {
        title: v.title ?? "Atrium",
        ...(v.path ? { path: v.path } : {}),
        ...(v.icon ? { icon: v.icon } : {}),
        type: "sections",
        max_columns: v.max_columns ?? 3,
        // Pack sections into gaps instead of leaving voids beside tall cards.
        dense_section_placement: true,
        ...(config.background ? { background: config.background } : {}),
        sections,
      };
    });

    const kiosk_mode = kioskMode(config.kiosk);
    if (kiosk_mode) warnIfKioskPluginMissing();

    return {
      title: "Atrium",
      ...(kiosk_mode ? { kiosk_mode } : {}),
      views,
    };
  }
}

// Injected at build time from package.json (see esbuild.mjs).
declare const __ATRIUM_VERSION__: string;
const VERSION = __ATRIUM_VERSION__;

customElements.define("ll-strategy-dashboard-atrium", AtriumStrategy);

// Announce the loaded version so it's visible in the browser console and
// greppable in the served bundle — no more comparing hashes to know what's live.
console.info(`%cAtrium%c v${VERSION}`, "font-weight:bold", "color:#7aa2f7");

interface CustomStrategyWindow extends Window {
  customStrategies?: unknown[];
}
const w = window as CustomStrategyWindow;
w.customStrategies = w.customStrategies || [];
w.customStrategies.push({
  type: "atrium",
  strategyType: "dashboard",
  name: `Atrium v${VERSION}`,
  description:
    "Composes rooms, music (Music Assistant Conductor) and whole-house widgets from the HA registries.",
});
