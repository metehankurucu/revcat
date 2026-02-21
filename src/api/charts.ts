import type { RevenueCatClient } from "../client/base.ts";
import type {
  ChartName,
  ChartData,
  ChartDataQuery,
  ChartOptions,
  OverviewMetrics,
} from "../types/charts.ts";

export class ChartsApi {
  constructor(private client: RevenueCatClient) {}

  async getOverviewMetrics(
    projectId: string,
    opts?: { currency?: string }
  ): Promise<OverviewMetrics> {
    return this.client.request(
      "get-overview-metrics",
      { project_id: projectId },
      { query: opts }
    );
  }

  async getChartData(
    projectId: string,
    chartName: ChartName,
    opts?: ChartDataQuery
  ): Promise<ChartData> {
    return this.client.request(
      "get-chart-data",
      { project_id: projectId, chart_name: chartName },
      { query: opts as Record<string, unknown> }
    );
  }

  async getChartOptions(
    projectId: string,
    chartName: ChartName
  ): Promise<ChartOptions> {
    return this.client.request("get-chart-options", {
      project_id: projectId,
      chart_name: chartName,
    });
  }
}
