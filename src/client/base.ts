import {
  ALLOWED_OPERATIONS,
  type AllowedOperation,
} from "../security/allowed-operations.ts";
import { RateLimiter } from "./rate-limiter.ts";
import {
  BlockedOperationError,
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

    const url = this.buildUrl(operation, pathParams, options?.query);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
    };

    if (options?.body) {
      headers["Content-Type"] = "application/json";
    }

    const body = options?.body ? JSON.stringify(options.body) : undefined;

    let attempt = 0;
    // Retry loop: honors the proactive per-domain limiter on every attempt and
    // reactively retries 429 / retryable 5xx up to maxRetries (R3).
    while (true) {
      await this.rateLimiter.acquire(operation.domain);

      const response = await fetch(url, { method: operation.method, headers, body });

      this.updateRateLimitFromHeaders(operation.domain, response);

      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          return (await response.json()) as T;
        }
        // For non-JSON responses (e.g., invoice file download)
        return (await response.text()) as unknown as T;
      }

      const errorBody = await this.parseErrorBody(response);

      if (this.isRetryable(response.status, errorBody) && attempt < this.maxRetries) {
        const delayMs = this.retryDelayMs(response, errorBody, attempt);
        attempt++;
        this.logRetryNotice({
          attempt,
          max_retries: this.maxRetries,
          delay_ms: delayMs,
          status: response.status,
          domain: operation.domain,
          type: errorBody.type,
        });
        await this.sleep(delayMs);
        continue;
      }

      // A 429 is retryable by definition even if the body omits the flag; make the
      // envelope say so, so the agent knows it may retry after backing off.
      if (response.status === 429 && errorBody.retryable === undefined) {
        errorBody.retryable = true;
      }
      throw new RevenueCatApiError(response.status, errorBody);
    }
  }

  private isRetryable(status: number, body: RevenueCatApiErrorBody): boolean {
    if (typeof body.retryable === "boolean") return body.retryable;
    return status === 429 || (status >= 500 && status <= 599);
  }

  /**
   * Retry delay precedence: body `backoff_ms`, then `Retry-After` header
   * (seconds), then capped exponential backoff (500ms * 2^attempt, max 8s).
   */
  private retryDelayMs(
    response: Response,
    body: RevenueCatApiErrorBody,
    attempt: number
  ): number {
    if (typeof body.backoff_ms === "number" && body.backoff_ms > 0) {
      return body.backoff_ms;
    }
    const retryAfter = response.headers.get("Retry-After");
    if (retryAfter) {
      const seconds = Number(retryAfter);
      if (Number.isFinite(seconds) && seconds >= 0) {
        return seconds * 1000;
      }
    }
    return Math.min(500 * 2 ** attempt, 8000);
  }

  private logRetryNotice(notice: {
    attempt: number;
    max_retries: number;
    delay_ms: number;
    status: number;
    domain: string;
    type?: string;
  }): void {
    console.error(JSON.stringify({ retry: notice }));
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
