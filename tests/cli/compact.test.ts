import { describe, it, expect, spyOn, afterEach, mock } from "bun:test";
import { output, outputError, setCompactOutput } from "../../src/cli/formatter.ts";
import { createProgram } from "../../src/cli/index.ts";
import type { PaginatedList } from "../../src/types/common.ts";

// R8: a global --compact flag switches output to single-line JSON; the default
// stays pretty-printed.

afterEach(() => {
  // The compact flag is process-global module state; always reset so it never
  // leaks into other test files (e.g. the "pretty by default" formatter test).
  setCompactOutput(false);
});

describe("R8: setCompactOutput toggles serialization", () => {
  it("output() emits single-line JSON that round-trips when compact", () => {
    setCompactOutput(true);
    const logSpy = spyOn(console, "log").mockImplementation(() => {});
    output({ a: 1, nested: { b: 2, c: [3, 4] } });
    const line = logSpy.mock.calls[logSpy.mock.calls.length - 1][0] as string;
    logSpy.mockRestore();

    expect(line).not.toContain("\n");
    expect(JSON.parse(line)).toEqual({ a: 1, nested: { b: 2, c: [3, 4] } });
  });

  it("output() reverts to multi-line pretty output when compact is off", () => {
    setCompactOutput(false);
    const logSpy = spyOn(console, "log").mockImplementation(() => {});
    output({ a: 1 });
    const line = logSpy.mock.calls[logSpy.mock.calls.length - 1][0] as string;
    logSpy.mockRestore();

    expect(line).toContain("\n");
  });

  it("outputError() also honors compact mode (single-line, parseable)", () => {
    setCompactOutput(true);
    const errSpy = spyOn(console, "error").mockImplementation(() => {});
    const exitSpy = spyOn(process, "exit").mockImplementation(
      ((_c?: number) => undefined as never) as typeof process.exit
    );
    outputError(new Error("boom"));
    const line = errSpy.mock.calls[errSpy.mock.calls.length - 1][0] as string;
    errSpy.mockRestore();
    exitSpy.mockRestore();

    expect(line).not.toContain("\n");
    expect(JSON.parse(line).message).toBe("boom");
  });
});

describe("R8: --compact flag is wired end-to-end", () => {
  it("driving a command with --compact produces single-line stdout", async () => {
    const savedFetch = globalThis.fetch;
    const savedKey = process.env.REVENUECAT_API_KEY;
    const savedProject = process.env.REVENUECAT_PROJECT_ID;
    process.env.REVENUECAT_API_KEY = "sk_test_key";
    process.env.REVENUECAT_PROJECT_ID = "proj_1";

    const listPage: PaginatedList<unknown> = {
      object: "list",
      items: [{ id: "c1" }],
      next_page: null,
      url: "/v2/x",
    };
    globalThis.fetch = mock(async () =>
      new Response(JSON.stringify(listPage), {
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
      })
    ) as unknown as typeof globalThis.fetch;

    const logSpy = spyOn(console, "log").mockImplementation(() => {});
    try {
      await createProgram().parseAsync(["customers", "list", "--compact"], { from: "user" });
      const line = logSpy.mock.calls[logSpy.mock.calls.length - 1][0] as string;
      expect(line).not.toContain("\n");
      expect(JSON.parse(line).items).toEqual([{ id: "c1" }]);
    } finally {
      logSpy.mockRestore();
      globalThis.fetch = savedFetch;
      process.env.REVENUECAT_API_KEY = savedKey;
      process.env.REVENUECAT_PROJECT_ID = savedProject;
      if (savedKey === undefined) delete process.env.REVENUECAT_API_KEY;
      if (savedProject === undefined) delete process.env.REVENUECAT_PROJECT_ID;
    }
  });
});
