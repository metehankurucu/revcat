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

/**
 * The RevenueCat v2 error object as defined in the OpenAPI spec (`Error` schema).
 * There is no `code` field in v2; the machine-actionable fields are
 * `type`, `param`, `doc_url`, `retryable` and `backoff_ms`.
 */
export interface RevenueCatApiErrorBody {
  object?: string;
  type?: string;
  param?: string | null;
  doc_url?: string;
  message: string;
  retryable?: boolean;
  backoff_ms?: number | null;
}

export class RevenueCatApiError extends RevenueCatError {
  readonly statusCode: number;
  readonly apiError: RevenueCatApiErrorBody;
  readonly type?: string;
  readonly param?: string | null;
  readonly docUrl?: string;
  readonly retryable: boolean;
  readonly backoffMs?: number;

  constructor(statusCode: number, apiError: RevenueCatApiErrorBody) {
    super(
      `API Error ${statusCode}${apiError.type ? ` (${apiError.type})` : ""}: ${apiError.message}`
    );
    this.name = "RevenueCatApiError";
    this.statusCode = statusCode;
    this.apiError = apiError;
    this.type = apiError.type;
    this.param = apiError.param ?? undefined;
    this.docUrl = apiError.doc_url;
    this.retryable = apiError.retryable ?? false;
    this.backoffMs = apiError.backoff_ms ?? undefined;
  }
}

export class ConfigError extends RevenueCatError {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

/**
 * Raised when `--chart` is not one of the spec-derived canonical chart names
 * and `--unsafe-chart` was not passed. Carries machine-actionable did-you-mean
 * suggestions and the full valid set so an agent can self-correct.
 */
export class InvalidChartError extends RevenueCatError {
  readonly chart: string;
  readonly suggestions: string[];
  readonly validCharts: readonly string[];

  constructor(chart: string, suggestions: string[], validCharts: readonly string[]) {
    const hint = suggestions.length > 0 ? ` Did you mean: ${suggestions.join(", ")}?` : "";
    super(
      `Unknown chart "${chart}".${hint} Run "revcat charts options" for a valid chart, ` +
        `see the docs for the full list, or pass --unsafe-chart to bypass validation.`
    );
    this.name = "InvalidChartError";
    this.chart = chart;
    this.suggestions = suggestions;
    this.validCharts = validCharts;
  }
}
