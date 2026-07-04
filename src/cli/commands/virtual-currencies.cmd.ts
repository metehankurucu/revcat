import { Command } from "commander";
import { VirtualCurrenciesApi } from "../../api/virtual-currencies.ts";
import { getClient, getProjectId } from "../index.ts";
import { output, outputError } from "../formatter.ts";
import { outputList } from "../paginate.ts";

export function registerVirtualCurrenciesCommand(program: Command): void {
  const cmd = program
    .command("virtual-currencies")
    .description("View virtual currencies (read-only)")
    .option("-p, --project <id>", "Project ID");

  cmd
    .command("list")
    .description("List virtual currencies")
    .option("--limit <n>", "Limit results", parseInt)
    .option("--starting-after <id>", "Cursor for pagination")
    .option("--all", "Auto-follow pagination (max 20 pages)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new VirtualCurrenciesApi(client);
        await outputList(opts, (p) => api.list(projectId, p));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("get")
    .description("Get a virtual currency")
    .requiredOption("--code <code>", "Virtual currency code")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const api = new VirtualCurrenciesApi(client);
        output(await api.get(projectId, this.opts().code));
      } catch (e) {
        outputError(e);
      }
    });
}
