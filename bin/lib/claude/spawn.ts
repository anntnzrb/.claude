/**
 * Claude Code process spawning
 */

import { safeRead } from "../shared/fs.ts";
import { safeJsonRead } from "../shared/json.ts";
import type { EnvironmentConfig, McpServer } from "./types.ts";
import { claudeCmd } from "./config/env.ts";
import {
  glmEnv,
  minimaxEnv,
  chutesEnv,
  createChutesEnvWithModel,
} from "./config/providers.ts";
import { paths } from "./config/paths.ts";
import { buildMcpServers } from "./config/mcp.ts";

/**
 * Conditionally spread an object if condition is true
 * @param condition - Boolean condition to check
 * @param env - Object to spread if condition is true
 * @returns Object if condition is true, empty object otherwise
 */
const conditional = (condition: boolean, env: object): object =>
  condition ? env : {};

/**
 * Create environment object with Claude variables and development flags
 * @param isGlmMode - Whether GLM mode is enabled
 * @param isMiniMaxMode - Whether MiniMax M2 mode is enabled
 * @param isChutesMode - Whether Chutes mode is enabled
 * @param chutesModel - Optional custom model for Chutes mode
 * @returns Environment object for Claude Code execution
 */
export const setupEnv = (
  isGlmMode = false,
  isMiniMaxMode = false,
  isChutesMode = false,
  chutesModel?: string,
): EnvironmentConfig => ({
  ...process.env,
  ...conditional(isGlmMode, glmEnv),
  ...conditional(isMiniMaxMode, minimaxEnv),
  ...conditional(
    isChutesMode,
    chutesModel ? createChutesEnvWithModel(chutesModel) : chutesEnv,
  ),
  // Map provider-specific API keys to ANTHROPIC_AUTH_TOKEN
  ...conditional(isGlmMode && process.env.ZAI_API_KEY, {
    ANTHROPIC_AUTH_TOKEN: process.env.ZAI_API_KEY,
  }),
  ...conditional(isMiniMaxMode && process.env.MINIMAX_API_KEY, {
    ANTHROPIC_AUTH_TOKEN: process.env.MINIMAX_API_KEY,
  }),
  ...conditional(isChutesMode && process.env.CHUTES_API_KEY, {
    ANTHROPIC_AUTH_TOKEN: process.env.CHUTES_API_KEY,
  }),
});

/**
 * Spawn Claude with provided arguments
 * @param args - Command line arguments to pass to Claude Code
 * @param env - Environment configuration
 * @param isGlmMode - Whether GLM mode is enabled
 * @param isMiniMaxMode - Whether MiniMax M2 mode is enabled
 * @param isChutesMode - Whether Chutes mode is enabled
 * @returns Spawned Claude process
 */
export const spawnClaude = async (
  args: string[],
  env: EnvironmentConfig,
  isGlmMode = false,
  isMiniMaxMode = false,
  isChutesMode = false,
): Promise<Subprocess> => {
  const mcpResult = await safeJsonRead<McpServer[]>(paths.mcp);
  const mcpArray = Array.isArray(mcpResult) ? mcpResult : [];
  const mcpServers = buildMcpServers(mcpArray);

  const claudeArgs = [
    ...args,
    ...(Object.keys(mcpServers).length > 0
      ? ["--mcp-config", JSON.stringify({ mcpServers }), "--strict-mcp-config"]
      : []),
  ];

  return Bun.spawn([...claudeCmd, ...claudeArgs], {
    env,
    stdio: ["inherit", "inherit", "inherit"],
  });
};
