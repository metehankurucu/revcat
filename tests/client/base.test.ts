import { describe, it, expect, beforeEach, afterEach, mock, spyOn } from "bun:test";
import { RevenueCatClient } from "../../src/client/base.ts";
import {
  BlockedOperationError,
  RevenueCatApiError,
} from "../../src/client/errors.ts";

let originalFetch: typeof globalThis.fetch;

function mockFetch(opts: {
  status?: number;
  body?: unknown;
  headers?: Record<string, string>;
  contentType?: string;
  text?: string;
}) {
  const {
    status = 200,
    body,
    headers = {},
    contentType = "application/json",
    text,
  } = opts;

  const responseHeaders = new Headers({
    "content-type": contentType,
    ...headers,
  });

  const fn = mock(async (_url: string | URL | Request, _init?: RequestInit) => {
    const responseBody = text ?? (body !== undefined ? JSON.stringify(body) : "{}");
    return new Response(responseBody, {
      status,
      statusText: status >= 400 ? "Error" : "OK",
      headers: responseHeaders,
    });
  });

  globalThis.fetch = fn as unknown as typeof globalThis.fetch;
  return fn;
}

function getLastFetchCall(fn: ReturnType<typeof mock>): {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
} {
  const lastCall = fn.mock.calls[fn.mock.calls.length - 1] as [string, RequestInit];
  return {
    url: lastCall[0],
    method: lastCall[1]?.method || "GET",
    headers: Object.fromEntries(
      Object.entries(lastCall[1]?.headers || {})
    ),
    body: lastCall[1]?.body ? JSON.parse(lastCall[1].body as string) : undefined,
  };
}

