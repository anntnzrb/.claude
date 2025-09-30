#!/usr/bin/env bun

/**
 * Claude Code execution and configuration management script
 *
 * This script performs the following:
 * 1. Merges global configurations into the final Claude configuration
 * 2. Executes Claude Code using Bun with proper environment setup
 *
 * The configuration merge allows defining Claude settings and MCP servers
 * in separate claude.json and mcp.json files, which are then merged into the
 * global ~/.claude.json configuration before Claude Code is launched.
 */

import { die } from "../shared/process.ts";
import { mergeConfigs } from "./config/merge.ts";
import { syncInstructions, cleanupInstructions } from "./instructions.ts";
import { createAndSaveSymlinks, cleanupAgentsSymlinks } from "./symlinks.ts";
import { setupEnv, spawnClaude } from "./spawn.ts";

/**
 * Cleanup all resources after Claude session ends
 * @returns Promise that resolves when cleanup is complete
 */
const cleanup = (): Promise<void> =>
  Promise.all([cleanupInstructions(), cleanupAgentsSymlinks()]).then(() => {});

/**
 * Main execution flow
 */
const main = async () => {
  const [, , ...args] = process.argv;
  const cwd = process.cwd();

  await syncInstructions();
  await mergeConfigs();
  await createAndSaveSymlinks(cwd);
  const env = setupEnv();
  const proc = await spawnClaude(args, env);
  await proc.exited;
  await cleanup();
  process.exit(0);
};

main().catch((err) => cleanup().finally(() => die(err)));
