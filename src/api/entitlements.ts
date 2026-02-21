import type { RevenueCatClient } from "../client/base.ts";
import type { PaginatedList } from "../types/common.ts";
import type { Entitlement, Product } from "../types/api.ts";

export class EntitlementsApi {
  constructor(private client: RevenueCatClient) {}

  async list(
    projectId: string,
    opts?: { limit?: number; starting_after?: string }
  ): Promise<PaginatedList<Entitlement>> {
    return this.client.request("list-entitlements", { project_id: projectId }, { query: opts });
  }

  async get(projectId: string, entitlementId: string): Promise<Entitlement> {
    return this.client.request("get-entitlement", {
      project_id: projectId,
      entitlement_id: entitlementId,
    });
  }

  async listProducts(
    projectId: string,
    entitlementId: string,
    opts?: { limit?: number; starting_after?: string }
  ): Promise<PaginatedList<Product>> {
    return this.client.request(
      "list-entitlement-products",
      { project_id: projectId, entitlement_id: entitlementId },
      { query: opts }
    );
  }

  async create(
    projectId: string,
    data: { lookup_key: string; display_name: string }
  ): Promise<Entitlement> {
    return this.client.request(
      "create-entitlement",
      { project_id: projectId },
      { body: data }
    );
  }

  async update(
    projectId: string,
    entitlementId: string,
    data: { display_name?: string }
  ): Promise<Entitlement> {
    return this.client.request(
      "update-entitlement",
      { project_id: projectId, entitlement_id: entitlementId },
      { body: data }
    );
  }

  async attachProducts(
    projectId: string,
    entitlementId: string,
    productIds: string[]
  ): Promise<Entitlement> {
    return this.client.request(
      "attach-products-to-entitlement",
      { project_id: projectId, entitlement_id: entitlementId },
      { body: { product_ids: productIds } }
    );
  }

  async detachProducts(
    projectId: string,
    entitlementId: string,
    productIds: string[]
  ): Promise<Entitlement> {
    return this.client.request(
      "detach-products-from-entitlement",
      { project_id: projectId, entitlement_id: entitlementId },
      { body: { product_ids: productIds } }
    );
  }
}
