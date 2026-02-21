import { Command } from "commander";
import { PackagesApi } from "../../api/packages.ts";
import { getClient, getProjectId } from "../index.ts";
import { output, outputError } from "../formatter.ts";

export function registerPackagesCommand(program: Command): void {
  const cmd = program
    .command("packages")
    .description("Manage packages")
    .option("-p, --project <id>", "Project ID");

  cmd
    .command("list")
    .description("List packages in an offering")
    .requiredOption("--offering <id>", "Offering ID")
    .option("--limit <n>", "Limit results", parseInt)
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new PackagesApi(client);
        output(await api.list(projectId, opts.offering, { limit: opts.limit }));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("get")
    .description("Get a package")
    .requiredOption("--package <id>", "Package ID")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const api = new PackagesApi(client);
        output(await api.get(projectId, this.opts().package));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("products")
    .description("List products in a package")
    .requiredOption("--package <id>", "Package ID")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const api = new PackagesApi(client);
        output(await api.listProducts(projectId, this.opts().package));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("create")
    .description("Create a package")
    .requiredOption("--offering <id>", "Offering ID")
    .requiredOption("--lookup-key <key>", "Lookup key (e.g. monthly)")
    .requiredOption("--display-name <name>", "Display name")
    .option("--position <n>", "Position in offering", parseInt)
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new PackagesApi(client);
        output(
          await api.create(projectId, opts.offering, {
            lookup_key: opts.lookupKey,
            display_name: opts.displayName,
            position: opts.position,
          })
        );
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("update")
    .description("Update a package")
    .requiredOption("--package <id>", "Package ID")
    .option("--display-name <name>", "New display name")
    .option("--position <n>", "New position", parseInt)
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new PackagesApi(client);
        output(await api.update(projectId, opts.package, { display_name: opts.displayName, position: opts.position }));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("attach-products")
    .description("Attach products to a package")
    .requiredOption("--package <id>", "Package ID")
    .requiredOption("--products <json>", 'JSON array: [{"product_id":"..."}]')
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new PackagesApi(client);
        output(await api.attachProducts(projectId, opts.package, JSON.parse(opts.products)));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("detach-products")
    .description("Detach products from a package")
    .requiredOption("--package <id>", "Package ID")
    .requiredOption("--product-ids <ids>", "Comma-separated product IDs")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new PackagesApi(client);
        output(await api.detachProducts(projectId, opts.package, opts.productIds.split(",")));
      } catch (e) {
        outputError(e);
      }
    });
}
