import { describe, it, expect } from "bun:test";
import { paginateAll } from "../../src/utils/pagination.ts";
import type { PaginatedList } from "../../src/types/common.ts";

// R4: paginateAll auto-follows next_page, hard-capped at maxPages (default 20),
// returning merged items plus pages_fetched and a truncated flag.

function page<T>(items: T[], next: string | null): PaginatedList<T> {
  return { object: "list", items, next_page: next, url: "/v2/things" };
}

describe("paginateAll", () => {
  it("should return items and metadata from a single page", async () => {
    const result = await paginateAll(async () => page([{ id: "1" }, { id: "2" }], null));

    expect(result.items).toEqual([{ id: "1" }, { id: "2" }]);
    expect(result.pages_fetched).toBe(1);
    expect(result.truncated).toBe(false);
  });

  it("should merge items across multiple pages and count them", async () => {
    const pages = [
      page([{ id: "1" }, { id: "2" }], "/v2/things?starting_after=2"),
      page([{ id: "3" }, { id: "4" }], "/v2/things?starting_after=4"),
      page([{ id: "5" }], null),
    ];
    let i = 0;
    const result = await paginateAll(async () => pages[i++]);

    expect(result.items).toEqual([{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }, { id: "5" }]);
    expect(result.pages_fetched).toBe(3);
    expect(result.truncated).toBe(false);
  });

  it("should pass the cursor extracted from next_page to subsequent calls", async () => {
    const cursors: (string | undefined)[] = [];
    const pages = [
      page([{ id: "a" }], "/v2/things?starting_after=a"),
      page([{ id: "b" }], null),
    ];
    let i = 0;
    await paginateAll(async (cursor?: string) => {
      cursors.push(cursor);
      return pages[i++];
    });

    expect(cursors).toEqual([undefined, "a"]);
  });

  it("should seed the first fetch with startCursor when provided", async () => {
    const cursors: (string | undefined)[] = [];
    await paginateAll(
      async (cursor?: string) => {
        cursors.push(cursor);
        return page([{ id: "x" }], null);
      },
      { startCursor: "seed_cursor" }
    );

    expect(cursors).toEqual(["seed_cursor"]);
  });

  it("should extract the cursor from an absolute next_page URL", async () => {
    const cursors: (string | undefined)[] = [];
    const pages = [
      page([{ id: "1" }], "https://api.revenuecat.com/v2/things?starting_after=1&limit=20"),
      page([{ id: "2" }], null),
    ];
    let i = 0;
    await paginateAll(async (cursor?: string) => {
      cursors.push(cursor);
      return pages[i++];
    });

    expect(cursors[1]).toBe("1");
  });

  it("should stop and not throw on a malformed next_page", async () => {
    const result = await paginateAll(async () => page([{ id: "1" }], "not-a-url-://???"));
    expect(result.items).toEqual([{ id: "1" }]);
    expect(result.truncated).toBe(false);
  });

  it("should hard-cap at maxPages and set truncated when more pages remain", async () => {
    let calls = 0;
    // Every page advertises another page, so pagination would never stop without the cap.
    const result = await paginateAll(
      async () => {
        calls++;
        return page([{ id: String(calls) }], `/v2/things?starting_after=${calls}`);
      },
      { maxPages: 20 }
    );

    expect(result.pages_fetched).toBe(20);
    expect(calls).toBe(20);
    expect(result.truncated).toBe(true);
    expect(result.items.length).toBe(20);
  });

  it("should respect a small maxPages override", async () => {
    let calls = 0;
    const result = await paginateAll(
      async () => {
        calls++;
        return page([{ id: String(calls) }], "/v2/things?starting_after=next");
      },
      { maxPages: 3 }
    );

    expect(calls).toBe(3);
    expect(result.truncated).toBe(true);
  });

  it("should handle an empty items list", async () => {
    const result = await paginateAll(async () => page([], null));
    expect(result.items).toEqual([]);
    expect(result.pages_fetched).toBe(1);
    expect(result.truncated).toBe(false);
  });
});
