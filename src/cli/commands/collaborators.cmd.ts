import { Command } from "commander";
import { CollaboratorsApi } from "../../api/collaborators.ts";
import { getClient, getProjectId } from "../index.ts";
import { output, outputError } from "../formatter.ts";

export function registerCollaboratorsCommand(program: Command): void {
  const cmd = program
    .command("collaborators")
    .description("View collaborators (read-only)")
    .option("-p, --project <id>", "Project ID");

  cmd
    .command("list")
    .description("List collaborators")
    .option("--limit <n>", "Limit results", parseInt)
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const api = new CollaboratorsApi(client);
        output(await api.list(projectId, this.opts()));
      } catch (e) {
        outputError(e);
      }
    });
}
