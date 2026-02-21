import type { RevenueCatClient } from "../client/base.ts";
import type { PaginatedList } from "../types/common.ts";
import type { App, PublicApiKey } from "../types/api.ts";

export class AppsApi {
  constructor(private client: RevenueCatClient) {}

  async list(
    projectId: string,
    opts?: { limit?: number; starting_after?: string }
  ): Promise<PaginatedList<App>> {
    return this.client.request("list-apps", { project_id: projectId }, { query: opts });
  }

  async get(projectId: string, appId: string): Promise<App> {
    return this.client.request("get-app", { project_id: projectId, app_id: appId });
  }

  async listPublicApiKeys(
    projectId: string,
    appId: string
  ): Promise<PaginatedList<PublicApiKey>> {
    return this.client.request("list-app-public-api-keys", {
      project_id: projectId,
      app_id: appId,
    });
  }

  async getStoreKitConfig(projectId: string, appId: string): Promise<unknown> {
    return this.client.request("get-app-storekit-config", {
      project_id: projectId,
      app_id: appId,
    });
  }
}
