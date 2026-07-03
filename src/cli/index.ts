import { Command } from "commander";
import { loadConfig } from "../utils/config.ts";
import { RevenueCatClient } from "../client/base.ts";
import { setCompactOutput } from "./formatter.ts";
import { registerProjectsCommand } from "./commands/projects.cmd.ts";
import { registerAppsCommand } from "./commands/apps.cmd.ts";
import { registerChartsCommand } from "./commands/charts.cmd.ts";
import { registerCustomersCommand } from "./commands/customers.cmd.ts";
import { registerEntitlementsCommand } from "./commands/entitlements.cmd.ts";
import { registerOfferingsCommand } from "./commands/offerings.cmd.ts";
import { registerPackagesCommand } from "./commands/packages.cmd.ts";
import { registerProductsCommand } from "./commands/products.cmd.ts";
import { registerSubscriptionsCommand } from "./commands/subscriptions.cmd.ts";
import { registerPurchasesCommand } from "./commands/purchases.cmd.ts";
import { registerInvoicesCommand } from "./commands/invoices.cmd.ts";
import { registerAuditLogsCommand } from "./commands/audit-logs.cmd.ts";
import { registerCollaboratorsCommand } from "./commands/collaborators.cmd.ts";
import { registerVirtualCurrenciesCommand } from "./commands/virtual-currencies.cmd.ts";
import { registerWebhooksCommand } from "./commands/webhooks.cmd.ts";
import { registerPaywallsCommand } from "./commands/paywalls.cmd.ts";

export function createProgram(): Command {
  const program = new Command();

  program
    .name("revcat")
    .description("RevenueCat CLI for AI agents - analytics, MRR tracking, and subscription management")
    .version("0.1.0")
    .option("--api-key <key>", "RevenueCat API v2 secret key")
    .option("--compact", "Output single-line JSON instead of pretty-printed")
    .hook("preAction", (thisCommand) => {
      const opts = thisCommand.opts();
      setCompactOutput(Boolean(opts.compact));
      const config = loadConfig({ apiKey: opts.apiKey });
      const client = new RevenueCatClient({ apiKey: config.apiKey });
      // Store on the program for subcommands to access
      thisCommand.setOptionValue("_client", client);
      thisCommand.setOptionValue("_projectId", config.projectId);
    });

  registerProjectsCommand(program);
  registerAppsCommand(program);
  registerChartsCommand(program);
  registerCustomersCommand(program);
  registerEntitlementsCommand(program);
  registerOfferingsCommand(program);
  registerPackagesCommand(program);
  registerProductsCommand(program);
  registerSubscriptionsCommand(program);
  registerPurchasesCommand(program);
  registerInvoicesCommand(program);
  registerAuditLogsCommand(program);
  registerCollaboratorsCommand(program);
  registerVirtualCurrenciesCommand(program);
  registerWebhooksCommand(program);
  registerPaywallsCommand(program);

  return program;
}

export function getClient(cmd: Command): RevenueCatClient {
  return cmd.optsWithGlobals()._client;
}

export function getProjectId(cmd: Command): string {
  const opts = cmd.optsWithGlobals();
  const projectId = opts.project || opts._projectId;
  if (!projectId) {
    console.error(
      JSON.stringify({
        error: "MissingProjectId",
        message: "Project ID required. Use --project flag or set REVENUECAT_PROJECT_ID env var.",
      }, null, 2)
    );
    process.exit(1);
  }
  return projectId;
}
