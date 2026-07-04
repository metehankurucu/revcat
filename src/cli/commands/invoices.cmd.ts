import { Command } from "commander";
import { InvoicesApi } from "../../api/invoices.ts";
import { getClient, getProjectId } from "../index.ts";
import { output, outputError } from "../formatter.ts";
import { outputList } from "../paginate.ts";

export function registerInvoicesCommand(program: Command): void {
  const cmd = program
    .command("invoices")
    .description("View invoices (read-only)")
    .option("-p, --project <id>", "Project ID");

  cmd
    .command("list")
    .description("List invoices for a customer")
    .requiredOption("--customer <id>", "Customer ID")
    .option("--limit <n>", "Limit results", parseInt)
    .option("--starting-after <id>", "Cursor for pagination")
    .option("--all", "Auto-follow pagination (max 20 pages)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new InvoicesApi(client);
        await outputList(opts, (p) => api.list(projectId, opts.customer, p));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("get")
    .description("Get an invoice file")
    .requiredOption("--customer <id>", "Customer ID")
    .requiredOption("--invoice <id>", "Invoice ID")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new InvoicesApi(client);
        output(await api.getFile(projectId, opts.customer, opts.invoice));
      } catch (e) {
        outputError(e);
      }
    });
}
