import { describe, it, expect, spyOn } from "bun:test";
import { outputList } from "../../src/cli/paginate.ts";
import type { PaginatedList } from "../../src/types/common.ts";

// R4: `outputList` drives the CLI list surface. Without --all it forwards
// limit + starting_after and prints the single page. With --all it auto-paginates
// (capped) and prints one merged { items, pages_fetched, truncated } list, warning
// on stderr when truncated.

function page<T>(items: T[], next: string | null): PaginatedList<T> {
  return { object: "list", items, next_page: next, url: "/v2/things" };
}

function capture(fn: () => Promise<void>): Promise<{ out: unknown[]; err: string[] }> {
  const outLines: string[] = [];
  const errLines: string[] = [];
  const logSpy = spyOn(console, "log").mockImplementation((v: unknown) => {
    outLines.push(v as string);
  });
  const errSpy = spyOn(console, "error").mockImplementation((v: unknown) => {
    errLines.push(v as string);
  });
  return fn()
    .then(() => ({ out: outLines.map((l) => JSON.parse(l)), err: errLines }))
    .finally(() => {
      logSpy.mockRestore();
      errSpy.mockRestore();
    });
}

describe("R4: outputList", () => {
  it("forwards limit and starting_after and prints a single page without --all", async () => {
    const seen: Array<{ limit?: number; starting_after?: string }> = [];
    const { out } = await capture(() =>
      outputList({ limit: 25, startingAfter: "cur_9" }, async (params) => {
        seen.push(params);
        return page([{ id: "1" }], "/v2/things?starting_after=1");
      })
    );

    expect(seen).toEqual([{ limit: 25, starting_after: "cur_9" }]);
    // Single-page path prints the raw page (no pages_fetched metadata).
    expect(out[0]).toEqual({ object: "list", items: [{ id: "1" }], next_page: "/v2/things?starting_after=1", url: "/v2/things" });
  });

  it("merges all pages into one list with pages_fetched metadata when --all is set", async () => {
    const pages = [
      page([{ id: "1" }], "/v2/things?starting_after=1"),
      page([{ id: "2" }], "/v2/things?starting_after=2"),
      page([{ id: "3" }], null),
    ];
    let i = 0;
    const { out, err } = await capture(() =>
      outputList({ all: true }, async () => pages[i++])
    );

    const result = out[0] as Record<string, unknown>;
    expect(result.items).toEqual([{ id: "1" }, { id: "2" }, { id: "3" }]);
    expect(result.pages_fetched).toBe(3);
    expect(result.truncated).toBe(false);
    expect(err.length).toBe(0);
  });

  it("issues one fetch per page in cursor order under --all (limiter-respecting sequencing)", async () => {
    const cursors: (string | undefined)[] = [];
    const pages = [
      page([{ id: "a" }], "/v2/x?starting_after=a"),
      page([{ id: "b" }], "/v2/x?starting_after=b"),
      page([{ id: "c" }], null),
    ];
    let i = 0;
    await capture(() =>
      outputList({ all: true }, async (params) => {
        cursors.push(params.starting_after);
        return pages[i++];
      })
    );

    // Each page is fetched exactly once, sequentially, threading the cursor.
    expect(cursors).toEqual([undefined, "a", "b"]);
  });

  it("warns on stderr and marks truncated when --all hits the 20-page cap", async () => {
    let calls = 0;
    const { out, err } = await capture(() =>
      outputList({ all: true }, async () => {
        calls++;
        return page([{ id: String(calls) }], `/v2/x?starting_after=${calls}`);
      })
    );

    expect(calls).toBe(20);
    const result = out[0] as Record<string, unknown>;
    expect(result.truncated).toBe(true);
    expect(result.pages_fetched).toBe(20);
    expect(err.length).toBe(1);
    const warning = JSON.parse(err[0]);
    expect(warning).toHaveProperty("warning");
    expect(String(warning.warning)).toContain("20");
  });

  it("seeds --all pagination from --starting-after when both are given", async () => {
    const cursors: (string | undefined)[] = [];
    await capture(() =>
      outputList({ all: true, startingAfter: "resume_here" }, async (params) => {
        cursors.push(params.starting_after);
        return page([{ id: "1" }], null);
      })
    );

    expect(cursors[0]).toBe("resume_here");
  });
});
