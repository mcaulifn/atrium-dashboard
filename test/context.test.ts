import { describe, expect, it } from "vitest";
import { buildContext } from "../src/context";
import type { AtriumContext } from "../src/types";
import { state } from "./helpers";

const REG = {
  "config/area_registry/list": [
    { area_id: "lr", name: "Living Room", icon: null, floor_id: "main" },
    { area_id: "junk", name: "House", icon: null, floor_id: null },
  ],
  "config/floor_registry/list": [{ floor_id: "main", name: "Main", icon: null, level: 0 }],
  "config/entity_registry/list": [
    { entity_id: "light.lr", area_id: "lr", device_id: null, platform: "hue" },
    { entity_id: "media_player.lr", area_id: "lr", device_id: null, platform: "music_assistant" },
    { entity_id: "media_player.lr_tv", area_id: "lr", device_id: null, platform: "cast" },
    { entity_id: "sensor.lr_temp", area_id: "lr", device_id: null, platform: "x" },
    { entity_id: "light.junk_led", area_id: "junk", device_id: null, platform: "zwave" },
  ],
  "config/device_registry/list": [],
};

const hass = () =>
  ({
    states: { "sensor.lr_temp": state("72", { device_class: "temperature" }) },
    callWS: async (msg: { type: string }) => (REG as Record<string, unknown>)[msg.type] ?? [],
  }) as unknown as AtriumContext["hass"];

describe("buildContext", () => {
  it("classifies lights/players, prefers MA players, skips TV-like ones, finds sensors", async () => {
    const ctx = await buildContext(hass());
    const c = ctx.byArea.lr;
    expect(c.lights).toEqual(["light.lr"]);
    expect(c.maPlayers).toEqual(["media_player.lr"]);
    expect(c.players).not.toContain("media_player.lr_tv");
    expect(c.tempEntity).toBe("sensor.lr_temp");
    const lr = ctx.areas.find((a) => a.area_id === "lr")!;
    expect(ctx.playersOf(lr)).toEqual(["media_player.lr"]);
  });

  it("excludes areas by name and only rooms with content survive", async () => {
    const ctx = await buildContext(hass(), ["House"]);
    expect(ctx.areas.find((a) => a.area_id === "junk")).toBeUndefined();
    expect(ctx.rooms.map((r) => r.area_id)).toEqual(["lr"]);
  });
});
