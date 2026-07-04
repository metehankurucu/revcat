#!/usr/bin/env bun
import { createProgram } from "../src/cli/index.ts";
import { outputError } from "../src/cli/formatter.ts";

const program = createProgram();

// Any error thrown before a command's own try/catch runs - notably the ConfigError
// raised by the global preAction hook when the API key is missing - must still reach
// the JSON error envelope instead of escaping as a raw stack trace (R2).
program.parseAsync().catch((error) => outputError(error));
