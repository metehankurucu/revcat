import { Command } from "commander";
import { CustomersApi } from "../../api/customers.ts";
import { getClient, getProjectId } from "../index.ts";
import { output, outputError } from "../formatter.ts";
import { outputList } from "../paginate.ts";

export function registerCustomersCommand(program: Command): void {
  const cmd = program
    .command("customers")
    .description("Manage customers")
    .option("-p, --project <id>", "Project ID");

  cmd
    .command("list")
    .description("List customers")
    .option("--limit <n>", "Limit results", parseInt)
    .option("--starting-after <id>", "Cursor for pagination")
    .option("--all", "Auto-follow pagination (max 20 pages)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new CustomersApi(client);
        await outputList(opts, (p) => api.list(projectId, p));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("get")
    .description("Get a customer")
    .requiredOption("--customer <id>", "Customer ID")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const api = new CustomersApi(client);
        output(await api.get(projectId, this.opts().customer));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("entitlements")
    .description("List active entitlements for a customer")
    .requiredOption("--customer <id>", "Customer ID")
    .option("--limit <n>", "Limit results", parseInt)
    .option("--starting-after <id>", "Cursor for pagination")
    .option("--all", "Auto-follow pagination (max 20 pages)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new CustomersApi(client);
        await outputList(opts, (p) => api.listActiveEntitlements(projectId, opts.customer, p));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("aliases")
    .description("List aliases for a customer")
    .requiredOption("--customer <id>", "Customer ID")
    .option("--limit <n>", "Limit results", parseInt)
    .option("--starting-after <id>", "Cursor for pagination")
    .option("--all", "Auto-follow pagination (max 20 pages)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new CustomersApi(client);
        await outputList(opts, (p) => api.listAliases(projectId, opts.customer, p));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("attributes")
    .description("List attributes for a customer")
    .requiredOption("--customer <id>", "Customer ID")
    .option("--limit <n>", "Limit results", parseInt)
    .option("--starting-after <id>", "Cursor for pagination")
    .option("--all", "Auto-follow pagination (max 20 pages)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new CustomersApi(client);
        await outputList(opts, (p) => api.listAttributes(projectId, opts.customer, p));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("set-attributes")
    .description("Set customer attributes")
    .requiredOption("--customer <id>", "Customer ID")
    .requiredOption("--data <json>", "JSON object of attributes: {\"key\": {\"value\": \"v\"}}")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const api = new CustomersApi(client);
        const attrs = JSON.parse(this.opts().data);
        await api.setAttributes(projectId, this.opts().customer, attrs);
        output({ success: true });
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("purchases")
    .description("List purchases for a customer")
    .requiredOption("--customer <id>", "Customer ID")
    .option("--limit <n>", "Limit results", parseInt)
    .option("--starting-after <id>", "Cursor for pagination")
    .option("--all", "Auto-follow pagination (max 20 pages)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new CustomersApi(client);
        await outputList(opts, (p) => api.listPurchases(projectId, opts.customer, p));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("subscriptions")
    .description("List subscriptions for a customer")
    .requiredOption("--customer <id>", "Customer ID")
    .option("--limit <n>", "Limit results", parseInt)
    .option("--starting-after <id>", "Cursor for pagination")
    .option("--all", "Auto-follow pagination (max 20 pages)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new CustomersApi(client);
        await outputList(opts, (p) => api.listSubscriptions(projectId, opts.customer, p));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("vc-balances")
    .description("List virtual currency balances for a customer")
    .requiredOption("--customer <id>", "Customer ID")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const api = new CustomersApi(client);
        output(await api.listVcBalances(projectId, this.opts().customer));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("assign-offering")
    .description("Assign or clear an offering override for a customer")
    .requiredOption("--customer <id>", "Customer ID")
    .option("--offering <id>", "Offering ID (omit to clear override)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new CustomersApi(client);
        output(await api.assignOffering(projectId, opts.customer, opts.offering ?? null));
      } catch (e) {
        outputError(e);
      }
    });
}
