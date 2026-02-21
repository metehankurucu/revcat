import { Command } from "commander";
import { AppsApi } from "../../api/apps.ts";
import { getClient, getProjectId } from "../index.ts";
import { output, outputError } from "../formatter.ts";

export function registerAppsCommand(program: Command): void {
  const cmd = program
    .command("apps")
    .description("Manage apps")
    .option("-p, --project <id>", "Project ID");

  cmd
    .command("list")
    .description("List all apps")
    .option("--limit <n>", "Limit results", parseInt)
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const api = new AppsApi(client);
        output(await api.list(projectId, this.opts()));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("get")
    .description("Get an app")
    .requiredOption("--app <id>", "App ID")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const api = new AppsApi(client);
        output(await api.get(projectId, this.opts().app));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("keys")
    .description("List public API keys for an app")
    .requiredOption("--app <id>", "App ID")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const api = new AppsApi(client);
        output(await api.listPublicApiKeys(projectId, this.opts().app));
      } catch (e) {
        outputError(e);
      }
    });
}
