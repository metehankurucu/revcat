/**
 * Canonical list of valid `--chart` names.
 *
 * This is the ONE source of truth for chart validation, the `ChartName` type,
 * and the docs. It is generated from the RevenueCat v2 OpenAPI spec's
 * `chart_name` enum (`api-spec.yaml`) and pinned to it by
 * `tests/charts/chart-names.test.ts`: refreshing the spec with a changed chart
 * set fails that test until this array is updated to match.
 */
export const CHART_NAMES = [
  "actives",
  "actives_movement",
  "actives_new",
  "arr",
  "churn",
  "cohort_explorer",
  "conversion_to_paying",
  "customers_new",
  "initial_conversion",
  "ltv_per_customer",
  "ltv_per_paying_customer",
  "mrr",
  "mrr_movement",
  "prediction_explorer",
  "refund_rate",
  "revenue",
  "subscription_retention",
  "subscription_status",
  "trials",
  "trials_movement",
  "trials_new",
  "customers_active",
  "trial_conversion_rate",
  "non-subscription_purchases",
] as const;

export type ChartName = (typeof CHART_NAMES)[number];

export type ChartResolution = "day" | "week" | "month" | "quarter" | "year";

export interface OverviewMetric {
  object: "overview_metric";
  id: string;
  name: string;
  description: string;
  unit: string;
  period: "P0D" | "P28D";
  value: number;
  last_updated_at: number | null;
  last_updated_at_iso8601: string | null;
}

export interface OverviewMetrics {
  object: "overview_metrics";
  metrics: OverviewMetric[];
}

export interface ChartData {
  object: "chart_data";
  category: string;
  display_type: string;
  display_name: string;
  description: string;
  resolution: ChartResolution;
  values: unknown[];
  yaxis: string;
  documentation_link?: string | null;
  last_computed_at?: number | null;
  start_date?: number | null;
  end_date?: number | null;
  yaxis_currency?: string;
  filtering_allowed?: boolean;
  segmenting_allowed?: boolean;
  summary?: Record<string, unknown> | null;
  segments?: Array<{ id: string; display_name: string }> | null;
  segments_limit?: number | null;
  measures?: unknown[] | null;
  user_selectors?: Record<string, unknown> | null;
}

export interface ChartFilterOption {
  id: string;
  display_name: string;
  group_display_name?: string | null;
  options: Array<{ id: string; display_name: string }>;
}

export interface ChartSegmentOption {
  id: string;
  display_name: string;
  group_display_name?: string | null;
}

export interface ChartOptions {
  object: "chart_options";
  resolutions: Array<{ id: string; display_name: string }>;
  segments: ChartSegmentOption[];
  filters: ChartFilterOption[];
  user_selectors?: Record<
    string,
    {
      default: string;
      display_name: string;
      options: Array<{ id: string; display_name: string }>;
    }
  > | null;
}

export interface ChartDataQuery {
  start_date?: string;
  end_date?: string;
  resolution?: string;
  currency?: string;
  segment?: string;
  filters?: string; // JSON array string
  selectors?: string; // JSON object string
  aggregate?: string;
}
