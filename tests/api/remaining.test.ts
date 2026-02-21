import { describe, it, expect } from "bun:test";
import { ProjectsApi } from "../../src/api/projects.ts";
import { AppsApi } from "../../src/api/apps.ts";
import { ProductsApi } from "../../src/api/products.ts";
import { PurchasesApi } from "../../src/api/purchases.ts";
import { InvoicesApi } from "../../src/api/invoices.ts";
import { AuditLogsApi } from "../../src/api/audit-logs.ts";
import { CollaboratorsApi } from "../../src/api/collaborators.ts";
import { VirtualCurrenciesApi } from "../../src/api/virtual-currencies.ts";
import { WebhooksApi } from "../../src/api/webhooks.ts";
import { PaywallsApi } from "../../src/api/paywalls.ts";
import { createMockClient } from "../helpers.ts";

describe("ProjectsApi", () => {
  it("should call list-projects", async () => {
    const { client, requests } = createMockClient({ object: "list", items: [] });
    const api = new ProjectsApi(client);

    await api.list();

    expect(requests[0].operationId).toBe("list-projects");
    expect(requests[0].pathParams).toEqual({});
  });
});

describe("AppsApi", () => {
  it("should call list-apps", async () => {
    const { client, requests } = createMockClient({ object: "list", items: [] });
    const api = new AppsApi(client);

    await api.list("proj_1");

    expect(requests[0].operationId).toBe("list-apps");
  });

  it("should call get-app with app ID", async () => {
    const { client, requests } = createMockClient({ object: "app" });
    const api = new AppsApi(client);

    await api.get("proj_1", "app_ios");

    expect(requests[0].operationId).toBe("get-app");
    expect(requests[0].pathParams.app_id).toBe("app_ios");
  });

  it("should call list-app-public-api-keys", async () => {
    const { client, requests } = createMockClient({ object: "list", items: [] });
    const api = new AppsApi(client);

    await api.listPublicApiKeys("proj_1", "app_ios");

    expect(requests[0].operationId).toBe("list-app-public-api-keys");
  });

  it("should call get-app-storekit-config", async () => {
    const { client, requests } = createMockClient({});
    const api = new AppsApi(client);

    await api.getStoreKitConfig("proj_1", "app_ios");

    expect(requests[0].operationId).toBe("get-app-storekit-config");
  });
});

describe("ProductsApi", () => {
  it("should call list-products", async () => {
    const { client, requests } = createMockClient({ object: "list", items: [] });
    const api = new ProductsApi(client);

    await api.list("proj_1");

    expect(requests[0].operationId).toBe("list-products");
  });

  it("should pass app_id filter", async () => {
    const { client, requests } = createMockClient({ object: "list", items: [] });
    const api = new ProductsApi(client);

    await api.list("proj_1", { app_id: "app_ios" });

    expect(requests[0].options?.query).toEqual({ app_id: "app_ios" });
  });

  it("should call get-product", async () => {
    const { client, requests } = createMockClient({ object: "product" });
    const api = new ProductsApi(client);

    await api.get("proj_1", "prod_monthly");

    expect(requests[0].operationId).toBe("get-product");
    expect(requests[0].pathParams.product_id).toBe("prod_monthly");
  });
});

describe("PurchasesApi", () => {
  it("should call search-purchases", async () => {
    const { client, requests } = createMockClient({ object: "list", items: [] });
    const api = new PurchasesApi(client);

    await api.search("proj_1", { store_purchase_identifier: "GPA.123" });

    expect(requests[0].operationId).toBe("search-purchases");
    expect(requests[0].options?.query).toEqual({
      store_purchase_identifier: "GPA.123",
    });
  });

  it("should call get-purchase", async () => {
    const { client, requests } = createMockClient({ object: "purchase" });
    const api = new PurchasesApi(client);

    await api.get("proj_1", "purch_abc");

    expect(requests[0].operationId).toBe("get-purchase");
    expect(requests[0].pathParams.purchase_id).toBe("purch_abc");
  });

  it("should call list-purchase-entitlements", async () => {
    const { client, requests } = createMockClient({ object: "list", items: [] });
    const api = new PurchasesApi(client);

    await api.listEntitlements("proj_1", "purch_abc");

    expect(requests[0].operationId).toBe("list-purchase-entitlements");
  });
});

describe("InvoicesApi", () => {
  it("should call list-invoices with customer ID", async () => {
    const { client, requests } = createMockClient({ object: "list", items: [] });
    const api = new InvoicesApi(client);

    await api.list("proj_1", "cust_abc");

    expect(requests[0].operationId).toBe("list-invoices");
    expect(requests[0].pathParams.customer_id).toBe("cust_abc");
  });

  it("should call get-invoice-file", async () => {
    const { client, requests } = createMockClient("pdf_content");
    const api = new InvoicesApi(client);

    await api.getFile("proj_1", "cust_abc", "inv_1");

    expect(requests[0].operationId).toBe("get-invoice-file");
    expect(requests[0].pathParams.invoice_id).toBe("inv_1");
  });
});

