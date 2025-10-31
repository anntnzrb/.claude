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
import { createAndSaveSymlinks, cleanupAgentsSymlinks } from "./symlinks.ts";
import { setupEnv, spawnClaude } from "./spawn.ts";
import { validateZaiToken as validateGlmToken, validateMiniMaxToken } from "./config/providers.ts";

/**
 * Cleanup all resources after Claude session ends
 * @returns Promise that resolves when cleanup is complete
 */
const cleanup = (): Promise<void> =>
  Promise.all([cleanupAgentsSymlinks()]).then(() => {});

/**
 * Main execution flow
 */
const main = async () => {
  const [, , ...args] = process.argv;
  const cwd = process.cwd();

  // Check for --glm flag and validate if present
  const glmIndex = args.indexOf("--glm");
  const isGlmMode = glmIndex !== -1;

  // Check for --m2 flag and validate if present
  const m2Index = args.indexOf("--m2");
  const isMiniMaxMode = m2Index !== -1;

  if (isGlmMode) {
    // Remove --glm from args before passing to Claude
    args.splice(glmIndex, 1);
    // Validate ZAI_API_KEY for GLM mode
    validateGlmToken();
  }

  if (isMiniMaxMode) {
    // Recalculate index after potential removal of --glm flag
    const updatedM2Index = args.indexOf("--m2");
    if (updatedM2Index !== -1) {
      // Remove --m2 from args before passing to Claude
      args.splice(updatedM2Index, 1);
      // Validate MINIMAX_API_KEY for MiniMax mode
      validateMiniMaxToken();
    }
  }

  await mergeConfigs();
  await createAndSaveSymlinks(cwd);
  const env = setupEnv(isGlmMode, isMiniMaxMode);
  const proc = await spawnClaude(args, env, isGlmMode, isMiniMaxMode);
  await proc.exited;
  await cleanup();
  process.exit(0);
};

main().catch((err) => cleanup().finally(() => die(err)));
