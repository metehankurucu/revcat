import { describe, it, expect } from "bun:test";
import { CustomersApi } from "../../src/api/customers.ts";
import { createMockClient } from "../helpers.ts";

describe("CustomersApi", () => {
  describe("list", () => {
    it("should call list-customers with project ID", async () => {
      const { client, requests } = createMockClient({ object: "list", items: [] });
      const api = new CustomersApi(client);

      await api.list("proj_1");

      expect(requests[0].operationId).toBe("list-customers");
      expect(requests[0].pathParams).toEqual({ project_id: "proj_1" });
    });

    it("should pass limit and starting_after as query", async () => {
      const { client, requests } = createMockClient({ object: "list", items: [] });
      const api = new CustomersApi(client);

      await api.list("proj_1", { limit: 50, starting_after: "cust_last" });

      expect(requests[0].options?.query).toEqual({
        limit: 50,
        starting_after: "cust_last",
      });
    });
  });

  describe("get", () => {
    it("should call get-customer with customer ID", async () => {
      const { client, requests } = createMockClient({ object: "customer" });
      const api = new CustomersApi(client);

      await api.get("proj_1", "cust_abc");

      expect(requests[0].operationId).toBe("get-customer");
      expect(requests[0].pathParams).toEqual({
        project_id: "proj_1",
        customer_id: "cust_abc",
      });
    });
  });

  describe("listActiveEntitlements", () => {
    it("should call list-customer-active-entitlements", async () => {
      const { client, requests } = createMockClient({ object: "list", items: [] });
      const api = new CustomersApi(client);

      await api.listActiveEntitlements("proj_1", "cust_abc");

      expect(requests[0].operationId).toBe("list-customer-active-entitlements");
      expect(requests[0].pathParams).toEqual({
        project_id: "proj_1",
        customer_id: "cust_abc",
      });
    });
  });

  describe("listAliases", () => {
    it("should call list-customer-aliases", async () => {
      const { client, requests } = createMockClient({ object: "list", items: [] });
      const api = new CustomersApi(client);

      await api.listAliases("proj_1", "cust_abc");

      expect(requests[0].operationId).toBe("list-customer-aliases");
    });
  });

  describe("listAttributes", () => {
    it("should call list-customer-attributes", async () => {
      const { client, requests } = createMockClient({ object: "list", items: [] });
      const api = new CustomersApi(client);

      await api.listAttributes("proj_1", "cust_abc");

      expect(requests[0].operationId).toBe("list-customer-attributes");
    });
  });

  describe("listPurchases", () => {
    it("should call list-customer-purchases", async () => {
      const { client, requests } = createMockClient({ object: "list", items: [] });
      const api = new CustomersApi(client);

      await api.listPurchases("proj_1", "cust_abc", { limit: 10 });

      expect(requests[0].operationId).toBe("list-customer-purchases");
      expect(requests[0].options?.query).toEqual({ limit: 10 });
    });
  });

  describe("listSubscriptions", () => {
    it("should call list-customer-subscriptions", async () => {
      const { client, requests } = createMockClient({ object: "list", items: [] });
      const api = new CustomersApi(client);

      await api.listSubscriptions("proj_1", "cust_abc");

      expect(requests[0].operationId).toBe("list-customer-subscriptions");
    });
  });

  describe("listVcBalances", () => {
    it("should call list-customer-vc-balances", async () => {
      const { client, requests } = createMockClient({ object: "list", items: [] });
      const api = new CustomersApi(client);

      await api.listVcBalances("proj_1", "cust_abc");

      expect(requests[0].operationId).toBe("list-customer-vc-balances");
      expect(requests[0].pathParams).toEqual({
        project_id: "proj_1",
        customer_id: "cust_abc",
      });
    });
  });

  describe("setAttributes", () => {
    it("should call set-customer-attributes with body", async () => {
      const { client, requests } = createMockClient();
      const api = new CustomersApi(client);

      const attrs = {
        segment: { value: "premium" },
        source: { value: "organic", updated_at_ms: 1700000000000 },
      };
      await api.setAttributes("proj_1", "cust_abc", attrs);

      expect(requests[0].operationId).toBe("set-customer-attributes");
      expect(requests[0].pathParams).toEqual({
        project_id: "proj_1",
        customer_id: "cust_abc",
      });
      expect(requests[0].options?.body).toEqual({ attributes: attrs });
    });
  });

  describe("assignOffering", () => {
    it("should call assign-customer-offering with offering ID", async () => {
      const { client, requests } = createMockClient({ object: "customer" });
      const api = new CustomersApi(client);

      await api.assignOffering("proj_1", "cust_abc", "off_premium");

      expect(requests[0].operationId).toBe("assign-customer-offering");
      expect(requests[0].options?.body).toEqual({ offering_id: "off_premium" });
    });

    it("should pass null to clear offering override", async () => {
      const { client, requests } = createMockClient({ object: "customer" });
      const api = new CustomersApi(client);

      await api.assignOffering("proj_1", "cust_abc", null);

      expect(requests[0].options?.body).toEqual({ offering_id: null });
    });
  });
});
