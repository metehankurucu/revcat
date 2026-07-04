import { Command } from "commander";
import { PurchasesApi } from "../../api/purchases.ts";
import { getClient, getProjectId } from "../index.ts";
import { output, outputError } from "../formatter.ts";
import { outputList } from "../paginate.ts";

export function registerPurchasesCommand(program: Command): void {
  const cmd = program
    .command("purchases")
    .description("View purchases (read-only)")
    .option("-p, --project <id>", "Project ID");

  cmd
    .command("search")
    .description("Search purchases by store identifier")
    .option("--store-identifier <id>", "Store purchase identifier")
    .option("--limit <n>", "Limit results", parseInt)
    .option("--starting-after <id>", "Cursor for pagination")
    .option("--all", "Auto-follow pagination (max 20 pages)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new PurchasesApi(client);
        await outputList(opts, (p) =>
          api.search(projectId, { ...p, store_purchase_identifier: opts.storeIdentifier })
        );
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("get")
    .description("Get a purchase")
    .requiredOption("--purchase <id>", "Purchase ID")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const api = new PurchasesApi(client);
        output(await api.get(projectId, this.opts().purchase));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("entitlements")
    .description("List entitlements for a purchase")
    .requiredOption("--purchase <id>", "Purchase ID")
    .option("--limit <n>", "Limit results", parseInt)
    .option("--starting-after <id>", "Cursor for pagination")
    .option("--all", "Auto-follow pagination (max 20 pages)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new PurchasesApi(client);
        await outputList(opts, (p) => api.listEntitlements(projectId, opts.purchase, p));
      } catch (e) {
        outputError(e);
      }
    });
}
