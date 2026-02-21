import type { RevenueCatClient } from "../client/base.ts";
import type { PaginatedList } from "../types/common.ts";
import type { Invoice } from "../types/api.ts";

export class InvoicesApi {
  constructor(private client: RevenueCatClient) {}

  async list(
    projectId: string,
    customerId: string,
    opts?: { limit?: number; starting_after?: string }
  ): Promise<PaginatedList<Invoice>> {
    return this.client.request(
      "list-invoices",
      { project_id: projectId, customer_id: customerId },
      { query: opts }
    );
  }

  async getFile(
    projectId: string,
    customerId: string,
    invoiceId: string
  ): Promise<string> {
    return this.client.request("get-invoice-file", {
      project_id: projectId,
      customer_id: customerId,
      invoice_id: invoiceId,
    });
  }
}
