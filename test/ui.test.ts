import { describe, expect, it } from "vitest";
import { hashOf, iconOf, sep, slug } from "../src/ui";
import { area } from "./helpers";

describe("slug", () => {
  it("lowercases and dashes non-alphanumerics, trimming edges", () => {
    expect(slug("Main Bedroom")).toBe("main-bedroom");
    expect(slug("  Outside!  ")).toBe("outside");
    expect(slug("A/B & C")).toBe("a-b-c");
  });
});

describe("iconOf", () => {
  it("uses the area icon, else a default", () => {
    expect(iconOf(area("a", { icon: "mdi:sofa" }))).toBe("mdi:sofa");
    expect(iconOf(area("a", { icon: null }))).toBe("mdi:home-outline");
  });
});

describe("hashOf", () => {
  it("builds a room pop-up hash", () => {
    expect(hashOf(area("living_room"))).toBe("#room-living_room");
  });
});

describe("sep", () => {
  it("is a full-width bubble separator", () => {
    const s = sep("Lights", "mdi:lightbulb-group") as Record<string, unknown>;
    expect(s.type).toBe("custom:bubble-card");
    expect(s.card_type).toBe("separator");
    expect(s.name).toBe("Lights");
  });
});
