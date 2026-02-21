import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { loadConfig } from "../../src/utils/config.ts";
import { ConfigError } from "../../src/client/errors.ts";

describe("loadConfig", () => {
  let originalApiKey: string | undefined;
  let originalProjectId: string | undefined;

  beforeEach(() => {
    originalApiKey = process.env.REVENUECAT_API_KEY;
    originalProjectId = process.env.REVENUECAT_PROJECT_ID;
  });

  afterEach(() => {
    if (originalApiKey !== undefined) {
      process.env.REVENUECAT_API_KEY = originalApiKey;
    } else {
      delete process.env.REVENUECAT_API_KEY;
    }
    if (originalProjectId !== undefined) {
      process.env.REVENUECAT_PROJECT_ID = originalProjectId;
    } else {
      delete process.env.REVENUECAT_PROJECT_ID;
    }
  });

  it("should use override API key first (highest priority)", () => {
    process.env.REVENUECAT_API_KEY = "sk_env_key";
    const config = loadConfig({ apiKey: "sk_override_key" });

    expect(config.apiKey).toBe("sk_override_key");
  });

  it("should use environment variable when no override", () => {
    process.env.REVENUECAT_API_KEY = "sk_env_key";
    const config = loadConfig({});

    expect(config.apiKey).toBe("sk_env_key");
  });

  it("should use environment variable without overrides argument", () => {
    process.env.REVENUECAT_API_KEY = "sk_env_key";
    const config = loadConfig();

    expect(config.apiKey).toBe("sk_env_key");
  });

  it("should throw ConfigError when no API key found", () => {
    delete process.env.REVENUECAT_API_KEY;

    expect(() => loadConfig({})).toThrow(ConfigError);
  });

  it("should include helpful error message when no API key", () => {
    delete process.env.REVENUECAT_API_KEY;

    try {
      loadConfig({});
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(ConfigError);
      expect((e as Error).message).toContain("REVENUECAT_API_KEY");
      expect((e as Error).message).toContain("--api-key");
      expect((e as Error).message).toContain("config.json");
    }
  });

  it("should load project ID from override", () => {
    process.env.REVENUECAT_API_KEY = "sk_test";
    process.env.REVENUECAT_PROJECT_ID = "proj_env";
    const config = loadConfig({ projectId: "proj_override" });

    expect(config.projectId).toBe("proj_override");
  });

  it("should load project ID from env var", () => {
    process.env.REVENUECAT_API_KEY = "sk_test";
    process.env.REVENUECAT_PROJECT_ID = "proj_env";
    const config = loadConfig({});

    expect(config.projectId).toBe("proj_env");
  });

  it("should return undefined projectId when not set", () => {
    process.env.REVENUECAT_API_KEY = "sk_test";
    delete process.env.REVENUECAT_PROJECT_ID;
    const config = loadConfig({});

    expect(config.projectId).toBeUndefined();
  });
});
