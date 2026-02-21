import type { RevenueCatClient } from "../client/base.ts";
import type { PaginatedList } from "../types/common.ts";
import type { WebhookIntegration } from "../types/api.ts";

export class WebhooksApi {
  constructor(private client: RevenueCatClient) {}

  async list(
    projectId: string,
    opts?: { limit?: number; starting_after?: string }
  ): Promise<PaginatedList<WebhookIntegration>> {
    return this.client.request("list-webhooks", { project_id: projectId }, { query: opts });
  }

  async get(projectId: string, webhookId: string): Promise<WebhookIntegration> {
    return this.client.request("get-webhook", {
      project_id: projectId,
      webhook_integration_id: webhookId,
    });
  }

  async create(
    projectId: string,
    data: {
      url: string;
      name?: string;
      authorization_header?: string;
      environment?: "production" | "sandbox" | "all";
    }
  ): Promise<WebhookIntegration> {
    return this.client.request(
      "create-webhook",
      { project_id: projectId },
      { body: data }
    );
  }

  async update(
    projectId: string,
    webhookId: string,
    data: {
      url?: string;
      name?: string;
      authorization_header?: string;
      environment?: "production" | "sandbox" | "all";
    }
  ): Promise<WebhookIntegration> {
    return this.client.request(
      "update-webhook",
      { project_id: projectId, webhook_integration_id: webhookId },
      { body: data }
    );
  }
}
