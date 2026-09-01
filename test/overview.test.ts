import { describe, expect, it } from "vitest";
import { componentId, DEFAULT_SUMMARIES, overviewComponents } from "../src/overview";
import type { AtriumStrategyConfig } from "../src/types";

const ids = (config: AtriumStrategyConfig) => overviewComponents(config).map(componentId);

describe("overviewComponents", () => {
  it("defaults to header + music hero + the summary list", () => {
    expect(ids({})).toEqual(["header", "music", "house", "attention", "scenes", "fans"]);
  });

  it("drops the header when overview.header is false", () => {
    expect(ids({ overview: { header: false } })).not.toContain("header");
  });

  it("swaps the hero (configurable, defaults to music)", () => {
    const out = overviewComponents({
      overview: { hero: { card: { type: "custom:foo" } } },
    });
    expect(componentId(out[1])).toBe("card");
    expect(out.map(componentId)).not.toContain("music");
  });

  it("excludes summaries by id from the default", () => {
    expect(ids({ overview: { exclude: ["fans", "scenes"] } })).toEqual([
      "header",
      "music",
      "house",
      "attention",
    ]);
  });

  it("replaces the whole summary list when given one", () => {
    expect(ids({ overview: { summaries: [{ attention: {} }] } })).toEqual(["header", "music", "attention"]);
    // default list is untouched by the override
    expect(DEFAULT_SUMMARIES.map(componentId)).toEqual(["house", "attention", "scenes", "fans"]);
  });
});
