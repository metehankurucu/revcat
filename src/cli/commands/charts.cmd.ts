import { Command } from "commander";
import { ChartsApi } from "../../api/charts.ts";
import { CHART_NAMES, type ChartName } from "../../types/charts.ts";
import { getClient, getProjectId } from "../index.ts";
import { output, outputError } from "../formatter.ts";
import { assertValidChart } from "../chart-validation.ts";

// Derived from the canonical list so the help text can never drift from it.
const CHART_HELP = `Chart name (validated). e.g. ${CHART_NAMES.slice(0, 6).join(", ")}, ... (${CHART_NAMES.length} total; run 'charts options' or see docs, or pass --unsafe-chart)`;

export function registerChartsCommand(program: Command): void {
  const cmd = program
    .command("charts")
    .description("Analytics & metrics (rate limit: 5 req/min)")
    .option("-p, --project <id>", "Project ID");

  cmd
    .command("overview")
    .description("Get overview metrics (MRR, revenue, active subscribers, trials, etc.)")
    .option("--currency <code>", "ISO 4217 currency code (e.g. USD, EUR)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const api = new ChartsApi(client);
        output(await api.getOverviewMetrics(projectId, this.opts()));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("data")
    .description("Get chart data (mrr, revenue, churn, arr, trials, etc.)")
    .requiredOption("--chart <name>", CHART_HELP)
    .option("--start <date>", "Start date (ISO 8601, e.g. 2025-01-01)")
    .option("--end <date>", "End date (ISO 8601)")
    .option("--resolution <r>", "Resolution: day, week, month, quarter, year")
    .option("--currency <code>", "ISO 4217 currency code")
    .option("--segment <s>", "Segment dimension (use 'charts options' to discover)")
    .option("--filters <json>", "JSON array of filters")
    .option("--selectors <json>", "JSON object of selectors")
    .option("--unsafe-chart", "Skip chart-name validation (pass the value through as-is)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        assertValidChart(opts.chart, opts.unsafeChart);
        const api = new ChartsApi(client);
        output(
          await api.getChartData(projectId, opts.chart as ChartName, {
            start_date: opts.start,
            end_date: opts.end,
            resolution: opts.resolution,
            currency: opts.currency,
            segment: opts.segment,
            filters: opts.filters,
            selectors: opts.selectors,
          })
        );
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("options")
    .description("Get available options for a chart (resolutions, segments, filters)")
    .requiredOption("--chart <name>", CHART_HELP)
    .option("--unsafe-chart", "Skip chart-name validation (pass the value through as-is)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        assertValidChart(opts.chart, opts.unsafeChart);
        const api = new ChartsApi(client);
        output(await api.getChartOptions(projectId, opts.chart as ChartName));
      } catch (e) {
        outputError(e);
      }
    });
}
