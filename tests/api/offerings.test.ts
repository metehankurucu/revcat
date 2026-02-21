import { describe, it, expect } from "bun:test";
import { OfferingsApi } from "../../src/api/offerings.ts";
import { createMockClient } from "../helpers.ts";

describe("OfferingsApi", () => {
  describe("list", () => {
    it("should call list-offerings", async () => {
      const { client, requests } = createMockClient({ object: "list", items: [] });
      const api = new OfferingsApi(client);

      await api.list("proj_1");

      expect(requests[0].operationId).toBe("list-offerings");
      expect(requests[0].pathParams).toEqual({ project_id: "proj_1" });
    });

    it("should pass expand option", async () => {
      const { client, requests } = createMockClient({ object: "list", items: [] });
      const api = new OfferingsApi(client);

      await api.list("proj_1", { expand: "items.packages" });

      expect(requests[0].options?.query).toEqual({ expand: "items.packages" });
    });
  });

  describe("get", () => {
    it("should call get-offering with offering ID", async () => {
      const { client, requests } = createMockClient({ object: "offering" });
      const api = new OfferingsApi(client);

      await api.get("proj_1", "off_default");

      expect(requests[0].operationId).toBe("get-offering");
      expect(requests[0].pathParams).toEqual({
        project_id: "proj_1",
        offering_id: "off_default",
      });
    });
  });

  describe("create", () => {
    it("should call create-offering with required fields", async () => {
      const { client, requests } = createMockClient({ object: "offering" });
      const api = new OfferingsApi(client);

      await api.create("proj_1", {
        lookup_key: "premium",
        display_name: "Premium Plan",
      });

      expect(requests[0].operationId).toBe("create-offering");
      expect(requests[0].pathParams).toEqual({ project_id: "proj_1" });
      expect(requests[0].options?.body).toEqual({
        lookup_key: "premium",
        display_name: "Premium Plan",
      });
    });

    it("should include optional fields", async () => {
      const { client, requests } = createMockClient({ object: "offering" });
      const api = new OfferingsApi(client);

      await api.create("proj_1", {
        lookup_key: "premium",
        display_name: "Premium",
        is_current: true,
        metadata: { tier: "high" },
      });

      const body = requests[0].options?.body as Record<string, unknown>;
      expect(body.is_current).toBe(true);
      expect(body.metadata).toEqual({ tier: "high" });
    });
  });

  describe("update", () => {
    it("should call update-offering with offering ID", async () => {
      const { client, requests } = createMockClient({ object: "offering" });
      const api = new OfferingsApi(client);

      await api.update("proj_1", "off_1", { display_name: "Updated Name" });

      expect(requests[0].operationId).toBe("update-offering");
      expect(requests[0].pathParams).toEqual({
        project_id: "proj_1",
        offering_id: "off_1",
      });
      expect(requests[0].options?.body).toEqual({ display_name: "Updated Name" });
    });
  });
});
