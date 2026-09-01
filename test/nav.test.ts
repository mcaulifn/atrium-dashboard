import { describe, expect, it } from "vitest";
import { navComponent } from "../src/components/nav";
import { area, cardsOfType, content, floor, mockCtx } from "./helpers";

const ctx = () =>
  mockCtx({
    floors: [floor("basement", { name: "Basement", level: 0 }), floor("main", { name: "Main", level: 1 })],
    rooms: [
      area("bar", { name: "Bar", floor_id: "basement" }),
      area("kitchen", { name: "Kitchen", floor_id: "main" }),
      area("shed", { name: "Shed", floor_id: null }), // orphan -> "Other"
    ],
    byArea: {
      bar: content({ lights: ["light.bar"] }),
      kitchen: content({ lights: ["light.k"] }),
      shed: content({ lights: ["light.s"] }),
    },
  });

const names = (out: ReturnType<typeof navComponent.generate>): string[] =>
  cardsOfType(out.sections, "custom:bubble-card").map((b) => String(b.name));

describe("nav", () => {
  it("builds Home + each floor with rooms + Other, in order", () => {
    expect(names(navComponent.generate(ctx(), {}))).toEqual(["Home", "Basement", "Main", "Other"]);
  });

  it("navigates within the current dashboard by view path", () => {
    const buttons = cardsOfType(navComponent.generate(ctx(), {}).sections, "custom:bubble-card");
    const paths = buttons.map((b) => (b.tap_action as Record<string, unknown>).navigation_path);
    expect(paths).toContain("/home");
    expect(paths).toContain("/basement");
  });

  it("applies the per-button column width", () => {
    const b = cardsOfType(navComponent.generate(ctx(), { columns: 4 }).sections, "custom:bubble-card")[0];
    expect((b.grid_options as Record<string, unknown>).columns).toBe(4);
  });

  it("renders nothing when there is only Home (no floors with rooms)", () => {
    const out = navComponent.generate(mockCtx({ floors: [], rooms: [] }), {});
    expect(out.sections ?? []).toHaveLength(0);
  });
});
