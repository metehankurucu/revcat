import { Command } from "commander";
import { VirtualCurrenciesApi } from "../../api/virtual-currencies.ts";
import { getClient, getProjectId } from "../index.ts";
import { output, outputError } from "../formatter.ts";

export function registerVirtualCurrenciesCommand(program: Command): void {
  const cmd = program
    .command("virtual-currencies")
    .description("View virtual currencies (read-only)")
    .option("-p, --project <id>", "Project ID");

  cmd
    .command("list")
    .description("List virtual currencies")
    .option("--limit <n>", "Limit results", parseInt)
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const api = new VirtualCurrenciesApi(client);
        output(await api.list(projectId, this.opts()));
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
