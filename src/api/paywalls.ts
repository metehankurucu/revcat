import type { RevenueCatClient } from "../client/base.ts";
import type { PaginatedList } from "../types/common.ts";
import type { Paywall } from "../types/api.ts";

export class PaywallsApi {
  constructor(private client: RevenueCatClient) {}

  async list(
    projectId: string,
    opts?: { limit?: number; starting_after?: string; expand?: string }
  ): Promise<PaginatedList<Paywall>> {
    return this.client.request("list-paywalls", { project_id: projectId }, { query: opts });
  }

  async get(projectId: string, paywallId: string): Promise<Paywall> {
    return this.client.request("get-paywall", {
      project_id: projectId,
      paywall_id: paywallId,
    });
  }

  async create(
    projectId: string,
    data: { offering_id: string; name?: string }
  ): Promise<Paywall> {
    return this.client.request(
      "create-paywall",
      { project_id: projectId },
      { body: data }
    );
  }
}
