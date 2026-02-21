import type { RevenueCatClient } from "../client/base.ts";
import type { PaginatedList } from "../types/common.ts";
import type { Product } from "../types/api.ts";

export class ProductsApi {
  constructor(private client: RevenueCatClient) {}

  async list(
    projectId: string,
    opts?: { limit?: number; starting_after?: string; app_id?: string }
  ): Promise<PaginatedList<Product>> {
    return this.client.request("list-products", { project_id: projectId }, { query: opts });
  }

  async get(projectId: string, productId: string): Promise<Product> {
    return this.client.request("get-product", {
      project_id: projectId,
      product_id: productId,
    });
  }
}
