import { describe, it, expect, beforeEach, afterEach } from "bun:test";

async function runCli(...args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn(["bun", "run", "bin/revcat.ts", ...args], {
    cwd: process.cwd(),
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env },
  });

  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;

  return { stdout, stderr, exitCode };
}

async function runCliWithEnv(args: string[], env: Record<string, string | undefined>): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn(["bun", "run", "bin/revcat.ts", ...args], {
    cwd: process.cwd(),
    stdout: "pipe",
    stderr: "pipe",
    env: { PATH: process.env.PATH, HOME: process.env.HOME, ...env },
  });

  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  const exitCode = await proc.exited;

  return { stdout, stderr, exitCode };
}

describe("CLI: Basic", () => {
  it("should show help", async () => {
    const { stdout } = await runCli("--help");
    expect(stdout).toContain("RevenueCat CLI for AI agents");
    expect(stdout).toContain("charts");
    expect(stdout).toContain("customers");
    expect(stdout).toContain("offerings");
    expect(stdout).toContain("subscriptions");
    expect(stdout).toContain("products");
  });

  it("should show version", async () => {
    const { stdout } = await runCli("--version");
    expect(stdout.trim()).toBe("0.1.0");
  });

  it("should show charts subcommand help", async () => {
    const { stdout } = await runCli("charts", "--help");
    expect(stdout).toContain("overview");
    expect(stdout).toContain("data");
    expect(stdout).toContain("options");
    expect(stdout).toContain("rate limit: 5 req/min");
  });

  it("should show customers subcommand help", async () => {
    const { stdout } = await runCli("customers", "--help");
    expect(stdout).toContain("list");
    expect(stdout).toContain("get");
    expect(stdout).toContain("entitlements");
    expect(stdout).toContain("attributes");
    expect(stdout).toContain("set-attributes");
    expect(stdout).toContain("subscriptions");
    expect(stdout).toContain("purchases");
    expect(stdout).toContain("assign-offering");
  });

  it("should show entitlements subcommand help", async () => {
    const { stdout } = await runCli("entitlements", "--help");
    expect(stdout).toContain("list");
    expect(stdout).toContain("get");
    expect(stdout).toContain("create");
    expect(stdout).toContain("update");
    expect(stdout).toContain("attach-products");
    expect(stdout).toContain("detach-products");
  });

  it("should show offerings subcommand help", async () => {
    const { stdout } = await runCli("offerings", "--help");
    expect(stdout).toContain("list");
    expect(stdout).toContain("get");
    expect(stdout).toContain("create");
    expect(stdout).toContain("update");
  });

  it("should show packages subcommand help", async () => {
    const { stdout } = await runCli("packages", "--help");
    expect(stdout).toContain("list");
    expect(stdout).toContain("get");
    expect(stdout).toContain("create");
    expect(stdout).toContain("update");
    expect(stdout).toContain("attach-products");
    expect(stdout).toContain("detach-products");
  });

  it("should show subscriptions subcommand help", async () => {
    const { stdout } = await runCli("subscriptions", "--help");
    expect(stdout).toContain("search");
    expect(stdout).toContain("get");
    expect(stdout).toContain("entitlements");
    expect(stdout).toContain("transactions");
    expect(stdout).toContain("management-url");
  });

  it("should show purchases subcommand help", async () => {
    const { stdout } = await runCli("purchases", "--help");
    expect(stdout).toContain("search");
    expect(stdout).toContain("get");
    expect(stdout).toContain("entitlements");
  });

  it("should show webhooks subcommand help", async () => {
    const { stdout } = await runCli("webhooks", "--help");
    expect(stdout).toContain("list");
    expect(stdout).toContain("get");
    expect(stdout).toContain("create");
    expect(stdout).toContain("update");
  });

  it("should show paywalls subcommand help", async () => {
    const { stdout } = await runCli("paywalls", "--help");
    expect(stdout).toContain("list");
    expect(stdout).toContain("get");
    expect(stdout).toContain("create");
  });

  it("should show all 16 resource commands", async () => {
    const { stdout } = await runCli("--help");
    const commands = [
      "projects", "apps", "charts", "customers",
      "entitlements", "offerings", "packages", "products",
      "subscriptions", "purchases", "invoices", "audit-logs",
      "collaborators", "virtual-currencies", "webhooks", "paywalls",
    ];
    for (const cmd of commands) {
      expect(stdout).toContain(cmd);
    }
  });
});

