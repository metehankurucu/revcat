import type { PaginatedList } from "../types/common.ts";
import { paginateAll } from "../utils/pagination.ts";
import { output } from "./formatter.ts";

/** Options a paginated list command exposes (commander camelCases --starting-after). */
export interface ListCommandOptions {
  limit?: number;
  startingAfter?: string;
  all?: boolean;
}

export interface ListPageParams {
  limit?: number;
  starting_after?: string;
}

const MAX_PAGES = 20;

/**
 * Drives a paginated list command (R4).
 * - Without `--all`: forwards `limit` + `starting_after` and prints the single page.
 * - With `--all`: auto-paginates (capped at 20 pages), prints one merged list with
 *   `pages_fetched` + `truncated`, and warns on stderr when the cap truncates.
 */
export async function outputList<T>(
  opts: ListCommandOptions,
  fetchPage: (params: ListPageParams) => Promise<PaginatedList<T>>
): Promise<void> {
  if (opts.all) {
    const result = await paginateAll(
      (cursor) => fetchPage({ limit: opts.limit, starting_after: cursor }),
      { maxPages: MAX_PAGES, startCursor: opts.startingAfter }
    );
    if (result.truncated) {
      console.error(
        JSON.stringify({
          warning: `Stopped after the ${MAX_PAGES}-page cap; more results remain. Narrow the query or page manually with --starting-after.`,
        })
      );
    }
    output({
      object: "list",
      items: result.items,
      pages_fetched: result.pages_fetched,
      truncated: result.truncated,
    });
    return;
  }

  output(await fetchPage({ limit: opts.limit, starting_after: opts.startingAfter }));
}
