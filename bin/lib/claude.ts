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
  /** Global Claude configuration file path */
  claude: join(homedir(), ".claude", "claude.json"),
  /** Global MCP servers configuration file path */
  mcp: join(homedir(), ".claude", "mcp.json"),
  /** Final merged global configuration file path */
  global: join(homedir(), ".claude.json"),
};

/**
 * Environment variables to disable non-essential Claude features
 * @readonly
 */
const claudeEnv: Record<string, string | number> = {
  CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR: 1,
  CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: 1,
  DEV: 1,
  DISABLE_AUTOUPDATER: 1,
  DISABLE_BUG_COMMAND: 1,
  DISABLE_DOCTOR_COMMAND: 1,
  DISABLE_INSTALL_GITHUB_APP_COMMAND: 1,
  DISABLE_LOGIN_COMMAND: 1,
  DISABLE_LOGOUT_COMMAND: 1,
  DISABLE_MIGRATE_INSTALLER_COMMAND: 1,
  DISABLE_NON_ESSENTIAL_MODEL_CALLS: 1,
  DISABLE_TELEMETRY: 1,
  DISABLE_UPGRADE_COMMAND: 1,
  USE_BUILTIN_RIPGREP: 1,
};

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
 * Merge global configs into final global configuration
 * @returns Promise that resolves when merge is complete or skipped
 */
const mergeConfigs = () =>
  ((existsSync(paths.claude) || existsSync(paths.mcp)) &&
    Promise.all([safeJson(paths.global), safeJson(paths.claude), safeJson(paths.mcp)])
      .then(([global, claude, mcp]) => ({ ...global, ...claude, ...mcp }))
      .then((merged) =>
        Bun.write(paths.global, JSON.stringify(merged, null, 2)),
      )
      .catch((err) => console.warn(`Config merge failed: ${err}`))) ||
  Promise.resolve();

/**
 * Create environment object with Claude variables and development flags
 * @returns Environment object for Claude Code execution
 */
const setupEnv = () => ({ ...process.env, ...claudeEnv });

/**
 * Spawn Claude with provided arguments
 * @param args - Command line arguments to pass to Claude Code
 * @returns Function that takes environment and spawns Claude process
 */
const spawnClaude = (args: string[]) => (env: Record<string, string | number>) =>
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