describe("CLI: Error handling", () => {
  it("should show error when no API key", async () => {
    const { stdout, stderr, exitCode } = await runCliWithEnv(
      ["projects", "list"],
      { HOME: "/tmp/nonexistent-home" }
    );

    const combined = stdout + stderr;
    expect(combined).toContain("REVENUECAT_API_KEY");
    expect(exitCode).not.toBe(0);
  });

  // R2: the missing-API-key failure (thrown from the preAction hook) must reach the
  // JSON envelope, not escape as a raw stack trace.
  it("should emit a parseable JSON envelope on stderr when no API key", async () => {
    const { stderr } = await runCliWithEnv(
      ["projects", "list"],
      { HOME: "/tmp/nonexistent-home" }
    );

    const trimmed = stderr.trim();
    expect(trimmed.length).toBeGreaterThan(0);
    // Must be valid JSON (no stack trace leakage).
    const parsed = JSON.parse(trimmed);
    expect(parsed).toHaveProperty("error");
    expect(parsed).toHaveProperty("message");
    expect(parsed.error).toBe("ConfigError");
    expect(String(parsed.message)).toContain("REVENUECAT_API_KEY");
  });

  // R2: a missing project id must also be a parseable JSON envelope.
  it("should emit a parseable JSON envelope on stderr when project id missing", async () => {
    const { stderr } = await runCliWithEnv(
      ["charts", "overview"],
      { REVENUECAT_API_KEY: "sk_test_key", HOME: "/tmp/nonexistent-home" }
    );

    const trimmed = stderr.trim();
    const parsed = JSON.parse(trimmed);
    expect(parsed.error).toBe("MissingProjectId");
    expect(String(parsed.message)).toContain("Project ID");
  });

  // R8 + envelope routing: the missing-project-id failure flows through the
  // shared error envelope, so --compact makes it single-line (not pretty).
  it("should emit a single-line MissingProjectId envelope under --compact", async () => {
    const { stderr } = await runCliWithEnv(
      ["charts", "overview", "--compact"],
      { REVENUECAT_API_KEY: "sk_test_key", HOME: "/tmp/nonexistent-home" }
    );

    const trimmed = stderr.trim();
    expect(trimmed).not.toContain("\n");
    const parsed = JSON.parse(trimmed);
    expect(parsed.error).toBe("MissingProjectId");
    expect(String(parsed.message)).toContain("Project ID");
  });

  it("should show error when project ID missing for charts", async () => {
    const { stdout, stderr, exitCode } = await runCliWithEnv(
      ["charts", "overview"],
      { REVENUECAT_API_KEY: "sk_test_key" }
    );

    const combined = stdout + stderr;
    expect(combined).toContain("Project ID");
    expect(exitCode).not.toBe(0);
  });
});

describe("CLI: charts data required options", () => {
  it("should require --chart flag for charts data", async () => {
    const { stderr, exitCode } = await runCliWithEnv(
      ["charts", "data", "--project", "proj_1"],
      { REVENUECAT_API_KEY: "sk_test" }
    );

    expect(stderr).toContain("--chart");
    expect(exitCode).not.toBe(0);
  });
});

describe("CLI: Read-only markers", () => {
  it("should mark products as read-only", async () => {
    const { stdout } = await runCli("products", "--help");
    expect(stdout).toContain("read-only");
  });

  it("should mark subscriptions as read-only", async () => {
    const { stdout } = await runCli("subscriptions", "--help");
    expect(stdout).toContain("read-only");
  });

  it("should mark purchases as read-only", async () => {
    const { stdout } = await runCli("purchases", "--help");
    expect(stdout).toContain("read-only");
  });

  it("should mark audit-logs as read-only", async () => {
    const { stdout } = await runCli("audit-logs", "--help");
    expect(stdout).toContain("read-only");
  });

  it("should mark invoices as read-only", async () => {
    const { stdout } = await runCli("invoices", "--help");
    expect(stdout).toContain("read-only");
  });

  it("should mark collaborators as read-only", async () => {
    const { stdout } = await runCli("collaborators", "--help");
    expect(stdout).toContain("read-only");
  });

  it("should mark virtual-currencies as read-only", async () => {
    const { stdout } = await runCli("virtual-currencies", "--help");
    expect(stdout).toContain("read-only");
  });
});

describe("CLI: No destructive commands exist", () => {
  it("should NOT have delete subcommand on any resource", async () => {
    const resources = [
      "apps", "customers", "entitlements", "offerings",
      "packages", "products", "webhooks", "paywalls", "virtual-currencies",
    ];

    for (const resource of resources) {
      const { stdout } = await runCli(resource, "--help");
      // Check that the word "delete" is not a subcommand
      // Note: "delete" might appear in descriptions, so check for "Delete" as command name
      const lines = stdout.split("\n").filter(l => l.trim().startsWith("delete"));
      expect(lines).toHaveLength(0);
    }
  });

  it("should NOT have refund subcommand on subscriptions or purchases", async () => {
    const { stdout: sub } = await runCli("subscriptions", "--help");
    const { stdout: purch } = await runCli("purchases", "--help");

    const subLines = sub.split("\n").filter(l => l.trim().startsWith("refund"));
    const purchLines = purch.split("\n").filter(l => l.trim().startsWith("refund"));
    expect(subLines).toHaveLength(0);
    expect(purchLines).toHaveLength(0);
  });

  it("should NOT have cancel subcommand on subscriptions", async () => {
    const { stdout } = await runCli("subscriptions", "--help");
    const lines = stdout.split("\n").filter(l => l.trim().startsWith("cancel"));
    expect(lines).toHaveLength(0);
  });

  it("should NOT have grant, revoke or transfer subcommands on customers", async () => {
    const { stdout } = await runCli("customers", "--help");
    const lines = stdout.split("\n").filter(l =>
      l.trim().startsWith("grant") ||
      l.trim().startsWith("revoke") ||
      l.trim().startsWith("transfer")
    );
    expect(lines).toHaveLength(0);
  });
});
