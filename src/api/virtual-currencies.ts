import type { RevenueCatClient } from "../client/base.ts";
import type { PaginatedList } from "../types/common.ts";
import type { VirtualCurrency } from "../types/api.ts";

export class VirtualCurrenciesApi {
  constructor(private client: RevenueCatClient) {}

  async list(
    projectId: string,
    opts?: { limit?: number; starting_after?: string }
  ): Promise<PaginatedList<VirtualCurrency>> {
    return this.client.request("list-virtual-currencies", { project_id: projectId }, { query: opts });
  }

  async get(projectId: string, code: string): Promise<VirtualCurrency> {
    return this.client.request("get-virtual-currency", {
      project_id: projectId,
      virtual_currency_code: code,
    });
  }
}
