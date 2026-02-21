import { Command } from "commander";
import { AuditLogsApi } from "../../api/audit-logs.ts";
import { getClient, getProjectId } from "../index.ts";
import { output, outputError } from "../formatter.ts";

export function registerAuditLogsCommand(program: Command): void {
  const cmd = program
    .command("audit-logs")
    .description("View audit logs (read-only)")
    .option("-p, --project <id>", "Project ID");

  cmd
    .command("list")
    .description("List audit logs")
    .option("--limit <n>", "Limit results", parseInt)
    .option("--starting-after <id>", "Cursor for pagination")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new AuditLogsApi(client);
        output(await api.list(projectId, { limit: opts.limit, starting_after: opts.startingAfter }));
      } catch (e) {
        outputError(e);
      }
    });
}
