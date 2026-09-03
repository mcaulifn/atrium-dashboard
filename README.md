# Atrium

A Home Assistant dashboard strategy that generates a tablet-friendly dashboard
from the floor, area and entity registries: per-floor room screens, whole-house
widgets (thermostat, weather, scenes, fans, attention) and a Music Assistant
player, with no hand-written YAML. Adding a floor, area, light or player in HA
makes it appear on reload.

Everything is runtime config. Layout, background, exclusions and per-component
options come from the dashboard YAML, no rebuild.

## Requirements

- Home Assistant 2026.5+
- [`bubble-card`](https://github.com/Clooos/Bubble-Card) (HACS) for the default layout
- [`mass-conductor`](https://github.com/mcaulifn/mass-conductor) (HACS) for the default music player
- [`kiosk-mode`](https://github.com/NemesisRE/kiosk-mode) (HACS) only if you set `kiosk:`

## Install

1. Copy `dist/atrium.js` to `<config>/www/`.
2. Add `/local/atrium.js` as a JavaScript-module dashboard **Resource**.
3. Set the dashboard's raw config to:

```yaml
strategy:
  type: custom:atrium
```

That is the whole configuration. Everything below is optional.

## Strategy options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `layout` | `tabs` \| `single` | `tabs` | `tabs`: Home plus one screen per floor. `single`: everything on one screen. |
| `views` | list | — | Explicit views. Overrides `layout`. See [Views](#views). |
| `overview` | map | — | Composition of the Home screen. See [Overview](#overview). |
| `nav` | bool | `false` | Prepend an in-dashboard tab bar to every view, for kiosked tablets whose hidden header also hides the real tabs. |
| `background` | string | — | CSS background applied to every view, e.g. `"center / cover no-repeat url('/local/atrium-bg.jpg')"`. |
| `exclude_areas` | list | — | Areas to omit entirely, by `area_id` or name. |
| `component_options` | map | — | Options merged into every component of that id in the built-in views. Per-view options win. |
| `kiosk` | bool \| map | `false` | Hide the HA header and sidebar. Needs the kiosk-mode plugin. See [Kiosk](#kiosk). |

## Components

Each view is a list of components. They live in `src/components/`; add one to
the registry in `index.ts` and it is usable by id.

| id | Renders |
|----|---------|
| `header` | Greeting and date band. |
| `music` | The music player, plus the shared `#now-playing` pop-up. |
| `house` | Auto-detected thermostats and weather, plus any extra entities. |
| `scenes` | Scene and script quick-action buttons. Renders nothing until such entities exist. |
| `fans` | Fan tiles with a speed slider. |
| `attention` | Low batteries and tripped problem, smoke or moisture sensors. |
| `rooms` | Room tiles grouped by floor: temperature, humidity, now-playing and lights badges. Taps open a lights pop-up. |
| `nav` | Tab bar (Home plus floors) for kiosked tablets. |
| `climate` | Per-room temperature and humidity strip. Opt-in; room tiles already carry both. |
| `card` | Passthrough for any Lovelace card. |

### Component options

| Component | Option | Type | Default | Description |
|-----------|--------|------|---------|-------------|
| `header` | `greeting` | string | `"${greeting}, ${user}"` | `${greeting}` is the time of day, `${user}` the resolved viewer name. |
| | `name` | string | — | Flat override for `${user}`: the same name for everyone. |
| | `names` | map | — | Per-viewer names keyed by HA user name or id, e.g. `{ Tablet: "Everyone" }`. |
| | `default_name` | string | HA user's name | Fallback when neither `names` nor `name` applies. |
| | `show_date` | bool | `true` | Show today's date under the greeting. |
| | `column_span` | number | `3` | Columns to span. |
| `music` | `mode` | `hero` \| `popup` | `hero` | `hero` adds a full player card. Both modes add the pop-up. |
| | `card` | card config | `custom:mass-conductor` | Override the player card. Replaces both the hero and the pop-up. |
| | `player` | entity_id | — | Passed through to the card, if it supports one. |
| | `header` | bool | `false` | Show the section header. |
| | `title` | string | `"Music"` | Header text. |
| | `column_span` | number | `1` | Columns the hero spans. |
| `house` | `climate` | list | all `climate.*` | Climate entities to show. |
| | `weather` | entity_id \| `false` | first `weather.*` | Weather entity, or `false` to hide. |
| | `entities` | list | — | Extra entities rendered as tiles, e.g. solar, alarm, locks. |
| | `include_unavailable` | bool | `false` | Include `unavailable` climate entities. |
| `scenes` | `entities` | list | all `scene.*` | Entities to show. |
| | `include_scripts` | bool | `false` | Also include `script.*` as quick actions. |
| | `header` | bool | `true` | Show the section header. |
| | `title` | string | `"Scenes"` | Header text. |
| `fans` | `entities` | list | all `fan.*` | Entities to show. |
| | `include_unavailable` | bool | `false` | Include `unavailable` fans. |
| | `header` | bool | `true` | Show the section header. |
| | `title` | string | `"Fans"` | Header text. |
| `attention` | `battery_threshold` | number | `20` | Flag battery sensors at or below this percent. |
| | `include_unavailable` | bool | `false` | Also flag unavailable controllable entities. Noisy. |
| | `exclude` | list | — | Entity ids to never flag. |
| | `header` | bool | `true` | Show the section header. |
| | `title` | string | `"Needs attention"` | Header text. |
| `rooms` | `group_by` | `floor` \| `none` | `floor` | `floor` groups tiles under floor headers, `none` is one grid. |
| | `floor` | floor_id | — | Render only this floor's rooms. `__orphans__` for rooms with no floor. |
| | `all_lights_off` | bool | `true` | Prepend an "All Lights Off" button. |
| `nav` | `items` | list | Home plus each floor | Explicit entries of `{ title, path, icon }`. |
| | `columns` | number | `6` | Grid width per button out of 12. Lower is narrower and fits more per row. |
| `climate` | `title` | string | `"Climate"` | Header text. |
| `card` | `card` | card config | — | Any Lovelace card. The card's fields may also be passed directly. |

Per-room temperature and humidity come from the area's configured
`temperature_entity_id` and `humidity_entity_id` when set, otherwise from the
first `temperature` or `humidity` `device_class` sensor in that area.

## Overview

The Home screen is a hero plus a list of summaries, each of which renders only
when its entities exist.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `hero` | component entry | `music` hero | The anchor component. Any component or card. |
| `summaries` | list | `house`, `attention`, `scenes`, `fans` | Ordered summary list, replacing the default. |
| `exclude` | list | — | Drop summaries by component id without restating the list. |
| `header` | bool \| map | `true` | `false` hides the greeting band; a map passes `header` options. |

```yaml
strategy:
  type: custom:atrium
  overview:
    exclude: [fans]
    hero: { music: { card: { type: custom:mini-media-player } } }
```

## Views

Author `views:` for full control. Each view takes `title`, `path`, `icon`,
`max_columns` and a list of `components`:

```yaml
strategy:
  type: custom:atrium
  views:
    - title: Home
      components:
        - header: { names: { Tablet: "Everyone" } }
        - music: { mode: hero }
        - house: { entities: [sensor.energy_production_today] }
    - title: Rooms
      components:
        - rooms: {}
        - music: { mode: popup }
```

A component with no options can be written as a bare string: `- rooms`.

## Kiosk

Hiding the header and sidebar is done by the
[kiosk-mode](https://github.com/NemesisRE/kiosk-mode) plugin, which must be
installed from HACS **and added as a dashboard resource**. Atrium only passes
your `kiosk:` value through to it as the dashboard's `kiosk_mode` config.

`kiosk: true` is shorthand for hiding both for everyone. Any object is handed to
kiosk-mode untouched, so all of its own scoping works. To keep the chrome for
admins and kiosk only the tablet:

```yaml
strategy:
  type: custom:atrium
  kiosk:
    non_admin_settings:
      hide_header: true
      hide_sidebar: true
```

To reach the raw-config editor while kiosked, append `?disable_km` to the
dashboard URL.

**Nothing hidden?** Atrium logs a warning to the browser console when `kiosk:`
is set but the plugin is not detected. Add `debug: true` alongside your kiosk
settings and kiosk-mode will log the config it received:

```yaml
  kiosk:
    debug: true
    non_admin_settings: { hide_header: true, hide_sidebar: true }
```

If no kiosk-mode output appears at all, the plugin is not loaded. If it logs a
config but nothing hides, check which account you are viewing with:
`non_admin_settings` is ignored for admins, who keep the chrome by design.

## Extensibility

No built-in component is mandatory. A view is a list of components, and `card`
places any Lovelace card, so a screen can be built entirely from your own:

```yaml
components:
  - card: { type: custom:mini-media-player, entity: media_player.kitchen }
  - card: { type: weather-forecast, entity: weather.home }
  - card:
      type: custom:mushroom-chips-card
      grid_options: { columns: 6 }
```

### Card dependencies

| Cards | Needed by | Required? |
|-------|-----------|-----------|
| `bubble-card` (HACS) | `rooms`, `nav`, `scenes`, `fans`, room and now-playing pop-ups | For the default layout |
| `mass-conductor` (HACS) | `music` | Only with the default player. Swap it via `music: { card }` |
| `thermostat`, `weather-forecast`, `tile`, `entities`, `markdown` | `house`, `attention`, `header` | Built into HA |

## Development

```bash
npm install
npm run build      # dist/atrium.js
npm run watch
npm run typecheck
npm test
```

## Known limitations

`mass-conductor` has no option to lock to a single player, so room pop-ups show
lights only and music lives on the hero and the shared now-playing surface.
