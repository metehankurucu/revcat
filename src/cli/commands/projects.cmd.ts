import { Command } from "commander";
import { ProjectsApi } from "../../api/projects.ts";
import { getClient } from "../index.ts";
import { output, outputError } from "../formatter.ts";

export function registerProjectsCommand(program: Command): void {
  const cmd = program.command("projects").description("Manage projects");

  cmd
    .command("list")
    .description("List all projects")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const api = new ProjectsApi(client);
        output(await api.list());
      } catch (e) {
        outputError(e);
      }
    });
}
