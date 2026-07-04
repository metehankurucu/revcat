import { CHART_NAMES } from "../types/charts.ts";
import { InvalidChartError } from "../client/errors.ts";

const VALID = new Set<string>(CHART_NAMES);

/** Classic Levenshtein edit distance (used for did-you-mean ranking). */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  let curr = new Array<number>(n + 1);

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/**
 * Returns up to `limit` valid chart names closest to `input`, ranked by edit
 * distance (closest first). A candidate is included when it is within a
 * length-scaled edit-distance threshold, OR (for inputs of 4+ chars) when it
 * shares a substring with the input so a partial name like "subscription"
 * still surfaces "subscription_status". Ranking is always by distance, so the
 * nearest correction wins even when a shorter name is a substring.
 */
export function suggestCharts(input: string, limit = 3): string[] {
  const lower = input.toLowerCase();
  const threshold = Math.max(2, Math.ceil(input.length / 2));

  const scored = CHART_NAMES.map((name) => {
    const substring =
      lower.length >= 4 && (name.includes(lower) || lower.includes(name));
    return { name, distance: levenshtein(lower, name), substring };
  })
    .filter((s) => s.substring || s.distance <= threshold)
    .sort((a, b) => a.distance - b.distance);

  return scored.slice(0, limit).map((s) => s.name);
}

/**
 * Throws `InvalidChartError` (with suggestions) if `chart` is not a canonical
 * chart name. `unsafe` (from `--unsafe-chart`) skips validation entirely so a
 * caller can target a newly released chart before this CLI is updated.
 */
export function assertValidChart(chart: string, unsafe = false): void {
  if (unsafe) return;
  if (VALID.has(chart)) return;
  throw new InvalidChartError(chart, suggestCharts(chart), CHART_NAMES);
}
