export class RevenueCatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RevenueCatError";
  }
}

export class BlockedOperationError extends RevenueCatError {
  constructor(operationId: string) {
    super(
      `Operation "${operationId}" is blocked. This tool only exposes safe operations.`
    );
    this.name = "BlockedOperationError";
  }
}

export class RateLimitError extends RevenueCatError {
  readonly domain: string;
  readonly retryAfterSeconds: number;

  constructor(domain: string, retryAfterSeconds: number) {
    super(
      `Rate limited on ${domain}. Retry after ${retryAfterSeconds}s.`
    );
    this.name = "RateLimitError";
    this.domain = domain;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class RevenueCatApiError extends RevenueCatError {
  readonly statusCode: number;
  readonly apiError: { code: number; message: string; doc_url?: string };

  constructor(
    statusCode: number,
    apiError: { code: number; message: string; doc_url?: string }
  ) {
    super(`API Error ${statusCode}: ${apiError.message}`);
    this.name = "RevenueCatApiError";
    this.statusCode = statusCode;
    this.apiError = apiError;
  }
}

export class ConfigError extends RevenueCatError {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}
