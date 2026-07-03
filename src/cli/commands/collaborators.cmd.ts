import { Command } from "commander";
import { CollaboratorsApi } from "../../api/collaborators.ts";
import { getClient, getProjectId } from "../index.ts";
import { outputError } from "../formatter.ts";
import { outputList } from "../paginate.ts";

export function registerCollaboratorsCommand(program: Command): void {
  const cmd = program
    .command("collaborators")
    .description("View collaborators (read-only)")
    .option("-p, --project <id>", "Project ID");

  cmd
    .command("list")
    .description("List collaborators")
    .option("--limit <n>", "Limit results", parseInt)
    .option("--starting-after <id>", "Cursor for pagination")
    .option("--all", "Auto-follow pagination (max 20 pages)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new CollaboratorsApi(client);
        await outputList(opts, (p) => api.list(projectId, p));
      } catch (e) {
        outputError(e);
      }
    });
}
