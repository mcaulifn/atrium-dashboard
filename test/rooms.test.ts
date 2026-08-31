import { describe, expect, it } from "vitest";
import { roomsComponent } from "../src/components/rooms";
import { area, content, mockCtx } from "./helpers";

const ctx = () =>
  mockCtx({
    areas: [
      area("bar", { name: "Bar", floor_id: "basement" }),
      area("kitchen", { name: "Kitchen", floor_id: "main" }),
    ],
    rooms: [
      area("bar", { name: "Bar", floor_id: "basement" }),
      area("kitchen", { name: "Kitchen", floor_id: "main" }),
    ],
    byArea: {
      bar: content({ lights: ["light.bar"], tempEntity: "sensor.bar_t", humidityEntity: "sensor.bar_h" }),
      kitchen: content({ players: ["media_player.kitchen"] }),
    },
  });

describe("rooms", () => {
  it("filters to a single floor", () => {
    const names = JSON.stringify(roomsComponent.generate(ctx(), { floor: "basement" }));
    expect(names).toContain("Bar");
    expect(names).not.toContain("Kitchen");
  });

  it("puts temp/humidity as value sub-buttons (no icon)", () => {
    const out = roomsComponent.generate(ctx(), { floor: "basement", all_lights_off: false });
    const tile = JSON.stringify(out.sections);
    expect(tile).toContain('"show_state":true');
    expect(tile).toContain('"entity":"sensor.bar_t"');
    expect(tile).toContain('"entity":"sensor.bar_h"');
  });

  it("adds All Lights Off only when lights exist and not disabled", () => {
    const on = JSON.stringify(roomsComponent.generate(ctx(), { floor: "basement" }).sections);
    const off = JSON.stringify(roomsComponent.generate(ctx(), { floor: "basement", all_lights_off: false }).sections);
    expect(on).toContain("All Lights Off");
    expect(off).not.toContain("All Lights Off");
  });

  it("emits a lights pop-up for rooms with lights, none for player-only rooms", () => {
    const out = roomsComponent.generate(ctx(), {});
    const popups = JSON.stringify(out.popups);
    expect(popups).toContain("#room-bar");
    expect(popups).not.toContain("#room-kitchen");
  });
});
