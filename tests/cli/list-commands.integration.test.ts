import { describe, it, expect, beforeEach, afterEach, mock, spyOn } from "bun:test";
import { createProgram } from "../../src/cli/index.ts";
import type { PaginatedList } from "../../src/types/common.ts";

// R4 (integration): drive real list commands end-to-end through commander +
// the real client (only global fetch is mocked). This proves each rewritten
// action actually threads pagination (--starting-after) into the outgoing
// request AND still forwards command-specific query params (expand / app_id /
// store_*_identifier) - the wiring the unit tests can't see.

let originalFetch: typeof globalThis.fetch;
let savedEnv: { key?: string; project?: string };
let logSpy: ReturnType<typeof spyOn>;

function fetchReturning(pages: PaginatedList<unknown>[]) {
  let i = 0;
  const fn = mock(async (_url: string | URL | Request, _init?: RequestInit) => {
    const page = pages[Math.min(i, pages.length - 1)];
    i++;
    return new Response(JSON.stringify(page), {
      status: 200,
      statusText: "OK",
      headers: new Headers({ "content-type": "application/json" }),
    });
  });
  globalThis.fetch = fn as unknown as typeof globalThis.fetch;
  return fn;
}

function queryOf(fn: ReturnType<typeof mock>, callIndex = 0): URLSearchParams {
  const call = fn.mock.calls[callIndex] as [string | URL, RequestInit];
  return new URL(String(call[0])).searchParams;
}

function page(items: unknown[], next: string | null): PaginatedList<unknown> {
  return { object: "list", items, next_page: next, url: "/v2/x" };
}

async function run(argv: string[]): Promise<void> {
  const program = createProgram();
  await program.parseAsync(argv, { from: "user" });
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
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env.REVENUECAT_API_KEY = savedEnv.key;
  process.env.REVENUECAT_PROJECT_ID = savedEnv.project;
  if (savedEnv.key === undefined) delete process.env.REVENUECAT_API_KEY;
  if (savedEnv.project === undefined) delete process.env.REVENUECAT_PROJECT_ID;
  logSpy.mockRestore();
});

describe("R4 integration: single-page cursor + param passthrough", () => {
  it("customers list threads --starting-after and --limit into the request", async () => {
    const fetchMock = fetchReturning([page([{ id: "c1" }], null)]);
    await run(["customers", "list", "--starting-after", "cur_1", "--limit", "5"]);

    const q = queryOf(fetchMock);
    expect(q.get("starting_after")).toBe("cur_1");
    expect(q.get("limit")).toBe("5");
  });

  it("offerings list forwards --expand alongside the cursor", async () => {
    const fetchMock = fetchReturning([page([{ id: "o1" }], null)]);
    await run(["offerings", "list", "--starting-after", "o_5", "--expand", "items.packages"]);

    const q = queryOf(fetchMock);
    expect(q.get("starting_after")).toBe("o_5");
    expect(q.get("expand")).toBe("items.packages");
  });

  it("products list forwards --app-id alongside the cursor", async () => {
    const fetchMock = fetchReturning([page([{ id: "p1" }], null)]);
    await run(["products", "list", "--starting-after", "p_5", "--app-id", "app_9"]);

    const q = queryOf(fetchMock);
    expect(q.get("starting_after")).toBe("p_5");
    expect(q.get("app_id")).toBe("app_9");
  });

  it("purchases search forwards --store-identifier alongside the cursor", async () => {
    const fetchMock = fetchReturning([page([{ id: "pur1" }], null)]);
    await run([
      "purchases",
      "search",
      "--store-identifier",
      "sid_1",
      "--starting-after",
      "pc_1",
    ]);

    const q = queryOf(fetchMock);
    expect(q.get("store_purchase_identifier")).toBe("sid_1");
    expect(q.get("starting_after")).toBe("pc_1");
  });

  it("a customer sub-list (entitlements) also threads the cursor", async () => {
    const fetchMock = fetchReturning([page([{ id: "e1" }], null)]);
    await run([
      "customers",
      "entitlements",
      "--customer",
      "cust_1",
      "--starting-after",
      "ent_1",
    ]);

    const q = queryOf(fetchMock);
    expect(q.get("starting_after")).toBe("ent_1");
    // path targets the specific customer
    const url = String(fetchMock.mock.calls[0]![0]);
    expect(url).toContain("/customers/cust_1/");
  });
});

describe("R4 integration: --all auto-follows next_page end-to-end", () => {
  it("customers list --all issues one fetch per page and merges the results", async () => {
    const fetchMock = fetchReturning([
      page([{ id: "1" }], "https://api.revenuecat.com/v2/things?starting_after=c2"),
      page([{ id: "2" }], null),
    ]);

    await run(["customers", "list", "--all"]);

    // Two pages fetched, second seeded with the extracted cursor.
    expect(fetchMock.mock.calls.length).toBe(2);
    expect(queryOf(fetchMock, 0).get("starting_after")).toBeNull();
    expect(queryOf(fetchMock, 1).get("starting_after")).toBe("c2");

    // Merged, single list printed to stdout.
    const printed = JSON.parse(logSpy.mock.calls[logSpy.mock.calls.length - 1]![0] as string);
    expect(printed.items).toEqual([{ id: "1" }, { id: "2" }]);
    expect(printed.pages_fetched).toBe(2);
    expect(printed.truncated).toBe(false);
  });
});
