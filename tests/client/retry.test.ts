import { describe, it, expect, beforeEach, afterEach, mock, spyOn } from "bun:test";
import { RevenueCatClient } from "../../src/client/base.ts";
import { RevenueCatApiError } from "../../src/client/errors.ts";

// R3: On 429 (and retryable 5xx) the client retries automatically up to maxRetries,
// honoring body backoff_ms, else Retry-After, else exponential fallback; retry notices
// go to stderr as JSON lines; after exhaustion the R1 envelope is emitted.

interface ResponseSpec {
  status?: number;
  body?: unknown;
  headers?: Record<string, string>;
  contentType?: string;
}

let originalFetch: typeof globalThis.fetch;

/** Returns queued responses in order; the last spec repeats if calls exceed the queue. */
function queueFetch(specs: ResponseSpec[]) {
  let i = 0;
  const fn = mock(async () => {
    const spec = specs[Math.min(i, specs.length - 1)];
    i++;
    const { status = 200, body, headers = {}, contentType = "application/json" } = spec;
    return new Response(body !== undefined ? JSON.stringify(body) : "{}", {
      status,
      statusText: status >= 400 ? "Error" : "OK",
      headers: new Headers({ "content-type": contentType, ...headers }),
    });
  });
  globalThis.fetch = fn as unknown as typeof globalThis.fetch;
  return fn;
}

function makeClient(overrides?: { maxRetries?: number }) {
  const delays: number[] = [];
  const client = new RevenueCatClient({
    apiKey: "sk_test",
    maxRetries: overrides?.maxRetries ?? 2,
    sleep: async (ms: number) => {
      delays.push(ms);
    },
  });
  return { client, delays };
}

function retryNotices(errSpy: ReturnType<typeof spyOn>): Array<Record<string, unknown>> {
  const calls = errSpy.mock.calls as unknown as Array<[string]>;
  return calls
    .map((c): Record<string, unknown> | null => {
      try {
        return JSON.parse(c[0]) as Record<string, unknown>;
      } catch {
        return null;
      }
    })
    .filter((v): v is Record<string, unknown> => !!v && typeof v === "object" && "retry" in v)
    .map((v) => v.retry as Record<string, unknown>);
}

describe("R3: automatic retry + backoff", () => {
  let errSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    errSpy = spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
    errSpy.mockRestore();
  });

  it("retries a 429 then succeeds, logging exactly one retry notice", async () => {
    const fn = queueFetch([
      { status: 429, body: { object: "error", type: "rate_limit_error", message: "slow down", retryable: true, backoff_ms: 10 } },
      { status: 200, body: { object: "list", items: [{ id: "p1" }] } },
    ]);
    const { client } = makeClient();

    const result = await client.request("list-projects", {});
    expect(result).toEqual({ object: "list", items: [{ id: "p1" }] });
    expect(fn.mock.calls.length).toBe(2);

    const notices = retryNotices(errSpy);
    expect(notices.length).toBe(1);
    expect(notices[0].status).toBe(429);
    expect(notices[0].attempt).toBe(1);
  });

  it("exhausts retries on repeated 429 and throws the R1 envelope with retryable true", async () => {
    const fn = queueFetch([
      { status: 429, body: { object: "error", type: "rate_limit_error", message: "nope", retryable: true, backoff_ms: 5 } },
    ]);
    const { client } = makeClient({ maxRetries: 2 });

    try {
      await client.request("list-projects", {});
      expect.unreachable("should have thrown after exhausting retries");
    } catch (e) {
      expect(e).toBeInstanceOf(RevenueCatApiError);
      const err = e as RevenueCatApiError;
      expect(err.statusCode).toBe(429);
      expect(err.retryable).toBe(true);
    }
    // 1 initial + 2 retries = 3 fetches
    expect(fn.mock.calls.length).toBe(3);
    expect(retryNotices(errSpy).length).toBe(2);
  });

  it("prefers body backoff_ms over the Retry-After header", async () => {
    queueFetch([
      { status: 429, body: { message: "x", retryable: true, backoff_ms: 1234 }, headers: { "Retry-After": "99" } },
      { status: 200, body: {} },
    ]);
    const { client, delays } = makeClient();

    await client.request("list-projects", {});
    expect(delays[0]).toBe(1234);
  });

  it("falls back to Retry-After (seconds -> ms) when there is no backoff_ms", async () => {
    queueFetch([
      { status: 429, body: { message: "x", retryable: true }, headers: { "Retry-After": "2" } },
      { status: 200, body: {} },
    ]);
    const { client, delays } = makeClient();

    await client.request("list-projects", {});
    expect(delays[0]).toBe(2000);
  });

  it("falls back to exponential backoff when neither backoff_ms nor Retry-After present", async () => {
    queueFetch([
      { status: 429, body: { message: "x", retryable: true } },
      { status: 429, body: { message: "x", retryable: true } },
      { status: 200, body: {} },
    ]);
    const { client, delays } = makeClient();

    await client.request("list-projects", {});
    // attempt 0 -> 500, attempt 1 -> 1000
    expect(delays).toEqual([500, 1000]);
  });

  it("does NOT retry when the body explicitly marks the error non-retryable", async () => {
    const fn = queueFetch([
      { status: 500, body: { object: "error", type: "server_error", message: "fatal", retryable: false } },
    ]);
    const { client } = makeClient();

    await expect(client.request("list-projects", {})).rejects.toBeInstanceOf(RevenueCatApiError);
    expect(fn.mock.calls.length).toBe(1);
    expect(retryNotices(errSpy).length).toBe(0);
  });

  it("retries a retryable 5xx (503) then succeeds", async () => {
    const fn = queueFetch([
      { status: 503, body: { object: "error", type: "server_error", message: "unavailable", retryable: true, backoff_ms: 1 } },
      { status: 200, body: { ok: true } },
    ]);
    const { client } = makeClient();

    const result = await client.request("list-projects", {});
    expect(result).toEqual({ ok: true });
    expect(fn.mock.calls.length).toBe(2);
  });

  it("does NOT retry a non-retryable 4xx (404)", async () => {
    const fn = queueFetch([
      { status: 404, body: { object: "error", type: "resource_missing", message: "gone", retryable: false } },
    ]);
    const { client } = makeClient();

    await expect(
      client.request("get-customer", { project_id: "p1", customer_id: "x" })
    ).rejects.toBeInstanceOf(RevenueCatApiError);
    expect(fn.mock.calls.length).toBe(1);
  });
});
