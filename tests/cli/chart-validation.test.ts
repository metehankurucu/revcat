import { describe, it, expect } from "bun:test";
import {
  assertValidChart,
  suggestCharts,
  levenshtein,
} from "../../src/cli/chart-validation.ts";
import { InvalidChartError } from "../../src/client/errors.ts";
import { CHART_NAMES } from "../../src/types/charts.ts";

// R5: --chart is validated against the canonical list with did-you-mean
// suggestions and an --unsafe-chart escape hatch.

describe("R5: assertValidChart", () => {
  it("accepts every canonical chart name", () => {
    for (const name of CHART_NAMES) {
      expect(() => assertValidChart(name, false)).not.toThrow();
    }
  });

  it("accepts the hyphenated name from the spec", () => {
    expect(() => assertValidChart("non-subscription_purchases", false)).not.toThrow();
  });

  it("rejects an unknown chart with an InvalidChartError", () => {
    expect(() => assertValidChart("bananas", false)).toThrow(InvalidChartError);
  });

  it("suggests mrr for the typo mmr and carries the full valid set", () => {
    let thrown: unknown;
    try {
      assertValidChart("mmr", false);
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeInstanceOf(InvalidChartError);
    const err = thrown as InvalidChartError;
    expect(err.suggestions[0]).toBe("mrr");
    expect(err.chart).toBe("mmr");
    expect(err.validCharts).toContain("mrr");
    expect(err.message).toContain("Did you mean: mrr");
    expect(err.message).toContain("--unsafe-chart");
  });

  it("--unsafe-chart (unsafe=true) bypasses validation for an unknown name", () => {
    expect(() => assertValidChart("some_future_chart", true)).not.toThrow();
  });
});

describe("R5: suggestCharts", () => {
  it("ranks the closest match first for a one-edit typo", () => {
    expect(suggestCharts("mrr_movemnt")[0]).toBe("mrr_movement");
  });

  it("caps suggestions to at most 3", () => {
    expect(suggestCharts("a").length).toBeLessThanOrEqual(3);
  });

  it("returns no wild guesses for input unlike any chart", () => {
    // "zzzzzzzz" is far from every name; substring/threshold filter yields none.
    expect(suggestCharts("zzzzzzzz")).toEqual([]);
  });

  it("surfaces a near-miss / partial name", () => {
    // "revenu" is one edit (and a prefix substring) away from "revenue".
    expect(suggestCharts("revenu")).toContain("revenue");
    // a longer partial name still surfaces its full form via substring inclusion
    expect(suggestCharts("subscription")).toContain("subscription_status");
  });
});

describe("levenshtein", () => {
  it("computes edit distance", () => {
    expect(levenshtein("mmr", "mrr")).toBe(1);
    expect(levenshtein("abc", "abc")).toBe(0);
    expect(levenshtein("", "abc")).toBe(3);
    expect(levenshtein("kitten", "sitting")).toBe(3);
  });
});
