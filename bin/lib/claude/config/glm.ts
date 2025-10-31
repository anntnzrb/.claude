/**
 * GLM mode configuration for Claude Code
 */

import { createTokenValidator, createProviderEnv } from "./sharedProvider.ts";

/**
 * Check if ZAI_API_KEY is set and non-empty
 * @throws Error if ZAI_API_KEY is missing or empty
 */
export const validateZaiToken = createTokenValidator("GLM mode", "ZAI_API_KEY");

/**
 * GLM-specific environment variables (overrides and additions to base Claude config)
 * @readonly
 */
export const glmEnv = createProviderEnv({
  name: "GLM mode",
  baseUrl: "https://api.z.ai/api/anthropic",
  haikuModel: "glm-4.5-air",
  sonnetModel: "glm-4.6",
  opusModel: "glm-4.6",
});
