import { Command } from "commander";
import { OfferingsApi } from "../../api/offerings.ts";
import { getClient, getProjectId } from "../index.ts";
import { output, outputError } from "../formatter.ts";
import { outputList } from "../paginate.ts";

export function registerOfferingsCommand(program: Command): void {
  const cmd = program
    .command("offerings")
    .description("Manage offerings")
    .option("-p, --project <id>", "Project ID");

  cmd
    .command("list")
    .description("List offerings")
    .option("--limit <n>", "Limit results", parseInt)
    .option("--starting-after <id>", "Cursor for pagination")
    .option("--all", "Auto-follow pagination (max 20 pages)")
    .option("--expand <fields>", "Expand fields (e.g. items.packages)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new OfferingsApi(client);
        await outputList(opts, (p) => api.list(projectId, { ...p, expand: opts.expand }));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("get")
    .description("Get an offering")
    .requiredOption("--offering <id>", "Offering ID")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const api = new OfferingsApi(client);
        output(await api.get(projectId, this.opts().offering));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("create")
    .description("Create an offering")
    .requiredOption("--lookup-key <key>", "Lookup key (e.g. default)")
    .requiredOption("--display-name <name>", "Display name")
    .option("--is-current", "Set as current offering")
    .option("--metadata <json>", "JSON metadata object")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new OfferingsApi(client);
        output(
          await api.create(projectId, {
            lookup_key: opts.lookupKey,
            display_name: opts.displayName,
            is_current: opts.isCurrent || undefined,
            metadata: opts.metadata ? JSON.parse(opts.metadata) : undefined,
          })
        );
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("update")
    .description("Update an offering")
    .requiredOption("--offering <id>", "Offering ID")
    .option("--display-name <name>", "New display name")
    .option("--is-current", "Set as current offering")
    .option("--metadata <json>", "JSON metadata object")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new OfferingsApi(client);
        output(
          await api.update(projectId, opts.offering, {
            display_name: opts.displayName,
            is_current: opts.isCurrent || undefined,
            metadata: opts.metadata ? JSON.parse(opts.metadata) : undefined,
          })
        );
      } catch (e) {
        outputError(e);
      }
    });
}
