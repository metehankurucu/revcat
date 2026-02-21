import type { RevenueCatClient } from "../client/base.ts";
import type { PaginatedList } from "../types/common.ts";
import type { Offering } from "../types/api.ts";

export class OfferingsApi {
  constructor(private client: RevenueCatClient) {}

  async list(
    projectId: string,
    opts?: { limit?: number; starting_after?: string; expand?: string }
  ): Promise<PaginatedList<Offering>> {
    return this.client.request("list-offerings", { project_id: projectId }, { query: opts });
  }

  async get(projectId: string, offeringId: string): Promise<Offering> {
    return this.client.request("get-offering", {
      project_id: projectId,
      offering_id: offeringId,
    });
  }

  async create(
    projectId: string,
    data: {
      lookup_key: string;
      display_name: string;
      metadata?: Record<string, unknown>;
      is_current?: boolean;
    }
  ): Promise<Offering> {
    return this.client.request(
      "create-offering",
      { project_id: projectId },
      { body: data }
    );
  }

  async update(
    projectId: string,
    offeringId: string,
    data: {
      display_name?: string;
      metadata?: Record<string, unknown>;
      is_current?: boolean;
    }
  ): Promise<Offering> {
    return this.client.request(
      "update-offering",
      { project_id: projectId, offering_id: offeringId },
      { body: data }
    );
  }
}
