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
import { dirname, join } from "path";

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
  env?: EnvironmentConfig;
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

/**
 * Safe file read with fallback to empty string on error
 * @param path - File system path to read from
 * @returns Promise resolving to file content or empty string on error
 */
const safeRead = (path: string): Promise<string> =>
  existsSync(path)
    ? Bun.file(path)
        .text()
        .catch(() => "")
    : Promise.resolve("");

/**
 * Safe file write with fallback to void on error
 * @param path - File system path to write to
 * @param content - Content to write
 * @returns Promise resolving to void or logging warning on error
 */
const safeWrite = (path: string, content: string): Promise<void> =>
  Bun.write(path, content)
    .then(() => {})
    .catch((err) => {
      console.warn(`File write failed: ${err}`);
    });

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
  /** Centralized LLM instructions source file path */
  instructionsSource: join(homedir(), ".config", "agents", "instructions.md"),
  /** Target CLAUDE.md file path */
  instructionsTarget: join(CLAUDE_HOME, "CLAUDE.md"),
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
    .reduce((acc, { name, command, url, env, disabled, ...rest }) => {
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
          ...(env && { env }),
        },
      };
    }, {});

/**
 * Sync centralized instructions to CLAUDE.md
 * @returns Promise that resolves when sync is complete or skipped
 */
const syncInstructions = (): Promise<void> =>
  !existsSync(paths.instructionsSource)
    ? Promise.resolve()
    : safeRead(paths.instructionsSource).then((content) =>
        safeWrite(paths.instructionsTarget, content),
      );

/**
 * Find all AGENTS.md files recursively from current directory
 * @param cwd - Current working directory to search from
 * @returns Promise resolving to array of AGENTS.md file paths
 */
const findAgentsMdFiles = async (cwd: string): Promise<string[]> =>
  Bun.$`find ${cwd} -type f -name "AGENTS.md" 2>/dev/null`
    .quiet()
    .then(({ stdout }) =>
      stdout
        .toString()
        .trim()
        .split("\n")
        .filter(Boolean),
    )
    .catch(() => []);

/**
 * Create CLAUDE.md symlinks next to each AGENTS.md file
 * @param cwd - Current working directory to search from
 * @returns Promise resolving to array of created symlink paths
 */
const createAgentsSymlinks = async (cwd: string): Promise<string[]> => {
  const agentsFiles = await findAgentsMdFiles(cwd);
  const created: string[] = [];

  for (const agentsMdPath of agentsFiles) {
    const dir = dirname(agentsMdPath);
    const claudeMdPath = join(dir, "CLAUDE.md");

    if (existsSync(claudeMdPath)) continue;

    try {
      await Bun.$`ln -s AGENTS.md ${claudeMdPath}`.quiet();
      created.push(claudeMdPath);
    } catch (err) {
      console.warn(`Failed to symlink: ${claudeMdPath}`);
    }
  }

  return created;
};

/**
 * Save manifest of created symlinks for cleanup
 * @param symlinks - Array of symlink paths to save
 * @returns Promise that resolves when manifest is saved
 */
const saveSymlinkManifest = (symlinks: string[]): Promise<void> => {
  const manifestPath = `/tmp/claude-symlinks-${process.pid}.json`;
  return Bun.write(manifestPath, JSON.stringify(symlinks, null, 2))
    .then(() => {})
    .catch(() => {});
};

/**
 * Cleanup symlinks created from AGENTS.md files
 * @returns Promise that resolves when all symlinks are removed
 */
const cleanupAgentsSymlinks = async (): Promise<void> => {
  const manifestPath = `/tmp/claude-symlinks-${process.pid}.json`;
  if (!existsSync(manifestPath)) return;

  const symlinks = (await safeJson(manifestPath)) as string[];
  await Promise.all(
    symlinks.map((link) =>
      existsSync(link)
        ? Bun.file(link)
            .delete()
            .catch(() => {})
        : Promise.resolve(),
    ),
  );

  await Bun.file(manifestPath)
    .delete()
    .catch(() => {});
};

/**
 * Cleanup CLAUDE.md file and AGENTS.md symlinks after session ends
 * @returns Promise that resolves when cleanup is complete or skipped
 */
const cleanupInstructions = (): Promise<void> =>
  Promise.all([
    existsSync(paths.instructionsTarget)
      ? Bun.file(paths.instructionsTarget)
          .delete()
          .then(() => {})
          .catch(() => {})
      : Promise.resolve(),
    cleanupAgentsSymlinks(),
  ]).then(() => {});

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
const cwd = process.cwd();

syncInstructions()
  .then(() => mergeConfigs())
  .then(() => createAgentsSymlinks(cwd))
  .then((symlinks) => saveSymlinkManifest(symlinks))
  .then(() => setupEnv())
  .then(async (env) => spawnClaude(args)(env))
  .then((proc) => proc.exited)
  .then(() => cleanupInstructions())
  .then(process.exit)
  .catch((err) => cleanupInstructions().finally(() => die(err)));
