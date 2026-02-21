import { describe, it, expect } from "bun:test";
import { PackagesApi } from "../../src/api/packages.ts";
import { createMockClient } from "../helpers.ts";

describe("PackagesApi", () => {
  describe("list", () => {
    it("should call list-packages with offering ID", async () => {
      const { client, requests } = createMockClient({ object: "list", items: [] });
      const api = new PackagesApi(client);

      await api.list("proj_1", "off_default");

      expect(requests[0].operationId).toBe("list-packages");
      expect(requests[0].pathParams).toEqual({
        project_id: "proj_1",
        offering_id: "off_default",
      });
    });
  });

  describe("get", () => {
    it("should call get-package", async () => {
      const { client, requests } = createMockClient({ object: "package" });
      const api = new PackagesApi(client);

      await api.get("proj_1", "pkg_monthly");

      expect(requests[0].operationId).toBe("get-package");
      expect(requests[0].pathParams.package_id).toBe("pkg_monthly");
    });
  });

  describe("listProducts", () => {
    it("should call list-package-products", async () => {
      const { client, requests } = createMockClient({ object: "list", items: [] });
      const api = new PackagesApi(client);

      await api.listProducts("proj_1", "pkg_monthly");

      expect(requests[0].operationId).toBe("list-package-products");
    });
  });

  describe("create", () => {
    it("should call create-package with offering ID and body", async () => {
      const { client, requests } = createMockClient({ object: "package" });
      const api = new PackagesApi(client);

      await api.create("proj_1", "off_default", {
        lookup_key: "monthly",
        display_name: "Monthly",
        position: 0,
      });

      expect(requests[0].operationId).toBe("create-package");
      expect(requests[0].pathParams.offering_id).toBe("off_default");
      expect(requests[0].options?.body).toEqual({
        lookup_key: "monthly",
        display_name: "Monthly",
        position: 0,
      });
    });
  });

  describe("update", () => {
    it("should call update-package", async () => {
      const { client, requests } = createMockClient({ object: "package" });
      const api = new PackagesApi(client);

      await api.update("proj_1", "pkg_1", {
        display_name: "Annual Plan",
        position: 1,
      });

      expect(requests[0].operationId).toBe("update-package");
      expect(requests[0].options?.body).toEqual({
        display_name: "Annual Plan",
        position: 1,
      });
    });
  });

  describe("attachProducts", () => {
    it("should call attach-products-to-package with products array", async () => {
      const { client, requests } = createMockClient({ object: "package" });
      const api = new PackagesApi(client);

      await api.attachProducts("proj_1", "pkg_1", [
        { product_id: "prod_1", eligibility_criteria: "default" },
      ]);

      expect(requests[0].operationId).toBe("attach-products-to-package");
      expect(requests[0].options?.body).toEqual({
        products: [{ product_id: "prod_1", eligibility_criteria: "default" }],
      });
    });
  });

  describe("detachProducts", () => {
    it("should call detach-products-from-package", async () => {
      const { client, requests } = createMockClient({ object: "package" });
      const api = new PackagesApi(client);

      await api.detachProducts("proj_1", "pkg_1", ["prod_1", "prod_2"]);

      expect(requests[0].operationId).toBe("detach-products-from-package");
      expect(requests[0].options?.body).toEqual({
        product_ids: ["prod_1", "prod_2"],
      });
    });
  });
});
