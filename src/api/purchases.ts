import type { RevenueCatClient } from "../client/base.ts";
import type { PaginatedList } from "../types/common.ts";
import type { Purchase, PurchaseEntitlement } from "../types/api.ts";

export class PurchasesApi {
  constructor(private client: RevenueCatClient) {}

  async search(
    projectId: string,
    opts?: { store_purchase_identifier?: string; limit?: number; starting_after?: string }
  ): Promise<PaginatedList<Purchase>> {
    return this.client.request("search-purchases", { project_id: projectId }, { query: opts });
  }

  async get(projectId: string, purchaseId: string): Promise<Purchase> {
    return this.client.request("get-purchase", {
      project_id: projectId,
      purchase_id: purchaseId,
    });
  }

  async listEntitlements(
    projectId: string,
    purchaseId: string,
    opts?: { limit?: number; starting_after?: string }
  ): Promise<PaginatedList<PurchaseEntitlement>> {
    return this.client.request(
      "list-purchase-entitlements",
      { project_id: projectId, purchase_id: purchaseId },
      { query: opts }
    );
  }
}
