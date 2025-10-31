/**
 * MiniMax M2 mode configuration for Claude Code
 */

import { createTokenValidator, createProviderEnv } from "./sharedProvider.ts";

/**
 * Check if MINIMAX_API_KEY is set and non-empty
 * @throws Error if MINIMAX_API_KEY is missing or empty
 */
export const validateMiniMaxToken = createTokenValidator(
  "MiniMax M2 mode",
  "MINIMAX_API_KEY",
);

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
