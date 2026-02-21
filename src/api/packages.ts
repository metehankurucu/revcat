import type { RevenueCatClient } from "../client/base.ts";
import type { PaginatedList } from "../types/common.ts";
import type { Package, Product } from "../types/api.ts";

export class PackagesApi {
  constructor(private client: RevenueCatClient) {}

  async list(
    projectId: string,
    offeringId: string,
    opts?: { limit?: number; starting_after?: string }
  ): Promise<PaginatedList<Package>> {
    return this.client.request(
      "list-packages",
      { project_id: projectId, offering_id: offeringId },
      { query: opts }
    );
  }

  async get(projectId: string, packageId: string): Promise<Package> {
    return this.client.request("get-package", {
      project_id: projectId,
      package_id: packageId,
    });
  }

  async listProducts(
    projectId: string,
    packageId: string,
    opts?: { limit?: number; starting_after?: string }
  ): Promise<PaginatedList<Product>> {
    return this.client.request(
      "list-package-products",
      { project_id: projectId, package_id: packageId },
      { query: opts }
    );
  }

  async create(
    projectId: string,
    offeringId: string,
    data: { lookup_key: string; display_name: string; position?: number }
  ): Promise<Package> {
    return this.client.request(
      "create-package",
      { project_id: projectId, offering_id: offeringId },
      { body: data }
    );
  }

  async update(
    projectId: string,
    packageId: string,
    data: { display_name?: string; position?: number }
  ): Promise<Package> {
    return this.client.request(
      "update-package",
      { project_id: projectId, package_id: packageId },
      { body: data }
    );
  }

  async attachProducts(
    projectId: string,
    packageId: string,
    products: Array<{ product_id: string; eligibility_criteria?: string; base_plan_id?: string }>
  ): Promise<Package> {
    return this.client.request(
      "attach-products-to-package",
      { project_id: projectId, package_id: packageId },
      { body: { products } }
    );
  }

  async detachProducts(
    projectId: string,
    packageId: string,
    productIds: string[]
  ): Promise<Package> {
    return this.client.request(
      "detach-products-from-package",
      { project_id: projectId, package_id: packageId },
      { body: { product_ids: productIds } }
    );
  }
}
