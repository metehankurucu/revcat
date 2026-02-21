#!/usr/bin/env bun
import { createProgram } from "../src/cli/index.ts";

const program = createProgram();
program.parse();
