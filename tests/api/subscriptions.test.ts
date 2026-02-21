import { describe, it, expect } from "bun:test";
import { SubscriptionsApi } from "../../src/api/subscriptions.ts";
import { createMockClient } from "../helpers.ts";

describe("SubscriptionsApi", () => {
  describe("search", () => {
    it("should call search-subscriptions", async () => {
      const { client, requests } = createMockClient({ object: "list", items: [] });
      const api = new SubscriptionsApi(client);

      await api.search("proj_1", {
        store_subscription_identifier: "orig_tx_123",
      });

      expect(requests[0].operationId).toBe("search-subscriptions");
      expect(requests[0].pathParams).toEqual({ project_id: "proj_1" });
      expect(requests[0].options?.query).toEqual({
        store_subscription_identifier: "orig_tx_123",
      });
    });
  });

  describe("get", () => {
    it("should call get-subscription with subscription ID", async () => {
      const { client, requests } = createMockClient({ object: "subscription" });
      const api = new SubscriptionsApi(client);

      await api.get("proj_1", "sub_abc");

      expect(requests[0].operationId).toBe("get-subscription");
      expect(requests[0].pathParams).toEqual({
        project_id: "proj_1",
        subscription_id: "sub_abc",
      });
    });
  });

  describe("listEntitlements", () => {
    it("should call list-subscription-entitlements", async () => {
      const { client, requests } = createMockClient({ object: "list", items: [] });
      const api = new SubscriptionsApi(client);

      await api.listEntitlements("proj_1", "sub_abc");

      expect(requests[0].operationId).toBe("list-subscription-entitlements");
      expect(requests[0].pathParams).toEqual({
        project_id: "proj_1",
        subscription_id: "sub_abc",
      });
    });
  });

  describe("getTransactions", () => {
    it("should call get-subscription-transactions", async () => {
      const { client, requests } = createMockClient({ object: "list", items: [] });
      const api = new SubscriptionsApi(client);

      await api.getTransactions("proj_1", "sub_abc", { limit: 5 });

      expect(requests[0].operationId).toBe("get-subscription-transactions");
      expect(requests[0].options?.query).toEqual({ limit: 5 });
    });
  });

  describe("getManagementUrl", () => {
    it("should call get-subscription-management-url", async () => {
      const { client, requests } = createMockClient({ url: "https://manage.example.com" });
      const api = new SubscriptionsApi(client);

      await api.getManagementUrl("proj_1", "sub_abc");

      expect(requests[0].operationId).toBe("get-subscription-management-url");
    });
  });
});
