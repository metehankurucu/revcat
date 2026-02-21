import { describe, it, expect } from "bun:test";
import { ChartsApi } from "../../src/api/charts.ts";
import { createMockClient } from "../helpers.ts";

describe("ChartsApi", () => {
  describe("getOverviewMetrics", () => {
    it("should call get-overview-metrics with correct params", async () => {
      const { client, requests } = createMockClient({ object: "overview_metrics", metrics: [] });
      const api = new ChartsApi(client);

      await api.getOverviewMetrics("proj_1");

      expect(requests).toHaveLength(1);
      expect(requests[0].operationId).toBe("get-overview-metrics");
      expect(requests[0].pathParams).toEqual({ project_id: "proj_1" });
    });

    it("should pass currency option as query param", async () => {
      const { client, requests } = createMockClient({});
      const api = new ChartsApi(client);

      await api.getOverviewMetrics("proj_1", { currency: "EUR" });

      expect(requests[0].options?.query).toEqual({ currency: "EUR" });
    });

    it("should work without options", async () => {
      const { client, requests } = createMockClient({});
      const api = new ChartsApi(client);

      await api.getOverviewMetrics("proj_1");

      expect(requests[0].options?.query).toBeUndefined();
    });
  });

  describe("getChartData", () => {
    it("should call get-chart-data with chart name", async () => {
      const { client, requests } = createMockClient({ object: "chart_data" });
      const api = new ChartsApi(client);

      await api.getChartData("proj_1", "mrr");

      expect(requests[0].operationId).toBe("get-chart-data");
      expect(requests[0].pathParams).toEqual({
        project_id: "proj_1",
        chart_name: "mrr",
      });
    });

    it("should pass all chart data query options", async () => {
      const { client, requests } = createMockClient({});
      const api = new ChartsApi(client);

      await api.getChartData("proj_1", "revenue", {
        start_date: "2025-01-01",
        end_date: "2025-12-31",
        resolution: "month",
        currency: "USD",
        segment: "country",
        filters: '[{"name":"country","values":["US"]}]',
      });

      const query = requests[0].options?.query as Record<string, unknown>;
      expect(query.start_date).toBe("2025-01-01");
      expect(query.end_date).toBe("2025-12-31");
      expect(query.resolution).toBe("month");
      expect(query.currency).toBe("USD");
      expect(query.segment).toBe("country");
      expect(query.filters).toBe('[{"name":"country","values":["US"]}]');
    });

    it("should work for all chart names", async () => {
      const chartNames = [
        "actives", "arr", "churn", "mrr", "mrr_movement",
        "revenue", "trials", "subscription_retention",
        "trial_conversion_rate", "customers_active",
      ] as const;

      for (const chartName of chartNames) {
        const { client, requests } = createMockClient({});
        const api = new ChartsApi(client);
        await api.getChartData("proj_1", chartName);
        expect(requests[0].pathParams.chart_name).toBe(chartName);
      }
    });
  });

  describe("getChartOptions", () => {
    it("should call get-chart-options with chart name", async () => {
      const { client, requests } = createMockClient({
        object: "chart_options",
        resolutions: [],
        segments: [],
        filters: [],
      });
      const api = new ChartsApi(client);

      await api.getChartOptions("proj_1", "mrr");

      expect(requests[0].operationId).toBe("get-chart-options");
      expect(requests[0].pathParams).toEqual({
        project_id: "proj_1",
        chart_name: "mrr",
      });
    });
  });
});