describe("AuditLogsApi", () => {
  it("should call list-audit-logs", async () => {
    const { client, requests } = createMockClient({ object: "list", items: [] });
    const api = new AuditLogsApi(client);

    await api.list("proj_1", { limit: 100 });

    expect(requests[0].operationId).toBe("list-audit-logs");
    expect(requests[0].options?.query).toEqual({ limit: 100 });
  });
});

describe("CollaboratorsApi", () => {
  it("should call list-collaborators", async () => {
    const { client, requests } = createMockClient({ object: "list", items: [] });
    const api = new CollaboratorsApi(client);

    await api.list("proj_1");

    expect(requests[0].operationId).toBe("list-collaborators");
  });
});

describe("VirtualCurrenciesApi", () => {
  it("should call list-virtual-currencies", async () => {
    const { client, requests } = createMockClient({ object: "list", items: [] });
    const api = new VirtualCurrenciesApi(client);

    await api.list("proj_1");

    expect(requests[0].operationId).toBe("list-virtual-currencies");
  });

  it("should call get-virtual-currency with code", async () => {
    const { client, requests } = createMockClient({ object: "virtual_currency" });
    const api = new VirtualCurrenciesApi(client);

    await api.get("proj_1", "GLD");

    expect(requests[0].operationId).toBe("get-virtual-currency");
    expect(requests[0].pathParams.virtual_currency_code).toBe("GLD");
  });
});

describe("WebhooksApi", () => {
  it("should call list-webhooks", async () => {
    const { client, requests } = createMockClient({ object: "list", items: [] });
    const api = new WebhooksApi(client);

    await api.list("proj_1");

    expect(requests[0].operationId).toBe("list-webhooks");
  });

  it("should call get-webhook", async () => {
    const { client, requests } = createMockClient({ object: "webhook_integration" });
    const api = new WebhooksApi(client);

    await api.get("proj_1", "wh_abc");

    expect(requests[0].operationId).toBe("get-webhook");
    expect(requests[0].pathParams.webhook_integration_id).toBe("wh_abc");
  });

  it("should call create-webhook with body", async () => {
    const { client, requests } = createMockClient({ object: "webhook_integration" });
    const api = new WebhooksApi(client);

    await api.create("proj_1", {
      url: "https://my-server.com/webhook",
      name: "My Webhook",
      environment: "production",
    });

    expect(requests[0].operationId).toBe("create-webhook");
    expect(requests[0].options?.body).toEqual({
      url: "https://my-server.com/webhook",
      name: "My Webhook",
      environment: "production",
    });
  });

  it("should call update-webhook", async () => {
    const { client, requests } = createMockClient({ object: "webhook_integration" });
    const api = new WebhooksApi(client);

    await api.update("proj_1", "wh_abc", { url: "https://new-url.com/hook" });

    expect(requests[0].operationId).toBe("update-webhook");
    expect(requests[0].pathParams.webhook_integration_id).toBe("wh_abc");
    expect(requests[0].options?.body).toEqual({ url: "https://new-url.com/hook" });
  });
});

describe("PaywallsApi", () => {
  it("should call list-paywalls", async () => {
    const { client, requests } = createMockClient({ object: "list", items: [] });
    const api = new PaywallsApi(client);

    await api.list("proj_1");

    expect(requests[0].operationId).toBe("list-paywalls");
  });

  it("should pass expand option", async () => {
    const { client, requests } = createMockClient({ object: "list", items: [] });
    const api = new PaywallsApi(client);

    await api.list("proj_1", { expand: "items.offering" });

    expect(requests[0].options?.query).toEqual({ expand: "items.offering" });
  });

  it("should call get-paywall", async () => {
    const { client, requests } = createMockClient({ object: "paywall" });
    const api = new PaywallsApi(client);

    await api.get("proj_1", "pw_abc");

    expect(requests[0].operationId).toBe("get-paywall");
    expect(requests[0].pathParams.paywall_id).toBe("pw_abc");
  });

  it("should call create-paywall with offering ID", async () => {
    const { client, requests } = createMockClient({ object: "paywall" });
    const api = new PaywallsApi(client);

    await api.create("proj_1", {
      offering_id: "off_default",
      name: "Main Paywall",
    });

    expect(requests[0].operationId).toBe("create-paywall");
    expect(requests[0].options?.body).toEqual({
      offering_id: "off_default",
      name: "Main Paywall",
    });
  });
});
