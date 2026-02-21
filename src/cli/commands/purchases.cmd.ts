import { Command } from "commander";
import { PurchasesApi } from "../../api/purchases.ts";
import { getClient, getProjectId } from "../index.ts";
import { output, outputError } from "../formatter.ts";

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
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new PurchasesApi(client);
        output(await api.search(projectId, {
          store_purchase_identifier: opts.storeIdentifier,
          limit: opts.limit,
        }));
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
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const api = new PurchasesApi(client);
        output(await api.listEntitlements(projectId, this.opts().purchase));
      } catch (e) {
        outputError(e);
      }
    });
}
