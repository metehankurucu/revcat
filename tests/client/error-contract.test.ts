import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { RevenueCatClient } from "../../src/client/base.ts";
import { RevenueCatApiError } from "../../src/client/errors.ts";

// R1: Client error parsing must match the real RevenueCat v2 error schema
// (api-spec.yaml Error object): { object, type, param, doc_url, message, retryable, backoff_ms }.
// There is NO `code` field in the v2 schema.

let originalFetch: typeof globalThis.fetch;

function mockFetch(opts: {
  status?: number;
  body?: unknown;
  headers?: Record<string, string>;
  contentType?: string;
  text?: string;
}) {
  const { status = 200, body, headers = {}, contentType = "application/json", text } = opts;
  const responseHeaders = new Headers({ "content-type": contentType, ...headers });
  const fn = mock(async () => {
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

describe("R1: v2 error schema parsing", () => {
  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("should parse a 404 resource_missing error with all v2 fields", async () => {
    mockFetch({
      status: 404,
      body: {
        object: "error",
        type: "resource_missing",
        param: "customer_id",
        doc_url: "https://errors.rev.cat/resource-missing",
        message: "Couldn't find the requested customer.",
        retryable: false,
      },
    });
    const client = new RevenueCatClient({ apiKey: "sk_test" });

    try {
      await client.request("get-customer", { project_id: "p1", customer_id: "nope" });
      expect.unreachable("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(RevenueCatApiError);
      const err = e as RevenueCatApiError;
      expect(err.statusCode).toBe(404);
      expect(err.type).toBe("resource_missing");
      expect(err.param).toBe("customer_id");
      expect(err.docUrl).toBe("https://errors.rev.cat/resource-missing");
      expect(err.retryable).toBe(false);
      expect(err.apiError.message).toBe("Couldn't find the requested customer.");
      // The old `code` field must not be relied upon anymore.
      expect(err.type).not.toBeUndefined();
    }
  });

  it("should parse a 401 authentication_error", async () => {
    mockFetch({
      status: 401,
      body: {
        object: "error",
        type: "authentication_error",
        doc_url: "https://errors.rev.cat/authentication-error",
        message: "Invalid API key.",
        retryable: false,
      },
    });
    const client = new RevenueCatClient({ apiKey: "sk_bad" });

    try {
      await client.request("list-projects", {});
      expect.unreachable("should have thrown");
    } catch (e) {
      const err = e as RevenueCatApiError;
      expect(err.statusCode).toBe(401);
      expect(err.type).toBe("authentication_error");
      expect(err.retryable).toBe(false);
    }
  });

  it("should parse a 422 parameter_error with param", async () => {
    mockFetch({
      status: 422,
      body: {
        object: "error",
        type: "parameter_error",
        param: "lookup_key",
        doc_url: "https://errors.rev.cat/parameter-error",
        message: "lookup_key shouldn't be longer than 200 characters",
        retryable: false,
      },
    });
    const client = new RevenueCatClient({ apiKey: "sk_test" });

    try {
      await client.request("create-offering", { project_id: "p1" }, { body: {} });
      expect.unreachable("should have thrown");
    } catch (e) {
      const err = e as RevenueCatApiError;
      expect(err.statusCode).toBe(422);
      expect(err.type).toBe("parameter_error");
      expect(err.param).toBe("lookup_key");
    }
  });

  it("should surface retryable + backoff_ms from a retryable server error", async () => {
    mockFetch({
      status: 500,
      body: {
        object: "error",
        type: "server_error",
        doc_url: "https://errors.rev.cat/server-error",
        message: "Something went wrong.",
        retryable: true,
        backoff_ms: 1500,
      },
    });
    // Disable retries so we can inspect the terminal error deterministically.
    const client = new RevenueCatClient({ apiKey: "sk_test", maxRetries: 0 });

    try {
      await client.request("list-projects", {});
      expect.unreachable("should have thrown");
    } catch (e) {
      const err = e as RevenueCatApiError;
      expect(err.retryable).toBe(true);
      expect(err.backoffMs).toBe(1500);
      expect(err.type).toBe("server_error");
    }
  });

  it("should fall back gracefully for a non-JSON error body", async () => {
    mockFetch({ status: 502, text: "Bad Gateway", contentType: "text/html" });
    const client = new RevenueCatClient({ apiKey: "sk_test", maxRetries: 0 });

    try {
      await client.request("list-projects", {});
      expect.unreachable("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(RevenueCatApiError);
      const err = e as RevenueCatApiError;
      expect(err.statusCode).toBe(502);
      expect(typeof err.apiError.message).toBe("string");
      expect(err.apiError.message.length).toBeGreaterThan(0);
    }
  });

  it("should synthesize an HTTP <status> message when both body and statusText are empty", async () => {
    // Exercises the parseErrorBody final fallback branch (no JSON, no statusText).
    const fn = mock(
      async () =>
        new Response("", { status: 503, statusText: "", headers: new Headers({ "content-type": "text/plain" }) })
    );
    globalThis.fetch = fn as unknown as typeof globalThis.fetch;
    const client = new RevenueCatClient({ apiKey: "sk_test", maxRetries: 0 });

    try {
      await client.request("list-projects", {});
      expect.unreachable("should have thrown");
    } catch (e) {
      const err = e as RevenueCatApiError;
      expect(err.statusCode).toBe(503);
      expect(err.apiError.message).toBe("HTTP 503");
    }
  });
});
