import { Command } from "commander";
import { EntitlementsApi } from "../../api/entitlements.ts";
import { getClient, getProjectId } from "../index.ts";
import { output, outputError } from "../formatter.ts";
import { outputList } from "../paginate.ts";

export function registerEntitlementsCommand(program: Command): void {
  const cmd = program
    .command("entitlements")
    .description("Manage entitlements")
    .option("-p, --project <id>", "Project ID");

  cmd
    .command("list")
    .description("List entitlements")
    .option("--limit <n>", "Limit results", parseInt)
    .option("--starting-after <id>", "Cursor for pagination")
    .option("--all", "Auto-follow pagination (max 20 pages)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new EntitlementsApi(client);
        await outputList(opts, (p) => api.list(projectId, p));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("get")
    .description("Get an entitlement")
    .requiredOption("--entitlement <id>", "Entitlement ID")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const api = new EntitlementsApi(client);
        output(await api.get(projectId, this.opts().entitlement));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("products")
    .description("List products attached to an entitlement")
    .requiredOption("--entitlement <id>", "Entitlement ID")
    .option("--limit <n>", "Limit results", parseInt)
    .option("--starting-after <id>", "Cursor for pagination")
    .option("--all", "Auto-follow pagination (max 20 pages)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new EntitlementsApi(client);
        await outputList(opts, (p) => api.listProducts(projectId, opts.entitlement, p));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("create")
    .description("Create an entitlement")
    .requiredOption("--lookup-key <key>", "Lookup key (e.g. premium)")
    .requiredOption("--display-name <name>", "Display name")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new EntitlementsApi(client);
        output(await api.create(projectId, { lookup_key: opts.lookupKey, display_name: opts.displayName }));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("update")
    .description("Update an entitlement")
    .requiredOption("--entitlement <id>", "Entitlement ID")
    .option("--display-name <name>", "New display name")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new EntitlementsApi(client);
        output(await api.update(projectId, opts.entitlement, { display_name: opts.displayName }));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("attach-products")
    .description("Attach products to an entitlement")
    .requiredOption("--entitlement <id>", "Entitlement ID")
    .requiredOption("--product-ids <ids>", "Comma-separated product IDs")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new EntitlementsApi(client);
        output(await api.attachProducts(projectId, opts.entitlement, opts.productIds.split(",")));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("detach-products")
    .description("Detach products from an entitlement")
    .requiredOption("--entitlement <id>", "Entitlement ID")
    .requiredOption("--product-ids <ids>", "Comma-separated product IDs")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new EntitlementsApi(client);
        output(await api.detachProducts(projectId, opts.entitlement, opts.productIds.split(",")));
      } catch (e) {
        outputError(e);
      }
    });
}
