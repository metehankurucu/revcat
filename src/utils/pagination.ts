import type { PaginatedList } from "../types/common.ts";

export interface PaginateAllResult<T> {
  items: T[];
  pages_fetched: number;
  /** True when the maxPages cap stopped pagination before the last page. */
  truncated: boolean;
}

export interface PaginateAllOptions {
  /** Hard cap on pages fetched. Default 20. */
  maxPages?: number;
  /** Cursor to seed the first request with (e.g. resume from --starting-after). */
  startCursor?: string;
}

/**
 * Auto-follows `next_page` across pages, merging items. Hard-capped at
 * `maxPages` (default 20): if more pages remain when the cap is hit, the result
 * is marked `truncated` so the caller can warn.
 */
export async function paginateAll<T>(
  fetchPage: (cursor?: string) => Promise<PaginatedList<T>>,
  opts?: PaginateAllOptions
): Promise<PaginateAllResult<T>> {
  const maxPages = opts?.maxPages ?? 20;
  const items: T[] = [];
  let cursor: string | undefined = opts?.startCursor;
  let pages = 0;
  let truncated = false;

  do {
    const page = await fetchPage(cursor);
    pages++;
    items.push(...page.items);
    cursor = extractCursor(page.next_page);
    if (cursor && pages >= maxPages) {
      truncated = true;
      break;
    }
  } while (cursor);

  return { items, pages_fetched: pages, truncated };
}

function extractCursor(nextPage: string | null): string | undefined {
  if (!nextPage) return undefined;
  try {
    const url = new URL(nextPage, "https://api.revenuecat.com");
    return url.searchParams.get("starting_after") ?? undefined;
  } catch {
    return undefined;
  }
}