describe("RevenueCatClient", () => {
  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  // ─── Authentication ───

  describe("authentication", () => {
    it("should send Bearer token in Authorization header", async () => {
      const fn = mockFetch({ body: { object: "list", items: [] } });
      const client = new RevenueCatClient({ apiKey: "sk_test_abc123" });

      await client.request("list-projects", {});

      const call = getLastFetchCall(fn);
      expect(call.headers.Authorization).toBe("Bearer sk_test_abc123");
    });

    it("should use the provided API key", async () => {
      const fn = mockFetch({ body: {} });
      const client = new RevenueCatClient({ apiKey: "sk_my_secret_key" });

      await client.request("list-projects", {});

      const call = getLastFetchCall(fn);
      expect(call.headers.Authorization).toBe("Bearer sk_my_secret_key");
    });
  });

  // ─── URL Building ───

  describe("URL building", () => {
    it("should build correct base URL", async () => {
      const fn = mockFetch({ body: {} });
      const client = new RevenueCatClient({ apiKey: "sk_test" });

      await client.request("list-projects", {});

      const call = getLastFetchCall(fn);
      expect(call.url).toBe("https://api.revenuecat.com/v2/projects");
    });

    it("should interpolate path parameters", async () => {
      const fn = mockFetch({ body: {} });
      const client = new RevenueCatClient({ apiKey: "sk_test" });

      await client.request("list-apps", { project_id: "proj_abc" });

      const call = getLastFetchCall(fn);
      expect(call.url).toBe("https://api.revenuecat.com/v2/projects/proj_abc/apps");
    });

    it("should interpolate multiple path parameters", async () => {
      const fn = mockFetch({ body: {} });
      const client = new RevenueCatClient({ apiKey: "sk_test" });

      await client.request("get-app", {
        project_id: "proj_abc",
        app_id: "app_xyz",
      });

      const call = getLastFetchCall(fn);
      expect(call.url).toBe(
        "https://api.revenuecat.com/v2/projects/proj_abc/apps/app_xyz"
      );
    });

    it("should URL-encode path parameters with special characters", async () => {
      const fn = mockFetch({ body: {} });
      const client = new RevenueCatClient({ apiKey: "sk_test" });

      await client.request("get-customer", {
        project_id: "proj_1",
        customer_id: "user@email.com",
      });

      const call = getLastFetchCall(fn);
      expect(call.url).toContain("user%40email.com");
    });

    it("should append query parameters", async () => {
      const fn = mockFetch({ body: {} });
      const client = new RevenueCatClient({ apiKey: "sk_test" });

      await client.request("list-customers", { project_id: "proj_1" }, {
        query: { limit: 50, starting_after: "cust_123" },
      });

      const call = getLastFetchCall(fn);
      const url = new URL(call.url);
      expect(url.searchParams.get("limit")).toBe("50");
      expect(url.searchParams.get("starting_after")).toBe("cust_123");
    });

    it("should skip null and undefined query parameters", async () => {
      const fn = mockFetch({ body: {} });
      const client = new RevenueCatClient({ apiKey: "sk_test" });

      await client.request("list-customers", { project_id: "proj_1" }, {
        query: { limit: 20, starting_after: undefined, filter: null },
      });

      const call = getLastFetchCall(fn);
      const url = new URL(call.url);
      expect(url.searchParams.get("limit")).toBe("20");
      expect(url.searchParams.has("starting_after")).toBe(false);
      expect(url.searchParams.has("filter")).toBe(false);
    });

    it("should handle deeply nested path like charts", async () => {
      const fn = mockFetch({ body: {} });
      const client = new RevenueCatClient({ apiKey: "sk_test" });

      await client.request("get-chart-data", {
        project_id: "proj_1",
        chart_name: "mrr",
      });

      const call = getLastFetchCall(fn);
      expect(call.url).toContain("/projects/proj_1/charts/mrr");
    });
  });

  // ─── HTTP Methods ───

  describe("HTTP methods", () => {
    it("should use GET for read operations", async () => {
      const fn = mockFetch({ body: {} });
      const client = new RevenueCatClient({ apiKey: "sk_test" });

      await client.request("list-projects", {});

      const call = getLastFetchCall(fn);
      expect(call.method).toBe("GET");
    });

    it("should use POST for write operations", async () => {
      const fn = mockFetch({ body: {} });
      const client = new RevenueCatClient({ apiKey: "sk_test" });

      await client.request(
        "create-offering",
        { project_id: "proj_1" },
        { body: { lookup_key: "premium", display_name: "Premium" } }
      );

      const call = getLastFetchCall(fn);
      expect(call.method).toBe("POST");
    });

    it("should send Content-Type header for POST with body", async () => {
      const fn = mockFetch({ body: {} });
      const client = new RevenueCatClient({ apiKey: "sk_test" });

      await client.request(
        "create-offering",
        { project_id: "proj_1" },
        { body: { lookup_key: "test" } }
      );

      const call = getLastFetchCall(fn);
      expect(call.headers["Content-Type"]).toBe("application/json");
    });

    it("should NOT send Content-Type header for GET requests", async () => {
      const fn = mockFetch({ body: {} });
      const client = new RevenueCatClient({ apiKey: "sk_test" });

      await client.request("list-projects", {});

      const call = getLastFetchCall(fn);
      expect(call.headers["Content-Type"]).toBeUndefined();
    });

    it("should serialize body as JSON", async () => {
      const fn = mockFetch({ body: {} });
      const client = new RevenueCatClient({ apiKey: "sk_test" });

      const payload = {
        lookup_key: "premium",
        display_name: "Premium Plan",
        is_current: true,
      };
      await client.request(
        "create-offering",
        { project_id: "proj_1" },
        { body: payload }
      );

      const call = getLastFetchCall(fn);
      expect(call.body).toEqual(payload);
    });
  });

  // ─── Response Handling ───

  describe("response handling", () => {
    it("should parse JSON response", async () => {
      const data = { object: "list", items: [{ id: "proj_1" }] };
      mockFetch({ body: data });
      const client = new RevenueCatClient({ apiKey: "sk_test" });

      const result = await client.request("list-projects", {});
      expect(result).toEqual(data);
    });

    it("should handle non-JSON response as text", async () => {
      mockFetch({ text: "raw file content", contentType: "application/pdf" });
      const client = new RevenueCatClient({ apiKey: "sk_test" });

      const result = await client.request("get-invoice-file", {
        project_id: "proj_1",
        customer_id: "cust_1",
        invoice_id: "inv_1",
      });
      expect(result).toBe("raw file content");
    });
  });

  // ─── Error Handling ───

  describe("error handling", () => {
    it("should throw BlockedOperationError for unknown operations", async () => {
      const client = new RevenueCatClient({ apiKey: "sk_test" });

      await expect(
        client.request("delete-app", { project_id: "proj_1", app_id: "app_1" })
      ).rejects.toThrow(BlockedOperationError);
    });

    it("should throw BlockedOperationError without making HTTP request", async () => {
      const fn = mockFetch({ body: {} });
      const client = new RevenueCatClient({ apiKey: "sk_test" });

      try {
        await client.request("delete-customer", {
          project_id: "proj_1",
          customer_id: "cust_1",
        });
      } catch {
        // expected
      }

      expect(fn.mock.calls.length).toBe(0);
    });

    // After C2, a 429 is retried; with retries disabled it surfaces as the R1
    // RevenueCatApiError envelope carrying retryable:true (see retry.test.ts for
    // the full retry/backoff behavior).
    it("should throw RevenueCatApiError with retryable on 429 (retries disabled)", async () => {
      mockFetch({
        status: 429,
        body: { object: "error", type: "rate_limit_error", message: "Rate limited", retryable: true },
        headers: { "Retry-After": "30" },
      });
      const client = new RevenueCatClient({ apiKey: "sk_test", maxRetries: 0 });

      try {
        await client.request("list-projects", {});
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(RevenueCatApiError);
        const err = e as RevenueCatApiError;
        expect(err.statusCode).toBe(429);
        expect(err.retryable).toBe(true);
      }
    });

    it("should synthesize retryable:true for a bare 429 body (retries disabled)", async () => {
      mockFetch({ status: 429, body: {} });
      const client = new RevenueCatClient({ apiKey: "sk_test", maxRetries: 0 });

      try {
        await client.request("list-projects", {});
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(RevenueCatApiError);
        expect((e as RevenueCatApiError).retryable).toBe(true);
      }
    });

    it("should throw RevenueCatApiError on 400 response (v2 schema)", async () => {
      mockFetch({
        status: 400,
        body: {
          object: "error",
          type: "parameter_error",
          param: "limit",
          doc_url: "https://errors.rev.cat/parameter-error",
          message: "Invalid parameter",
          retryable: false,
        },
      });
      const client = new RevenueCatClient({ apiKey: "sk_test" });

      try {
        await client.request("list-projects", {});
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(RevenueCatApiError);
        const err = e as RevenueCatApiError;
        expect(err.statusCode).toBe(400);
        expect(err.type).toBe("parameter_error");
        expect(err.param).toBe("limit");
        expect(err.apiError.message).toBe("Invalid parameter");
      }
    });

    it("should throw RevenueCatApiError on 401 (unauthorized)", async () => {
      mockFetch({
        status: 401,
        body: { code: 7101, message: "Unauthenticated" },
      });
      const client = new RevenueCatClient({ apiKey: "sk_bad_key" });

      await expect(
        client.request("list-projects", {})
      ).rejects.toThrow(RevenueCatApiError);
    });

    it("should throw RevenueCatApiError on 403 (forbidden)", async () => {
      mockFetch({
        status: 403,
        body: { code: 7102, message: "Insufficient permissions" },
      });
      const client = new RevenueCatClient({ apiKey: "sk_test" });

      try {
        await client.request("get-overview-metrics", { project_id: "proj_1" });
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(RevenueCatApiError);
        expect((e as RevenueCatApiError).statusCode).toBe(403);
      }
    });

    it("should throw RevenueCatApiError on 404", async () => {
      mockFetch({
        status: 404,
        body: { code: 7240, message: "Resource not found" },
      });
      const client = new RevenueCatClient({ apiKey: "sk_test" });

      await expect(
        client.request("get-customer", {
          project_id: "proj_1",
          customer_id: "nonexistent",
        })
      ).rejects.toThrow(RevenueCatApiError);
    });

    it("should throw RevenueCatApiError on 500 (retries disabled)", async () => {
      mockFetch({
        status: 500,
        body: { object: "error", type: "server_error", message: "Internal server error", retryable: false },
      });
      // maxRetries:0 isolates the terminal-error assertion from C2 retry behavior.
      const client = new RevenueCatClient({ apiKey: "sk_test", maxRetries: 0 });

      await expect(
        client.request("list-projects", {})
      ).rejects.toThrow(RevenueCatApiError);
    });

    it("should handle non-JSON error response (retries disabled)", async () => {
      mockFetch({
        status: 502,
        text: "Bad Gateway",
        contentType: "text/html",
      });
      const client = new RevenueCatClient({ apiKey: "sk_test", maxRetries: 0 });

      try {
        await client.request("list-projects", {});
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(RevenueCatApiError);
        const err = e as RevenueCatApiError;
        expect(err.statusCode).toBe(502);
      }
    });
  });

  // ─── Rate Limit Headers ───

  describe("rate limit header handling", () => {
    it("should read rate limit headers from response", async () => {
      mockFetch({
        body: { object: "list", items: [] },
        headers: {
          "RevenueCat-Rate-Limit-Current-Usage": "3",
          "RevenueCat-Rate-Limit-Current-Limit": "60",
        },
      });
      const client = new RevenueCatClient({ apiKey: "sk_test" });

      // Should not throw - just updates internal state
      const result = await client.request("list-projects", {});
      expect(result).toBeDefined();
    });

    it("should function without rate limit headers", async () => {
      mockFetch({ body: { object: "list", items: [] } });
      const client = new RevenueCatClient({ apiKey: "sk_test" });

      const result = await client.request("list-projects", {});
      expect(result).toBeDefined();
    });
  });

  // ─── Multiple requests ───

  describe("sequential requests", () => {
    it("should handle multiple sequential requests", async () => {
      let callCount = 0;
      const fn = mock(async () => {
        callCount++;
        return new Response(
          JSON.stringify({ call: callCount }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          }
        );
      });
      globalThis.fetch = fn as unknown as typeof globalThis.fetch;

      const client = new RevenueCatClient({ apiKey: "sk_test" });

      const r1 = await client.request("list-projects", {});
      const r2 = await client.request("list-projects", {});
      const r3 = await client.request("list-projects", {});

      expect(r1).toEqual({ call: 1 });
      expect(r2).toEqual({ call: 2 });
      expect(r3).toEqual({ call: 3 });
      expect(fn.mock.calls.length).toBe(3);
    });
  });
});
