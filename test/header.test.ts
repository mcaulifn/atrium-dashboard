import { describe, expect, it } from "vitest";
import { headerComponent } from "../src/components/header";
import { cardsOfType, mockCtx } from "./helpers";

const greeting = (out: ReturnType<typeof headerComponent.generate>): string =>
  String(cardsOfType(out.sections, "markdown")[0]?.content ?? "");

describe("header", () => {
  it("maps the viewing user via the names map (case-insensitive)", () => {
    const out = headerComponent.generate(mockCtx({ user: { name: "Hallway" } }), {
      names: { hallway: "McAuliffe Family" },
    });
    expect(greeting(out)).toContain("McAuliffe Family");
    expect(greeting(out)).not.toContain("Hallway");
  });

  it("falls back to the HA user's own name when unmapped", () => {
    const out = headerComponent.generate(mockCtx({ user: { name: "Hallway" } }), {
      names: { Tablet: "Everyone" },
    });
    expect(greeting(out)).toContain("Hallway");
  });

  it("honors default_name and a flat name override", () => {
    expect(greeting(headerComponent.generate(mockCtx({ user: { name: "X" } }), { name: "the Family" }))).toContain(
      "the Family"
    );
    expect(
      greeting(headerComponent.generate(mockCtx({ user: {} }), { default_name: "there" }))
    ).toContain("there");
  });

  it("omits the date line when show_date is false", () => {
    const out = headerComponent.generate(mockCtx({ user: { name: "A" } }), { show_date: false });
    expect(greeting(out).split("\n").length).toBe(1);
  });
});
