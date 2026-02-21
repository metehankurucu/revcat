import type { RevenueCatClient } from "../client/base.ts";
import type { PaginatedList } from "../types/common.ts";
import type { AuditLog } from "../types/api.ts";

export class AuditLogsApi {
  constructor(private client: RevenueCatClient) {}

  async list(
    projectId: string,
    opts?: { limit?: number; starting_after?: string }
  ): Promise<PaginatedList<AuditLog>> {
    return this.client.request("list-audit-logs", { project_id: projectId }, { query: opts });
  }
}
