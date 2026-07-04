import { Command } from "commander";
import { ProjectsApi } from "../../api/projects.ts";
import { getClient } from "../index.ts";
import { outputError } from "../formatter.ts";
import { outputList } from "../paginate.ts";

export function registerProjectsCommand(program: Command): void {
  const cmd = program.command("projects").description("Manage projects");

  cmd
    .command("list")
    .description("List all projects")
    .option("--limit <n>", "Limit results", parseInt)
    .option("--starting-after <id>", "Cursor for pagination")
    .option("--all", "Auto-follow pagination (max 20 pages)")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const opts = this.opts();
        const api = new ProjectsApi(client);
        await outputList(opts, (p) => api.list(p));
      } catch (e) {
        outputError(e);
      }
    });
}
