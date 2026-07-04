import { Command } from "commander";
import { AuditLogsApi } from "../../api/audit-logs.ts";
import { getClient, getProjectId } from "../index.ts";
import { outputError } from "../formatter.ts";
import { outputList } from "../paginate.ts";

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
    .option("--all", "Auto-follow pagination (max 20 pages)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new AuditLogsApi(client);
        await outputList(opts, (p) => api.list(projectId, p));
      } catch (e) {
        outputError(e);
      }
    });
}
