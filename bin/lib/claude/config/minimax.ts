/**
 * MiniMax M2 mode configuration for Claude Code
 */

import { createTokenValidator, createProviderEnv } from "./sharedProvider.ts";

/**
 * Check if ANTHROPIC_AUTH_TOKEN is set and non-empty
 * @throws Error if ANTHROPIC_AUTH_TOKEN is missing or empty
 */
export const validateAnthropicToken = createTokenValidator("MiniMax M2 mode");

/**
 * MiniMax M2-specific environment variables (overrides and additions to base Claude config)
 * @readonly
 */
export const minimaxEnv = createProviderEnv({
  name: "MiniMax M2 mode",
  baseUrl: "https://api.minimax.io/anthropic",
  haikuModel: "MiniMax-M2",
  sonnetModel: "MiniMax-M2",
  opusModel: "MiniMax-M2",
});
