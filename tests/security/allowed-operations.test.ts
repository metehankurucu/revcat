import { describe, it, expect } from "bun:test";
import { ALLOWED_OPERATIONS } from "../../src/security/allowed-operations.ts";
import { RevenueCatClient } from "../../src/client/base.ts";
import { BlockedOperationError } from "../../src/client/errors.ts";

const BLOCKED_OPERATION_IDS = [
  // DELETE operations
  "delete-app",
  "delete-customer",
  "delete-entitlement",
  "delete-offering",
  "delete-package",
  "delete-package-from-offering",
  "delete-paywall",
  "delete-product",
  "delete-virtual-currency",
  "delete-webhook-integration",
  // Refund operations
  "refund-purchase",
  "refund-subscription",
  "refund-play-store-subscription-transaction",
  // Grant/revoke
  "grant-customer-entitlement",
  "revoke-customer-granted-entitlement",
  // Dangerous mutations
  "transfer-customer-data",
  "cancel-subscription",
  "create-app",
  "create-project",
  "create-product",
  "create-product-in-store",
  "create-customer",
  "create-virtual-currencies-transaction",
  "update-virtual-currencies-balance",
];

describe("Security: Allowed Operations", () => {
  for (const op of BLOCKED_OPERATION_IDS) {
    it(`should NOT allow blocked operation: ${op}`, () => {
      expect(ALLOWED_OPERATIONS.has(op)).toBe(false);
    });
  }

  it("should NOT contain any DELETE method", () => {
    for (const [, op] of ALLOWED_OPERATIONS) {
      expect(op.method).not.toBe("DELETE");
    }
  });

  it("should only allow GET and POST methods", () => {
    for (const [, op] of ALLOWED_OPERATIONS) {
      expect(["GET", "POST"]).toContain(op.method);
    }
  });

  it("should NOT contain any refund paths", () => {
    for (const [, op] of ALLOWED_OPERATIONS) {
      expect(op.path).not.toContain("refund");
    }
  });

  it("should NOT contain any cancel paths", () => {
    for (const [, op] of ALLOWED_OPERATIONS) {
      expect(op.path).not.toContain("cancel");
    }
  });

  it("should NOT contain grant_entitlement paths", () => {
    for (const [, op] of ALLOWED_OPERATIONS) {
      expect(op.path).not.toContain("grant_entitlement");
    }
  });

  it("should NOT contain revoke paths", () => {
    for (const [, op] of ALLOWED_OPERATIONS) {
      expect(op.path).not.toContain("revoke");
    }
  });

  it("should NOT contain transfer paths", () => {
    for (const [, op] of ALLOWED_OPERATIONS) {
      expect(op.path).not.toContain("actions/transfer");
    }
  });

  it("should have valid domains for all operations", () => {
    const validDomains = ["charts_metrics", "customer_information", "project_configuration"];
    for (const [, op] of ALLOWED_OPERATIONS) {
      expect(validDomains).toContain(op.domain);
    }
  });

  it("should have at least 50 allowed operations", () => {
    expect(ALLOWED_OPERATIONS.size).toBeGreaterThanOrEqual(50);
  });

  it("should include core analytics endpoints", () => {
    expect(ALLOWED_OPERATIONS.has("get-overview-metrics")).toBe(true);
    expect(ALLOWED_OPERATIONS.has("get-chart-data")).toBe(true);
    expect(ALLOWED_OPERATIONS.has("get-chart-options")).toBe(true);
  });

  it("should include safe write operations", () => {
    expect(ALLOWED_OPERATIONS.has("set-customer-attributes")).toBe(true);
    expect(ALLOWED_OPERATIONS.has("assign-customer-offering")).toBe(true);
    expect(ALLOWED_OPERATIONS.has("create-offering")).toBe(true);
    expect(ALLOWED_OPERATIONS.has("update-offering")).toBe(true);
    expect(ALLOWED_OPERATIONS.has("create-package")).toBe(true);
    expect(ALLOWED_OPERATIONS.has("create-entitlement")).toBe(true);
    expect(ALLOWED_OPERATIONS.has("create-paywall")).toBe(true);
    expect(ALLOWED_OPERATIONS.has("create-webhook")).toBe(true);
  });
});

describe("Security: Client blocks unknown operations", () => {
  const client = new RevenueCatClient({ apiKey: "test_key" });

  it("should throw BlockedOperationError for unknown operations", async () => {
    await expect(
      client.request("delete-app", { project_id: "test", app_id: "test" })
    ).rejects.toThrow(BlockedOperationError);
  });

  it("should throw BlockedOperationError for made-up operations", async () => {
    await expect(
      client.request("nuke-everything", {})
    ).rejects.toThrow(BlockedOperationError);
  });

  it("should throw BlockedOperationError with descriptive message", async () => {
    try {
      await client.request("delete-customer", { project_id: "test", customer_id: "test" });
      expect(true).toBe(false); // should not reach here
    } catch (e) {
      expect(e).toBeInstanceOf(BlockedOperationError);
      expect((e as Error).message).toContain("blocked");
      expect((e as Error).message).toContain("delete-customer");
    }
  });
});
