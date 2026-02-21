import { describe, it, expect } from "bun:test";
import { EntitlementsApi } from "../../src/api/entitlements.ts";
import { createMockClient } from "../helpers.ts";

describe("EntitlementsApi", () => {
  describe("list", () => {
    it("should call list-entitlements", async () => {
      const { client, requests } = createMockClient({ object: "list", items: [] });
      const api = new EntitlementsApi(client);

      await api.list("proj_1");

      expect(requests[0].operationId).toBe("list-entitlements");
    });
  });

  describe("get", () => {
    it("should call get-entitlement", async () => {
      const { client, requests } = createMockClient({ object: "entitlement" });
      const api = new EntitlementsApi(client);

      await api.get("proj_1", "ent_premium");

      expect(requests[0].operationId).toBe("get-entitlement");
      expect(requests[0].pathParams.entitlement_id).toBe("ent_premium");
    });
  });

  describe("listProducts", () => {
    it("should call list-entitlement-products", async () => {
      const { client, requests } = createMockClient({ object: "list", items: [] });
      const api = new EntitlementsApi(client);

      await api.listProducts("proj_1", "ent_premium");

      expect(requests[0].operationId).toBe("list-entitlement-products");
    });
  });

  describe("create", () => {
    it("should call create-entitlement with body", async () => {
      const { client, requests } = createMockClient({ object: "entitlement" });
      const api = new EntitlementsApi(client);

      await api.create("proj_1", {
        lookup_key: "pro",
        display_name: "Pro Access",
      });

      expect(requests[0].operationId).toBe("create-entitlement");
      expect(requests[0].options?.body).toEqual({
        lookup_key: "pro",
        display_name: "Pro Access",
      });
    });
  });

  describe("update", () => {
    it("should call update-entitlement", async () => {
      const { client, requests } = createMockClient({ object: "entitlement" });
      const api = new EntitlementsApi(client);

      await api.update("proj_1", "ent_1", { display_name: "New Name" });

      expect(requests[0].operationId).toBe("update-entitlement");
      expect(requests[0].pathParams.entitlement_id).toBe("ent_1");
      expect(requests[0].options?.body).toEqual({ display_name: "New Name" });
    });
  });

  describe("attachProducts", () => {
    it("should call attach-products-to-entitlement with product IDs", async () => {
      const { client, requests } = createMockClient({ object: "entitlement" });
      const api = new EntitlementsApi(client);

      await api.attachProducts("proj_1", "ent_1", ["prod_a", "prod_b"]);

      expect(requests[0].operationId).toBe("attach-products-to-entitlement");
      expect(requests[0].options?.body).toEqual({
        product_ids: ["prod_a", "prod_b"],
      });
    });
  });

  describe("detachProducts", () => {
    it("should call detach-products-from-entitlement", async () => {
      const { client, requests } = createMockClient({ object: "entitlement" });
      const api = new EntitlementsApi(client);

      await api.detachProducts("proj_1", "ent_1", ["prod_a"]);

      expect(requests[0].operationId).toBe("detach-products-from-entitlement");
      expect(requests[0].options?.body).toEqual({ product_ids: ["prod_a"] });
    });
  });
});
