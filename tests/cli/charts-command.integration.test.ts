import { describe, it, expect, beforeEach, afterEach, mock, spyOn } from "bun:test";
import { createProgram } from "../../src/cli/index.ts";

// R5 (command surface): drive `charts data` / `charts options` through commander
// end-to-end (only global fetch mocked) to prove that chart validation actually
// fires at the command surface, runs BEFORE the network request (fail fast),
// reads the right opts key, and that --unsafe-chart truly bypasses it. Unit
// tests of assertValidChart cannot catch a broken/removed/misordered call here.

let originalFetch: typeof globalThis.fetch;
let savedEnv: { key?: string; project?: string };
let logSpy: ReturnType<typeof spyOn>;
let errSpy: ReturnType<typeof spyOn>;
let exitSpy: ReturnType<typeof spyOn>;
let fetchMock: ReturnType<typeof mock>;

function mockFetchOk(body: unknown) {
  fetchMock = mock(async () =>
    new Response(JSON.stringify(body), {
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
    })
  );
  globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;
}

async function run(argv: string[]): Promise<void> {
  await createProgram().parseAsync(argv, { from: "user" });
}

beforeEach(() => {
  originalFetch = globalThis.fetch;
  savedEnv = {
    key: process.env.REVENUECAT_API_KEY,
    project: process.env.REVENUECAT_PROJECT_ID,
  };
  process.env.REVENUECAT_API_KEY = "sk_test_key";
  process.env.REVENUECAT_PROJECT_ID = "proj_1";
  logSpy = spyOn(console, "log").mockImplementation(() => {});
  errSpy = spyOn(console, "error").mockImplementation(() => {});
  // outputError calls process.exit(1); neutralize it so the test process survives.
  exitSpy = spyOn(process, "exit").mockImplementation(
    ((_c?: number) => undefined as never) as typeof process.exit
  );
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env.REVENUECAT_API_KEY = savedEnv.key;
  process.env.REVENUECAT_PROJECT_ID = savedEnv.project;
  if (savedEnv.key === undefined) delete process.env.REVENUECAT_API_KEY;
  if (savedEnv.project === undefined) delete process.env.REVENUECAT_PROJECT_ID;
  logSpy.mockRestore();
  errSpy.mockRestore();
  exitSpy.mockRestore();
});

function lastError(): Record<string, unknown> {
  const line = errSpy.mock.calls[errSpy.mock.calls.length - 1][0] as string;
  return JSON.parse(line) as Record<string, unknown>;
}

describe("R5: charts data validates --chart at the command surface", () => {
  it("rejects an unknown chart with an InvalidChartError envelope and never calls the API", async () => {
    mockFetchOk({ object: "chart_data" });

    await run(["charts", "data", "--chart", "bananas"]);

    // Fail fast: validation threw before any request went out.
    expect(fetchMock.mock.calls.length).toBe(0);
    const env = lastError();
    expect(env.error).toBe("InvalidChartError");
    expect(env.chart).toBe("bananas");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("suggests mrr for the mmr typo", async () => {
    mockFetchOk({ object: "chart_data" });
    await run(["charts", "data", "--chart", "mmr"]);
    expect(fetchMock.mock.calls.length).toBe(0);
    expect(lastError().did_you_mean).toEqual(expect.arrayContaining(["mrr"]));
  });

  it("--unsafe-chart bypasses validation and sends the value through to the API", async () => {
    mockFetchOk({ object: "chart_data" });

    await run(["charts", "data", "--chart", "brand_new_chart", "--unsafe-chart"]);

    // Bypass proven: the request was made despite the name not being canonical.
    expect(fetchMock.mock.calls.length).toBe(1);
    const url = String(fetchMock.mock.calls[0]![0]);
    expect(url).toContain("/charts/brand_new_chart");
    // No error envelope emitted.
    expect(errSpy.mock.calls.length).toBe(0);
  });

  it("accepts a canonical chart name and calls the API", async () => {
    mockFetchOk({ object: "chart_data" });
    await run(["charts", "data", "--chart", "mrr"]);
    expect(fetchMock.mock.calls.length).toBe(1);
    expect(String(fetchMock.mock.calls[0]![0])).toContain("/charts/mrr");
  });
});

describe("R5: charts options validates --chart at the command surface", () => {
  it("rejects an unknown chart and never calls the API", async () => {
    mockFetchOk({ object: "chart_options" });
    await run(["charts", "options", "--chart", "notachart"]);
    expect(fetchMock.mock.calls.length).toBe(0);
    expect(lastError().error).toBe("InvalidChartError");
  });
});
