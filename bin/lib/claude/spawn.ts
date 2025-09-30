/**
 * Claude Code process spawning
 */

import { safeJsonRead } from "../shared/json.ts";
import type { EnvironmentConfig, McpServer } from "./types.ts";
import { claudeEnv, claudeCmd } from "./config/env.ts";
import { paths } from "./config/paths.ts";
import { buildMcpServers } from "./config/mcp.ts";

/**
 * Create environment object with Claude variables and development flags
 * @returns Environment object for Claude Code execution
 */
export const setupEnv = (): EnvironmentConfig => ({
  ...process.env,
  ...claudeEnv,
});

/**
 * Spawn Claude with provided arguments
 * @param args - Command line arguments to pass to Claude Code
 * @returns Function that takes environment and spawns Claude process
 */
export const spawnClaude =
  (args: string[]) => async (env: EnvironmentConfig) => {
    const prompt = await Bun.file(paths.autoPlanMode).text();
    const mcpArray = (await safeJsonRead<McpServer[]>(paths.mcp)) || [];
    const mcpServers = buildMcpServers(mcpArray);

    const claudeArgs = [
      ...args,
      "--append-system-prompt",
      `${prompt}`,
      ...(Object.keys(mcpServers).length > 0
        ? [
            "--mcp-config",
            JSON.stringify({ mcpServers }),
            "--strict-mcp-config",
          ]
        : []),
    ];

    return Bun.spawn([...claudeCmd, ...claudeArgs], {
      env,
      stdio: ["inherit", "inherit", "inherit"],
    });
  };
