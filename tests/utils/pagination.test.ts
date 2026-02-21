import { describe, it, expect } from "bun:test";
import { paginateAll } from "../../src/utils/pagination.ts";
import type { PaginatedList } from "../../src/types/common.ts";

describe("paginateAll", () => {
  it("should return items from a single page", async () => {
    const page: PaginatedList<{ id: string }> = {
      object: "list",
      items: [{ id: "1" }, { id: "2" }],
      next_page: null,
      url: "/v2/projects",
    };

    const result = await paginateAll(async () => page);

    expect(result).toEqual([{ id: "1" }, { id: "2" }]);
  });

  it("should paginate across multiple pages", async () => {
    let callCount = 0;
    const pages: PaginatedList<{ id: string }>[] = [
      {
        object: "list",
        items: [{ id: "1" }, { id: "2" }],
        next_page: "/v2/projects?starting_after=2",
        url: "/v2/projects",
      },
      {
        object: "list",
        items: [{ id: "3" }, { id: "4" }],
        next_page: "/v2/projects?starting_after=4",
        url: "/v2/projects",
      },
      {
        object: "list",
        items: [{ id: "5" }],
        next_page: null,
        url: "/v2/projects",
      },
    ];

    const result = await paginateAll(async (cursor?: string) => {
      const page = pages[callCount];
      callCount++;
      return page;
    });

    expect(result).toEqual([
      { id: "1" },
      { id: "2" },
      { id: "3" },
      { id: "4" },
      { id: "5" },
    ]);
    expect(callCount).toBe(3);
  });

  it("should pass cursor from next_page to subsequent calls", async () => {
    const cursors: (string | undefined)[] = [];

    const pages: PaginatedList<{ id: string }>[] = [
      {
        object: "list",
        items: [{ id: "a" }],
        next_page: "/v2/things?starting_after=a",
        url: "/v2/things",
      },
      {
        object: "list",
        items: [{ id: "b" }],
        next_page: null,
        url: "/v2/things",
      },
    ];

    let idx = 0;
    await paginateAll(async (cursor?: string) => {
      cursors.push(cursor);
      return pages[idx++];
    });

    expect(cursors).toEqual([undefined, "a"]);
  });

  it("should handle empty items list", async () => {
    const page: PaginatedList<{ id: string }> = {
      object: "list",
      items: [],
      next_page: null,
      url: "/v2/projects",
    };

    const result = await paginateAll(async () => page);

    expect(result).toEqual([]);
  });

  it("should handle next_page as full URL", async () => {
    let idx = 0;
    const cursors: (string | undefined)[] = [];

    const pages: PaginatedList<{ id: string }>[] = [
      {
        object: "list",
        items: [{ id: "1" }],
        next_page: "https://api.revenuecat.com/v2/projects?starting_after=1&limit=20",
        url: "/v2/projects",
      },
      {
        object: "list",
        items: [{ id: "2" }],
        next_page: null,
        url: "/v2/projects",
      },
    ];

    await paginateAll(async (cursor?: string) => {
      cursors.push(cursor);
      return pages[idx++];
    });

    expect(cursors[1]).toBe("1");
  });

  it("should handle malformed next_page gracefully", async () => {
    const page: PaginatedList<{ id: string }> = {
      object: "list",
      items: [{ id: "1" }],
      next_page: "not-a-url-://???",
      url: "/v2/projects",
    };

    // Should not throw, should stop paginating
    const result = await paginateAll(async () => page);
    expect(result).toEqual([{ id: "1" }]);
  });
});
