#!/usr/bin/env bun

/**
 * Claude Code execution and configuration management script
 *
 * This script performs the following:
 * 1. Merges local project configurations into the global Claude configuration
 * 2. Executes Claude Code using Bun with proper environment setup
 *
 * The configuration merge allows defining Claude settings (such as MCP servers
 * amongst others) in a local claude.json file, which are then merged into the
 * global ~/.claude.json configuration before Claude Code is launched.
 */

import { existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

/** ***
 * Core utilities
 * *** **/

/**
 * Log error message to stderr and exit process with failure code
 * @param msg - Error message to display
 * @returns Never returns (process exits)
 */
const die = (msg: string): never => (
  console.error(`Error: ${msg}`),
  process.exit(1)
);

/**
 * Safely read and parse JSON configuration file
 * @param path - File system path to JSON file
 * @returns Promise resolving to parsed JSON object or empty object on error
 */
const safeJson = (path: string) =>
  existsSync(path)
    ? Bun.file(path)
        .json()
        .catch(() => ({}))
    : {};

/** ***
 * Configuration constants
 * *** **/

/**
 * File system paths for Claude configuration files
 * @readonly
 */
const paths = {
  /** Project-local configuration file path */
  local: join(homedir(), ".claude", "claude.json"),
  /** Global Claude configuration file path */
  global: join(homedir(), ".claude.json"),
};

/**
 * Environment variables to disable non-essential Claude features
 * @readonly
 */
const claudeEnv = {
  DISABLE_AUTOUPDATER: "1",
  CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
  DISABLE_NON_ESSENTIAL_MODEL_CALLS: "1",
  DISABLE_TELEMETRY: "1",
} as const;

/**
 * Claude Code execution command components
 * @readonly
 */
const claudeCmd = [
  "bun",
  "x",
  "--bun",
  "@anthropic-ai/claude-code@latest",
  "--dangerously-skip-permissions",
] as const;

/** ***
 * Core Claude Code functionality
 * *** **/

/**
 * Merge local project configs into global configuration
 * @returns Promise that resolves when merge is complete or skipped
 */
const mergeConfigs = () =>
  (existsSync(paths.local) &&
    Promise.all([safeJson(paths.global), safeJson(paths.local)])
      .then(([global, local]) => ({ ...global, ...local }))
      .then((merged) =>
        Bun.write(paths.global, JSON.stringify(merged, null, 2)),
      )
      .catch((err) => console.warn(`Config merge failed: ${err}`))) ||
  Promise.resolve();

/**
 * Create environment object with Claude variables and development flags removed
 * @returns Environment object for Claude Code execution
 */
const setupEnv = () => ({ ...process.env, ...claudeEnv, DEV: undefined });

/**
 * Spawn Claude with provided arguments
 * @param args - Command line arguments to pass to Claude Code
 * @returns Function that takes environment and spawns Claude process
 */
const spawnClaude = (args: string[]) => (env: Record<string, any>) =>
  Bun.spawn([...claudeCmd, ...args], {
    env,
    stdio: ["inherit", "inherit", "inherit"],
  });

/** ***
 * Main
 * *** **/

const [, , ...args] = process.argv;

mergeConfigs()
  .then(() => setupEnv())
  .then(spawnClaude(args))
  .then((proc) => proc.exited)
  .then(process.exit)
  .catch(die);
