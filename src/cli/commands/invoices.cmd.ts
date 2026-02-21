import { Command } from "commander";
import { InvoicesApi } from "../../api/invoices.ts";
import { getClient, getProjectId } from "../index.ts";
import { output, outputError } from "../formatter.ts";

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
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new InvoicesApi(client);
        output(await api.list(projectId, opts.customer, { limit: opts.limit }));
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
