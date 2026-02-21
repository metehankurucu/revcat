import type { PaginatedList } from "../types/common.ts";

export async function paginateAll<T>(
  fetchPage: (cursor?: string) => Promise<PaginatedList<T>>
): Promise<T[]> {
  const items: T[] = [];
  let cursor: string | undefined;

  do {
    const page = await fetchPage(cursor);
    items.push(...page.items);

    if (page.next_page) {
      try {
        const url = new URL(page.next_page, "https://api.revenuecat.com");
        cursor = url.searchParams.get("starting_after") ?? undefined;
      } catch {
        cursor = undefined;
      }
    } else {
      cursor = undefined;
    }
  } while (cursor);

  return items;
}
