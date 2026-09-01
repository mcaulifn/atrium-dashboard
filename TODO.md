# Atrium — TODO / roadmap

Future components. Each ships as a composable component with sensible defaults,
placeable or omittable from the dashboard YAML (like `house`, `scenes`, `fans`,
`attention`).

## Summary components (have the entities)
- [ ] **presence** — who's home from `person.*` (avatars, home/away). 2 present.
- [ ] **energy** — solar production today + live power draw
      (`sensor.energy_production_today` + power sensors).
- [ ] **todo** — a To-do / shopping list card from the To-do Lists integration.

## Need entities not present yet
- [ ] **scenes / quick-actions** — component is built but dormant: 0 scenes / 0
      scripts currently. Populates automatically once you add some.
- [ ] **security** — alarm panel, locks, cameras, door/window sensors.
- [ ] **covers** — garage door, blinds / shades.
- [ ] **calendar** — upcoming events.

## Theming / polish
- [ ] **colors / accent** — best as an HA theme, or a card-mod-based `accent`
      option on the strategy.
- [ ] **header clock** — live ticking time (needs a time sensor or template;
      the header currently shows the date, greeting updates on reload).
- [ ] **room-scoped music** — needs a `player` config option on the
      `mass-conductor` card so room pop-ups can show one scoped player.

## Done
- [x] rooms (per-floor, temp/humidity values, badges, All-Lights-Off)
- [x] music (mass-conductor hero + shared now-playing pop-up)
- [x] house (thermostats + weather, auto-detected)
- [x] header (configurable greeting), scenes, fans, attention
- [x] runtime config: `layout` (tabs/single), `background`, `exclude_areas`
