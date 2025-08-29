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
 * Types
 * *** **/

/**
 * MCP server configuration with connection details
 */
interface McpServer {
  name: string;
  command?: string;
  url?: string;
  disabled?: boolean;
}

/**
 * Map of server names to their configurations
 */
type McpServersMap = Record<string, Omit<McpServer, "name">>;

/**
 * Environment variables configuration
 */
type EnvironmentConfig = Record<string, string | number>;

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
const safeJson = (path: string): Promise<unknown> =>
  existsSync(path)
    ? Bun.file(path)
        .json()
        .catch(() => ({}))
    : Promise.resolve({});

/** ***
 * Configuration constants
 * *** **/

/**
 * Claude home directory path
 * @readonly
 */
const CLAUDE_HOME = join(homedir(), ".claude");

/**
 * File system paths for Claude configuration files
 * @readonly
 */
const paths = {
  /** Global Claude configuration file path */
  claude: join(CLAUDE_HOME, "claude.json"),
  /** Global MCP servers configuration file path */
  mcp: join(CLAUDE_HOME, "mcp.json"),
  /** Final merged global configuration file path */
  global: join(homedir(), ".claude.json"),
  /** Auto Plan Mode system prompt file path */
  autoPlanMode: join(CLAUDE_HOME, "bin", "lib", "auto-plan-mode.in"),
};

/**
 * Environment variables to disable non-essential Claude features
 * @readonly
 */
const claudeEnv: EnvironmentConfig = {
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
] as const;

/** ***
 * Core Claude Code functionality
 * *** **/

/**
 * Build mcpServers object from array of server configurations
 *
 * Transforms user-friendly config format to Claude's expected format:
 * - If has `command`: splits "docker mcp run" → command: "docker", args: ["mcp", "run"], type: "stdio"
 * - If has `url`: passes through as type: "http" server
 *
 * @param mcpArray - Array of MCP server configurations
 * @returns Object with server names as keys and configs as values
 */
const buildMcpServers = (mcpArray: McpServer[]): McpServersMap =>
  mcpArray
    .filter((server) => !server.disabled)
    .reduce((acc, { name, command, url, disabled, ...rest }) => {
      const parts = command?.split(" ") || [];
      return {
        ...acc,
        [name]: {
          ...rest,
          ...(command && {
            type: "stdio",
            command: parts[0], // first part is the command
            args: parts.slice(1), // all arguments after the command
          }),
          ...(url && { type: "http", url }),
        },
      };
    }, {});

/**
 * Merge global configs into final global configuration
 * @returns Promise that resolves when merge is complete or skipped
 */
const mergeConfigs = (): Promise<void> =>
  (existsSync(paths.claude) &&
    Promise.all([safeJson(paths.global), safeJson(paths.claude)])
      .then(([global, claude]) => ({
        ...global,
        ...claude,
      }))
      .then((merged) =>
        Bun.write(paths.global, JSON.stringify(merged, null, 2)),
      )
      .then(() => {})
      .catch((err) => console.warn(`Config merge failed: ${err}`))) ||
  Promise.resolve();

/**
 * Create environment object with Claude variables and development flags
 * @returns Environment object for Claude Code execution
 */
const setupEnv = (): EnvironmentConfig => ({ ...process.env, ...claudeEnv });

/**
 * Spawn Claude with provided arguments
 * @param args - Command line arguments to pass to Claude Code
 * @returns Function that takes environment and spawns Claude process
 */
const spawnClaude = (args: string[]) => async (env: EnvironmentConfig) => {
  const prompt = await Bun.file(paths.autoPlanMode).text();
  const mcpArray = (await safeJson(paths.mcp)) as McpServer[];
  const mcpServers = buildMcpServers(mcpArray);

  const claudeArgs = [
    ...args,
    "--append-system-prompt",
    `${prompt}`,
    ...(Object.keys(mcpServers).length > 0
      ? ["--mcp-config", JSON.stringify({ mcpServers }), "--strict-mcp-config"]
      : []),
  ];

  return Bun.spawn([...claudeCmd, ...claudeArgs], {
    env,
    stdio: ["inherit", "inherit", "inherit"],
  });
};

/** ***
 * Main
 * *** **/

const [, , ...args] = process.argv;

mergeConfigs()
  .then(() => setupEnv())
  .then(async (env) => spawnClaude(args)(env))
  .then((proc) => proc.exited)
  .then(process.exit)
  .catch(die);
