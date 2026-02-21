import type { RevenueCatClient } from "../client/base.ts";
import type { PaginatedList } from "../types/common.ts";
import type { Subscription, SubscriptionEntitlement, SubscriptionTransaction } from "../types/api.ts";

export class SubscriptionsApi {
  constructor(private client: RevenueCatClient) {}

  async search(
    projectId: string,
    opts?: { store_subscription_identifier?: string; limit?: number; starting_after?: string }
  ): Promise<PaginatedList<Subscription>> {
    return this.client.request("search-subscriptions", { project_id: projectId }, { query: opts });
  }

  async get(projectId: string, subscriptionId: string): Promise<Subscription> {
    return this.client.request("get-subscription", {
      project_id: projectId,
      subscription_id: subscriptionId,
    });
  }

  async listEntitlements(
    projectId: string,
    subscriptionId: string,
    opts?: { limit?: number; starting_after?: string }
  ): Promise<PaginatedList<SubscriptionEntitlement>> {
    return this.client.request(
      "list-subscription-entitlements",
      { project_id: projectId, subscription_id: subscriptionId },
      { query: opts }
    );
  }

  async getTransactions(
    projectId: string,
    subscriptionId: string,
    opts?: { limit?: number; starting_after?: string }
  ): Promise<PaginatedList<SubscriptionTransaction>> {
    return this.client.request(
      "get-subscription-transactions",
      { project_id: projectId, subscription_id: subscriptionId },
      { query: opts }
    );
  }

  async getManagementUrl(
    projectId: string,
    subscriptionId: string
  ): Promise<{ url: string }> {
    return this.client.request("get-subscription-management-url", {
      project_id: projectId,
      subscription_id: subscriptionId,
    });
  }
}
