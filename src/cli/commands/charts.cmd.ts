import { Command } from "commander";
import { ChartsApi } from "../../api/charts.ts";
import type { ChartName } from "../../types/charts.ts";
import { getClient, getProjectId } from "../index.ts";
import { output, outputError } from "../formatter.ts";

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
    .requiredOption(
      "--chart <name>",
      "Chart name: actives, arr, churn, mrr, mrr_movement, revenue, trials, subscription_retention, etc."
    )
    .option("--start <date>", "Start date (ISO 8601, e.g. 2025-01-01)")
    .option("--end <date>", "End date (ISO 8601)")
    .option("--resolution <r>", "Resolution: day, week, month, quarter, year")
    .option("--currency <code>", "ISO 4217 currency code")
    .option("--segment <s>", "Segment dimension (use 'charts options' to discover)")
    .option("--filters <json>", "JSON array of filters")
    .option("--selectors <json>", "JSON object of selectors")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
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
    .requiredOption("--chart <name>", "Chart name")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const api = new ChartsApi(client);
        output(await api.getChartOptions(projectId, this.opts().chart as ChartName));
      } catch (e) {
        outputError(e);
      }
    });
}
