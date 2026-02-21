import { Command } from "commander";
import { PaywallsApi } from "../../api/paywalls.ts";
import { getClient, getProjectId } from "../index.ts";
import { output, outputError } from "../formatter.ts";

export function registerPaywallsCommand(program: Command): void {
  const cmd = program
    .command("paywalls")
    .description("Manage paywalls")
    .option("-p, --project <id>", "Project ID");

  cmd
    .command("list")
    .description("List paywalls")
    .option("--limit <n>", "Limit results", parseInt)
    .option("--expand <fields>", "Expand fields (e.g. items.offering)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new PaywallsApi(client);
        output(await api.list(projectId, { limit: opts.limit, expand: opts.expand }));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("get")
    .description("Get a paywall")
    .requiredOption("--paywall <id>", "Paywall ID")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const api = new PaywallsApi(client);
        output(await api.get(projectId, this.opts().paywall));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("create")
    .description("Create a paywall")
    .requiredOption("--offering <id>", "Offering ID to associate with")
    .option("--name <name>", "Paywall name")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new PaywallsApi(client);
        output(await api.create(projectId, { offering_id: opts.offering, name: opts.name }));
      } catch (e) {
        outputError(e);
      }
    });
}
