import { describe, expect, it } from "vitest";
import { kioskMode } from "../src/strategy";

describe("kioskMode", () => {
  it("emits nothing when kiosk is unset or false", () => {
    expect(kioskMode(undefined)).toBeUndefined();
    expect(kioskMode(false)).toBeUndefined();
  });

  it("expands `true` to hiding both header and sidebar", () => {
    expect(kioskMode(true)).toEqual({ hide_header: true, hide_sidebar: true });
  });

  it("passes a config object through untouched, so kiosk-mode's own scoping works", () => {
    const scoped = { non_admin_settings: { hide_header: true, hide_sidebar: true } };
    expect(kioskMode(scoped)).toEqual(scoped);
  });

  it("keeps kiosk-mode's other keys, including debug", () => {
    const config = { debug: true, user_settings: [{ users: ["tablet"], kiosk: true }] };
    expect(kioskMode(config)).toEqual(config);
  });
});
