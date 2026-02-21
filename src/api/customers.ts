import type { RevenueCatClient } from "../client/base.ts";
import type { PaginatedList } from "../types/common.ts";
import type {
  Customer,
  CustomerActiveEntitlement,
  CustomerAttribute,
  Purchase,
  Subscription,
  VirtualCurrencyBalance,
} from "../types/api.ts";

export class CustomersApi {
  constructor(private client: RevenueCatClient) {}

  async list(
    projectId: string,
    opts?: { limit?: number; starting_after?: string }
  ): Promise<PaginatedList<Customer>> {
    return this.client.request("list-customers", { project_id: projectId }, { query: opts });
  }

  async get(projectId: string, customerId: string): Promise<Customer> {
    return this.client.request("get-customer", {
      project_id: projectId,
      customer_id: customerId,
    });
  }

  async listActiveEntitlements(
    projectId: string,
    customerId: string,
    opts?: { limit?: number; starting_after?: string }
  ): Promise<PaginatedList<CustomerActiveEntitlement>> {
    return this.client.request(
      "list-customer-active-entitlements",
      { project_id: projectId, customer_id: customerId },
      { query: opts }
    );
  }

  async listAliases(
    projectId: string,
    customerId: string,
    opts?: { limit?: number; starting_after?: string }
  ): Promise<PaginatedList<{ object: string; id: string }>> {
    return this.client.request(
      "list-customer-aliases",
      { project_id: projectId, customer_id: customerId },
      { query: opts }
    );
  }

  async listAttributes(
    projectId: string,
    customerId: string,
    opts?: { limit?: number; starting_after?: string }
  ): Promise<PaginatedList<CustomerAttribute>> {
    return this.client.request(
      "list-customer-attributes",
      { project_id: projectId, customer_id: customerId },
      { query: opts }
    );
  }

  async listPurchases(
    projectId: string,
    customerId: string,
    opts?: { limit?: number; starting_after?: string }
  ): Promise<PaginatedList<Purchase>> {
    return this.client.request(
      "list-customer-purchases",
      { project_id: projectId, customer_id: customerId },
      { query: opts }
    );
  }

  async listSubscriptions(
    projectId: string,
    customerId: string,
    opts?: { limit?: number; starting_after?: string }
  ): Promise<PaginatedList<Subscription>> {
    return this.client.request(
      "list-customer-subscriptions",
      { project_id: projectId, customer_id: customerId },
      { query: opts }
    );
  }

  async listVcBalances(
    projectId: string,
    customerId: string
  ): Promise<PaginatedList<VirtualCurrencyBalance>> {
    return this.client.request("list-customer-vc-balances", {
      project_id: projectId,
      customer_id: customerId,
    });
  }

  async setAttributes(
    projectId: string,
    customerId: string,
    attributes: Record<string, { value: string; updated_at_ms?: number }>
  ): Promise<void> {
    await this.client.request(
      "set-customer-attributes",
      { project_id: projectId, customer_id: customerId },
      { body: { attributes } }
    );
  }

  async assignOffering(
    projectId: string,
    customerId: string,
    offeringId: string | null
  ): Promise<Customer> {
    return this.client.request(
      "assign-customer-offering",
      { project_id: projectId, customer_id: customerId },
      { body: { offering_id: offeringId } }
    );
  }
}
