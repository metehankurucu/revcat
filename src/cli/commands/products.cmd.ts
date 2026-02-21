import { Command } from "commander";
import { ProductsApi } from "../../api/products.ts";
import { getClient, getProjectId } from "../index.ts";
import { output, outputError } from "../formatter.ts";

export function registerProductsCommand(program: Command): void {
  const cmd = program
    .command("products")
    .description("View products (read-only)")
    .option("-p, --project <id>", "Project ID");

  cmd
    .command("list")
    .description("List products")
    .option("--limit <n>", "Limit results", parseInt)
    .option("--app-id <id>", "Filter by app ID")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new ProductsApi(client);
        output(await api.list(projectId, { limit: opts.limit, app_id: opts.appId }));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("get")
    .description("Get a product")
    .requiredOption("--product <id>", "Product ID")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const api = new ProductsApi(client);
        output(await api.get(projectId, this.opts().product));
      } catch (e) {
        outputError(e);
      }
    });
}
