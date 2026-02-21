import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { ConfigError } from "../client/errors.ts";

export interface RevCatConfig {
  apiKey: string;
  projectId?: string;
}

export function loadConfig(overrides?: {
  apiKey?: string;
  projectId?: string;
}): RevCatConfig {
  const apiKey =
    overrides?.apiKey ||
    process.env.REVENUECAT_API_KEY ||
    loadFromFile()?.apiKey;

  if (!apiKey) {
    throw new ConfigError(
      "No API key found. Set REVENUECAT_API_KEY environment variable, " +
        "use --api-key flag, or create ~/.config/revcat/config.json"
    );
  }

  const projectId =
    overrides?.projectId ||
    process.env.REVENUECAT_PROJECT_ID ||
    loadFromFile()?.projectId;

  return { apiKey, projectId };
}

function loadFromFile(): { apiKey?: string; projectId?: string } | null {
  const configPath = join(homedir(), ".config", "revcat", "config.json");
  if (!existsSync(configPath)) return null;
  try {
    return JSON.parse(readFileSync(configPath, "utf-8"));
  } catch {
    return null;
  }
}
