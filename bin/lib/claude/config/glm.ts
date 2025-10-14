/**
 * GLM mode configuration for Claude Code
 */

import type { EnvironmentConfig } from "../types.ts";

/**
 * Check if ANTHROPIC_AUTH_TOKEN is set and non-empty
 * @throws Error if ANTHROPIC_AUTH_TOKEN is missing or empty
 */
export const validateAnthropicToken = (): void => {
  const token = process.env.ANTHROPIC_AUTH_TOKEN;
  if (!token || token.trim() === "") {
    throw new Error(
      "ANTHROPIC_AUTH_TOKEN environment variable is required for GLM mode but is not set or is empty",
    );
  }
};

/**
 * GLM-specific environment variables (overrides and additions to base Claude config)
 * @readonly
 */
export const glmEnv: EnvironmentConfig = {
  ANTHROPIC_BASE_URL: "https://api.z.ai/api/anthropic",
  API_TIMEOUT_MS: "3000000",
  ANTHROPIC_DEFAULT_HAIKU_MODEL: "glm-4.5-air",
  ANTHROPIC_DEFAULT_SONNET_MODEL: "glm-4.6",
  ANTHROPIC_DEFAULT_OPUS_MODEL: "glm-4.6",
} as const;
