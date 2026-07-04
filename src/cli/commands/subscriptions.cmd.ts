import { Command } from "commander";
import { SubscriptionsApi } from "../../api/subscriptions.ts";
import { getClient, getProjectId } from "../index.ts";
import { output, outputError } from "../formatter.ts";
import { outputList } from "../paginate.ts";

export function registerSubscriptionsCommand(program: Command): void {
  const cmd = program
    .command("subscriptions")
    .description("View subscriptions (read-only)")
    .option("-p, --project <id>", "Project ID");

  cmd
    .command("search")
    .description("Search subscriptions by store identifier")
    .option("--store-identifier <id>", "Store subscription identifier")
    .option("--limit <n>", "Limit results", parseInt)
    .option("--starting-after <id>", "Cursor for pagination")
    .option("--all", "Auto-follow pagination (max 20 pages)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new SubscriptionsApi(client);
        await outputList(opts, (p) =>
          api.search(projectId, { ...p, store_subscription_identifier: opts.storeIdentifier })
        );
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("get")
    .description("Get a subscription")
    .requiredOption("--subscription <id>", "Subscription ID")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const api = new SubscriptionsApi(client);
        output(await api.get(projectId, this.opts().subscription));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("entitlements")
    .description("List entitlements for a subscription")
    .requiredOption("--subscription <id>", "Subscription ID")
    .option("--limit <n>", "Limit results", parseInt)
    .option("--starting-after <id>", "Cursor for pagination")
    .option("--all", "Auto-follow pagination (max 20 pages)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new SubscriptionsApi(client);
        await outputList(opts, (p) => api.listEntitlements(projectId, opts.subscription, p));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("transactions")
    .description("List transactions for a subscription")
    .requiredOption("--subscription <id>", "Subscription ID")
    .option("--limit <n>", "Limit results", parseInt)
    .option("--starting-after <id>", "Cursor for pagination")
    .option("--all", "Auto-follow pagination (max 20 pages)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new SubscriptionsApi(client);
        await outputList(opts, (p) => api.getTransactions(projectId, opts.subscription, p));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("management-url")
    .description("Get management URL for a Web Billing subscription")
    .requiredOption("--subscription <id>", "Subscription ID")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const api = new SubscriptionsApi(client);
        output(await api.getManagementUrl(projectId, this.opts().subscription));
      } catch (e) {
        outputError(e);
      }
    });
}
