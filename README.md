# Atrium

A component-based Home Assistant **dashboard strategy**. Point it at your house
and it builds a tablet-friendly dashboard from the HA area/floor/entity
registries — per-floor room screens, whole-house widgets (thermostat, weather,
scenes, fans, attention) and a Music Assistant player — with no hand-written
YAML. All configuration is runtime: switch layout, background, exclusions and
per-component options from the dashboard YAML, no rebuild.

> Atrium began as a Lovelace replica of a Figma dashboard design (the "Horizon"
> mockup) and has since become this standalone, self-generating strategy.

---

## How it works

A single custom dashboard **strategy** built from small, dynamic **components**
instead of hand-authored YAML. It reads the HA
floor/area/entity registries at load time, so adding a floor/area/light/player
in HA makes it appear on reload — no edits. Music is the first-class
`custom:mass-conductor` card (one main player with its own room switcher), not a
third-party stand-in.

**Source:** `src/` (TypeScript) → `dist/atrium.js` (the module HA
loads). `npm install`, then `npm run build` (or `npm run watch`); `npm run
typecheck` to check types.

**Components** (`src/components/`, add one to the registry in `index.ts` and it's
usable by id):

| id | what it renders |
|------|------------|
| `header` | greeting/date band. `${greeting}` = time of day, `${user}` resolves per viewer via a `names` map (HA user name/id → display name). |
| `music` | the `custom:mass-conductor` player. `mode: hero` adds a full card; every mode contributes the shared `#now-playing` pop-up. |
| `house` | whole-house widgets: auto-detected thermostats + weather, plus any `entities` you list (solar, locks…). Built-in cards, no extra HACS. |
| `scenes` | scene / script quick-action buttons (dormant until such entities exist). |
| `fans` | fan tiles with a speed slider (hides `unavailable`). |
| `attention` | dynamic list of low batteries + tripped problem/smoke/moisture sensors (+ optional unavailable devices). |
| `rooms` | dynamic room tiles grouped by floor, each showing **temperature + humidity**, a now-playing badge, and a lights badge; taps open a lights pop-up. `All Lights Off` header. `floor` filters to one floor. |
| `nav` | in-dashboard tab bar (Home + floors) for kiosked tablets, since a hidden header hides the real tabs. Enable with `nav: true`. |
| `climate` | opt-in per-room temp/humidity strip (rooms tiles already carry these, so it's not in the default views). |
| `card` | **passthrough** — drop *any* Lovelace card into a view. Escape hatch for anything the built-ins don't cover. |

**Config** (all runtime — change it in the dashboard YAML, no rebuild):

```yaml
strategy:
  type: custom:atrium
  layout: tabs                 # "tabs" (default): Home + a screen per floor.
                               # "single": everything on one screen.
  nav: true                    # in-dashboard tab bar on every view — use with
                               # full kiosk (hidden header hides the real tabs)
  background: "center / cover no-repeat url('/local/atrium-bg.jpg')"  # optional
  exclude_areas: [House]       # drop junk/system areas by name or area_id
  component_options:           # tweak a built-in view's component without writing views:
    header:
      names: { Tablet: "McAuliffe Family" }
  kiosk: true                  # optional: hide HA header + sidebar (needs kiosk-mode)
```

> **Editing with kiosk on:** `kiosk: true` hides the header for *everyone*, so to
> reach the raw-config editor append `?disable_km` to the dashboard URL (restores
> the chrome for that session). Better: scope kiosk so admins keep the chrome —
> pass a kiosk-mode config object instead of `true`:
>
> ```yaml
> kiosk:
>   non_admin_settings:      # only non-admin users (e.g. the wall tablet) get kiosked
>     hide_header: true
>     hide_sidebar: true
> ```

Omit `layout`/`views` for the default. For full control, author `views:`
yourself — each view lists components with per-component options; `layout` is
just the zero-config default:

```yaml
strategy:
  type: custom:atrium
  views:
    - title: Home
      components:
        - header:                               # greeting resolves per viewer
            greeting: "${greeting}, ${user}"    # ${greeting}=time of day
            names: { Tablet: "Everyone" }       # HA user name/id -> display name
            default_name: "there"
        - music: { mode: hero, header: true }   # music header is off by default
        - house: { entities: [sensor.energy_production_today] }
    - title: Rooms
      components:
        - rooms: {}                             # all floors, grouped
        - music: { mode: popup }
```

**Install:** copy `dist/atrium.js` to `<config>/www/`, add it as a
JavaScript-module dashboard **Resource** (`/local/atrium.js`), then set
a dashboard's raw config to the `strategy:` block above. Needs HA 2026.5+ and the
`bubble-card` + `mass-conductor` cards.

**Per-room temp/humidity** comes from the area's configured
`temperature_entity_id`/`humidity_entity_id` when set, else the first
`temperature`/`humidity` `device_class` sensor found in that area.

## Extensibility

None of the built-in components are mandatory — every view is just a list of
components, and the `card` passthrough places any Lovelace card. Build a screen
entirely from your own cards if you like:

```yaml
components:
  - card: { type: custom:mini-media-player, entity: media_player.kitchen }
  - card: { type: weather-forecast, entity: weather.home }
  - card:                      # nested form also works; add grid_options for width
      type: custom:mushroom-chips-card
      grid_options: { columns: 6 }
```

The **music** player is swappable — `custom:mass-conductor` is the default, not a
requirement. Point it at any media card (it replaces both the hero and the
now-playing pop-up):

```yaml
- music: { card: { type: custom:mini-media-player, entity: media_player.living_room } }
```

### Card dependencies

| Cards | Needed by | Required? |
|-------|-----------|-----------|
| `bubble-card` (HACS) | `rooms`, `nav`, `scenes`, `fans`, room/now-playing pop-ups | for the default layout |
| `mass-conductor` (HACS) | `music` (default) | only if you keep the default player — swap it with `music: { card }` to drop it |
| `thermostat`, `weather-forecast`, `tile`, `entities`, `markdown` | `house`, `attention`, `header` | built into HA, no install |

> Known follow-up: room-scoped music. `mass-conductor` currently has no config to
> lock to one player, so room pop-ups show lights only and music lives on the
> hero + shared now-playing surface. Add a `player` option to the card to enable
> per-room scoped playback.
