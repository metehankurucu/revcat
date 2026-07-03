import { describe, it, expect, spyOn, afterEach } from "bun:test";
import { output, outputError } from "../../src/cli/formatter.ts";
import { RevenueCatApiError } from "../../src/client/errors.ts";

// R1: outputError must serialize the machine-actionable v2 fields
// (type, param, doc_url, retryable, status) into the JSON envelope when present.

function captureError(fn: () => void): unknown {
  const errSpy = spyOn(console, "error").mockImplementation(() => {});
  const exitSpy = spyOn(process, "exit").mockImplementation(((_code?: number) => {
    // prevent the test runner from actually exiting
    return undefined as never;
  }) as typeof process.exit);
  let parsed: unknown;
  try {
    fn();
    // Read the recorded call BEFORE restoring (mockRestore clears mock.calls).
    const call = errSpy.mock.calls[errSpy.mock.calls.length - 1];
    parsed = call ? JSON.parse(call[0] as string) : undefined;
  } finally {
    errSpy.mockRestore();
    exitSpy.mockRestore();
  }
  return parsed;
}

afterEach(() => {
  // restore any leftover spies defensively (handled per-call above)
});

describe("R1: outputError envelope", () => {
  it("should serialize all v2 fields for a RevenueCatApiError", () => {
    const err = new RevenueCatApiError(404, {
      object: "error",
      type: "resource_missing",
      param: "customer_id",
      doc_url: "https://errors.rev.cat/resource-missing",
      message: "Couldn't find the requested customer.",
      retryable: false,
    });

    const envelope = captureError(() => outputError(err)) as Record<string, unknown>;

    expect(envelope.error).toBe("RevenueCatApiError");
    expect(envelope.message).toBe("Couldn't find the requested customer.");
    expect(envelope.type).toBe("resource_missing");
    expect(envelope.param).toBe("customer_id");
    expect(envelope.doc_url).toBe("https://errors.rev.cat/resource-missing");
    expect(envelope.retryable).toBe(false);
    expect(envelope.status).toBe(404);
  });

  it("should include backoff_ms when present on a retryable error", () => {
    const err = new RevenueCatApiError(429, {
      object: "error",
      type: "rate_limit_error",
      doc_url: "https://errors.rev.cat/rate-limit-error",
      message: "Rate limit exceeded.",
      retryable: true,
      backoff_ms: 2000,
    });

    const envelope = captureError(() => outputError(err)) as Record<string, unknown>;

    expect(envelope.retryable).toBe(true);
    expect(envelope.backoff_ms).toBe(2000);
    expect(envelope.status).toBe(429);
  });

  it("should keep a minimal envelope for a generic Error", () => {
    const envelope = captureError(() => outputError(new Error("boom"))) as Record<string, unknown>;

    expect(envelope.error).toBe("Error");
    expect(envelope.message).toBe("boom");
    expect(envelope).not.toHaveProperty("type");
    expect(envelope).not.toHaveProperty("status");
  });

  it("should exit with code 1", () => {
    const exitSpy = spyOn(process, "exit").mockImplementation(((_c?: number) => undefined as never) as typeof process.exit);
    const errSpy = spyOn(console, "error").mockImplementation(() => {});
    outputError(new Error("x"));
    expect(exitSpy).toHaveBeenCalledWith(1);
    errSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it("should always produce parseable JSON on stderr", () => {
    const errSpy = spyOn(console, "error").mockImplementation(() => {});
    const exitSpy = spyOn(process, "exit").mockImplementation(((_c?: number) => undefined as never) as typeof process.exit);
    outputError("a raw string failure");
    const line = errSpy.mock.calls[errSpy.mock.calls.length - 1][0] as string;
    expect(() => JSON.parse(line)).not.toThrow();
    errSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it("output() should pretty-print by default (multi-line)", () => {
    const logSpy = spyOn(console, "log").mockImplementation(() => {});
    output({ a: 1, b: 2 });
    const line = logSpy.mock.calls[logSpy.mock.calls.length - 1][0] as string;
    expect(line).toContain("\n");
    logSpy.mockRestore();
  });
});
