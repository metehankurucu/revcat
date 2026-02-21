import { Command } from "commander";
import { WebhooksApi } from "../../api/webhooks.ts";
import { getClient, getProjectId } from "../index.ts";
import { output, outputError } from "../formatter.ts";

export function registerWebhooksCommand(program: Command): void {
  const cmd = program
    .command("webhooks")
    .description("Manage webhooks")
    .option("-p, --project <id>", "Project ID");

  cmd
    .command("list")
    .description("List webhook integrations")
    .option("--limit <n>", "Limit results", parseInt)
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const api = new WebhooksApi(client);
        output(await api.list(projectId, this.opts()));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("get")
    .description("Get a webhook integration")
    .requiredOption("--webhook <id>", "Webhook integration ID")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const api = new WebhooksApi(client);
        output(await api.get(projectId, this.opts().webhook));
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("create")
    .description("Create a webhook integration")
    .requiredOption("--url <url>", "Webhook URL")
    .option("--name <name>", "Webhook name")
    .option("--auth-header <header>", "Authorization header value")
    .option("--environment <env>", "Environment: production, sandbox, or all")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new WebhooksApi(client);
        output(
          await api.create(projectId, {
            url: opts.url,
            name: opts.name,
            authorization_header: opts.authHeader,
            environment: opts.environment,
          })
        );
      } catch (e) {
        outputError(e);
      }
    });

  cmd
    .command("update")
    .description("Update a webhook integration")
    .requiredOption("--webhook <id>", "Webhook integration ID")
    .option("--url <url>", "New webhook URL")
    .option("--name <name>", "New name")
    .option("--auth-header <header>", "New authorization header")
    .option("--environment <env>", "New environment")
    .action(async function (this: Command) {
      try {
        const client = getClient(this);
        const projectId = getProjectId(this);
        const opts = this.opts();
        const api = new WebhooksApi(client);
        output(
          await api.update(projectId, opts.webhook, {
            url: opts.url,
            name: opts.name,
            authorization_header: opts.authHeader,
            environment: opts.environment,
          })
        );
      } catch (e) {
        outputError(e);
      }
    });
}
