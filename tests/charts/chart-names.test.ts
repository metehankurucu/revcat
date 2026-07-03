import { describe, it, expect } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import { CHART_NAMES } from "../../src/types/charts.ts";

// R5: CHART_NAMES is the ONE canonical chart list and must stay derived from the
// refreshed RevenueCat v2 OpenAPI spec. This test parses the spec's chart_name
// enum and pins CHART_NAMES to it, so a future spec refresh that changes the
// chart set fails here until src/types/charts.ts is updated to match.

function extractChartEnumFromSpec(): string[] {
  const specPath = join(import.meta.dir, "../../api-spec.yaml");
  const lines = readFileSync(specPath, "utf-8").split("\n");

  const paramIdx = lines.findIndex((l) => /name:\s*chart_name\b/.test(l));
  expect(paramIdx, "chart_name parameter should exist in api-spec.yaml").toBeGreaterThan(-1);

  // The chart_name schema has a long prose description (with its own "- foo:"
  // bullet lines) BEFORE the enum, so anchor on the enum: key after the param.
  let enumIdx = paramIdx;
  while (enumIdx < lines.length && !/^\s*enum:\s*$/.test(lines[enumIdx])) enumIdx++;
  expect(enumIdx, "enum should follow the chart_name parameter").toBeLessThan(lines.length);

  const names: string[] = [];
  for (let i = enumIdx + 1; i < lines.length; i++) {
    // Enum values are bare single tokens: "- mrr". A "- name: realtime" (next
    // param) or "example: revenue" line does not match and ends the list.
    const m = lines[i].match(/^\s*-\s+(\S+)\s*$/);
    if (!m) break;
    names.push(m[1]);
  }
  return names;
}

describe("R5: canonical chart list is spec-derived", () => {
  const specEnum = extractChartEnumFromSpec();

  it("extracts a non-trivial enum from the spec", () => {
    expect(specEnum.length).toBeGreaterThanOrEqual(20);
  });

  it("CHART_NAMES exactly matches the spec chart_name enum (order included)", () => {
    expect(specEnum).toEqual([...CHART_NAMES]);
  });

  it("includes the charts added in the refreshed spec", () => {
    const names = CHART_NAMES as readonly string[];
    for (const added of ["initial_conversion", "prediction_explorer", "non-subscription_purchases"]) {
      expect(names).toContain(added);
    }
  });

  it("has no duplicate names", () => {
    expect(new Set(CHART_NAMES).size).toBe(CHART_NAMES.length);
  });
});
