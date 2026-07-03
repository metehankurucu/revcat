import { describe, it, expect } from "bun:test";
import type { Command } from "commander";
import { createProgram } from "../../src/cli/index.ts";

// R4: EVERY paginated list command (any leaf command exposing --limit) must also
// accept --starting-after and --all. This invariant test walks the real commander
// tree, so it permanently kills drift as new commands are added.

const PAGINATION_FLAGS = ["--limit", "--starting-after", "--all"] as const;

interface LeafCmd {
  path: string;
  longs: Set<string>;
}

function collectLeaves(cmd: Command, prefix: string[] = []): LeafCmd[] {
  const subcommands = cmd.commands;
  const here = cmd.name() ? [...prefix, cmd.name()] : prefix;
  if (subcommands.length === 0) {
    const longs = new Set<string>();
    for (const opt of cmd.options) {
      if (opt.long) longs.add(opt.long);
    }
    return [{ path: here.join(" "), longs }];
  }
  return subcommands.flatMap((c) => collectLeaves(c, here));
}

const program = createProgram();
const leaves = collectLeaves(program);
const paginated = leaves.filter((l) => l.longs.has("--limit"));

describe("R4: pagination flag coverage", () => {
  it("finds the expected set of paginated list commands", () => {
    // Sanity: we actually discovered the paginated commands (not a vacuous pass).
    // Top-level lists + sub-lists (customer entitlements/aliases/attributes,
    // entitlement/package products, purchase/subscription entitlements, etc.).
    expect(paginated.length).toBeGreaterThanOrEqual(20);
  });

  for (const leaf of paginated) {
    it(`"${leaf.path}" (has --limit) must also accept --starting-after and --all`, () => {
      expect(leaf.longs.has("--starting-after")).toBe(true);
      expect(leaf.longs.has("--all")).toBe(true);
    });
  }

  // Coupling invariant (catches drift in BOTH directions): the three pagination
  // flags always move together. A future command that adds --limit without the
  // cursor flags, OR --starting-after/--all without --limit, fails here. Since
  // --limit is used nowhere except paginated lists, this makes "has --limit" a
  // reliable proxy for "is paginated".
  for (const leaf of leaves) {
    const present = PAGINATION_FLAGS.filter((f) => leaf.longs.has(f));
    if (present.length === 0) continue;
    it(`"${leaf.path}" exposes all three pagination flags together, not a subset`, () => {
      expect(present).toEqual([...PAGINATION_FLAGS]);
    });
  }

  it("covers the specific top-level list/search commands from the plan", () => {
    const expected = [
      "revcat customers list",
      "revcat purchases search",
      "revcat subscriptions search",
      "revcat invoices list",
      "revcat offerings list",
      "revcat packages list",
      "revcat entitlements list",
      "revcat apps list",
      "revcat webhooks list",
      "revcat paywalls list",
      "revcat products list",
      "revcat collaborators list",
      "revcat virtual-currencies list",
      "revcat audit-logs list",
    ];
    const byPath = new Map(leaves.map((l) => [l.path, l]));
    for (const path of expected) {
      const leaf = byPath.get(path);
      expect(leaf, `${path} should exist`).toBeDefined();
      expect(leaf!.longs.has("--starting-after"), `${path} needs --starting-after`).toBe(true);
      expect(leaf!.longs.has("--all"), `${path} needs --all`).toBe(true);
    }
  });
});
