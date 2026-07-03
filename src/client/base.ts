import {
  ALLOWED_OPERATIONS,
  type AllowedOperation,
} from "../security/allowed-operations.ts";
import { RateLimiter } from "./rate-limiter.ts";
import {
  BlockedOperationError,
  RateLimitError,
  RevenueCatApiError,
  type RevenueCatApiErrorBody,
} from "./errors.ts";

export interface RequestOptions {
  query?: Record<string, unknown>;
  body?: unknown;
}

export interface RevenueCatClientConfig {
  apiKey: string;
  /** Max automatic retries for retryable failures (429 / retryable 5xx). Default 2. */
  maxRetries?: number;
  /** Injectable sleep for deterministic tests. Defaults to real setTimeout. */
  sleep?: (ms: number) => Promise<void>;
}

export class RevenueCatClient {
  private apiKey: string;
  private baseUrl = "https://api.revenuecat.com/v2";
  private rateLimiter = new RateLimiter();
  private maxRetries: number;
  private sleep: (ms: number) => Promise<void>;

  constructor(config: RevenueCatClientConfig) {
    this.apiKey = config.apiKey;
    this.maxRetries = config.maxRetries ?? 2;
    this.sleep = config.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
  }

  async request<T>(
    operationId: string,
    pathParams: Record<string, string>,
    options?: RequestOptions
  ): Promise<T> {
    const operation = ALLOWED_OPERATIONS.get(operationId);
    if (!operation) {
      throw new BlockedOperationError(operationId);
    }

    await this.rateLimiter.acquire(operation.domain);

    const url = this.buildUrl(operation, pathParams, options?.query);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
    };

    if (options?.body) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      method: operation.method,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    this.updateRateLimitFromHeaders(operation.domain, response);

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      throw new RateLimitError(
        operation.domain,
        retryAfter ? parseInt(retryAfter, 10) : 60
      );
    }

    if (!response.ok) {
      throw new RevenueCatApiError(response.status, await this.parseErrorBody(response));
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return (await response.json()) as T;
    }

    // For non-JSON responses (e.g., invoice file download)
    return (await response.text()) as unknown as T;
  }

  /**
   * Parses an error response body into the v2 `Error` shape, tolerating
   * non-JSON / malformed bodies by falling back to the HTTP status text.
   */
  private async parseErrorBody(response: Response): Promise<RevenueCatApiErrorBody> {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = undefined;
    }
    const fallbackMessage = response.statusText || `HTTP ${response.status}`;
    if (body && typeof body === "object") {
      const b = body as Partial<RevenueCatApiErrorBody>;
      return {
        ...b,
        message: typeof b.message === "string" && b.message.length > 0 ? b.message : fallbackMessage,
      };
    }
    return { message: fallbackMessage };
  }

  private buildUrl(
    operation: AllowedOperation,
    pathParams: Record<string, string>,
    query?: Record<string, unknown>
  ): string {
    let path = operation.path;
    for (const [key, value] of Object.entries(pathParams)) {
      path = path.replace(`{${key}}`, encodeURIComponent(value));
    }

    const url = new URL(`${this.baseUrl}${path}`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  private updateRateLimitFromHeaders(
    domain: string,
    response: Response
  ): void {
    const usage = response.headers.get("RevenueCat-Rate-Limit-Current-Usage");
    const limit = response.headers.get("RevenueCat-Rate-Limit-Current-Limit");
    if (usage && limit) {
      this.rateLimiter.updateFromHeaders(
        domain,
        parseInt(usage, 10),
        parseInt(limit, 10)
      );
    }
  }
}
