import { mock } from "bun:test";
import type { RevenueCatClient, RequestOptions } from "../src/client/base.ts";

export interface CapturedRequest {
  operationId: string;
  pathParams: Record<string, string>;
  options?: RequestOptions;
}

/**
 * Creates a mock RevenueCatClient that captures all requests
 * and returns the specified response data.
 */
export function createMockClient(responseData: unknown = {}): {
  client: RevenueCatClient;
  requests: CapturedRequest[];
} {
  const requests: CapturedRequest[] = [];

  const requestFn = mock(
    async (
      operationId: string,
      pathParams: Record<string, string>,
      options?: RequestOptions
    ) => {
      requests.push({ operationId, pathParams, options });
      return responseData;
    }
  );

  const client = { request: requestFn } as unknown as RevenueCatClient;
  return { client, requests };
}

/**
 * Creates a mock fetch function that returns the specified response.
 */
export function createMockFetch(opts: {
  status?: number;
  body?: unknown;
  headers?: Record<string, string>;
  contentType?: string;
}): typeof globalThis.fetch {
  const {
    status = 200,
    body = {},
    headers = {},
    contentType = "application/json",
  } = opts;

  const responseHeaders = new Headers({
    "content-type": contentType,
    ...headers,
  });

  return mock(async () => {
    return new Response(
      typeof body === "string" ? body : JSON.stringify(body),
      {
        status,
        statusText: status === 200 ? "OK" : "Error",
        headers: responseHeaders,
      }
    );
  }) as unknown as typeof globalThis.fetch;
}

/**
 * Extracts the fetch call details from a mock fetch.
 */
export function getFetchCall(mockFetch: typeof globalThis.fetch): {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
} {
  const fn = mockFetch as unknown as { mock: { calls: Array<[string, RequestInit]> } };
  const [url, init] = fn.mock.calls[0];
  return {
    url: url as string,
    method: init?.method || "GET",
    headers: Object.fromEntries(Object.entries(init?.headers || {})),
    body: init?.body ? JSON.parse(init.body as string) : undefined,
  };
}

export function getFetchCallCount(mockFetch: typeof globalThis.fetch): number {
  const fn = mockFetch as unknown as { mock: { calls: unknown[] } };
  return fn.mock.calls.length;
}
