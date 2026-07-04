import type { RevenueCatClient } from "../client/base.ts";
import type { PaginatedList } from "../types/common.ts";
import type { Project } from "../types/api.ts";

export class ProjectsApi {
  constructor(private client: RevenueCatClient) {}

  async list(
    opts?: { limit?: number; starting_after?: string }
  ): Promise<PaginatedList<Project>> {
    return this.client.request("list-projects", {}, { query: opts });
  }
}
