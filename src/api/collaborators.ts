import type { RevenueCatClient } from "../client/base.ts";
import type { PaginatedList } from "../types/common.ts";
import type { Collaborator } from "../types/api.ts";

export class CollaboratorsApi {
  constructor(private client: RevenueCatClient) {}

  async list(
    projectId: string,
    opts?: { limit?: number; starting_after?: string }
  ): Promise<PaginatedList<Collaborator>> {
    return this.client.request("list-collaborators", { project_id: projectId }, { query: opts });
  }
}
