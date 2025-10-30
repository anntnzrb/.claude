/**
 * Shared provider configuration for Claude Code
 *
 * This module provides generic functions for creating provider-specific
 * configurations, reducing code duplication between different provider integrations.
 */

import type { EnvironmentConfig } from "../types.ts";

export interface ProviderConfig {
  name: string;
  baseUrl: string;
  haikuModel: string;
  sonnetModel: string;
  opusModel: string;
}

/**
 * Create a token validation function for a specific provider
 * @param providerName - Name of the provider (for error messages)
 * @returns Validation function that checks for ANTHROPIC_AUTH_TOKEN
 */
export const createTokenValidator = (providerName: string) => {
  return (): void => {
    const token = process.env.ANTHROPIC_AUTH_TOKEN;
    if (!token || token.trim() === "") {
      throw new Error(
        `ANTHROPIC_AUTH_TOKEN environment variable is required for ${providerName} but is not set or is empty`,
      );
    }
  };
};

/**
 * Create provider-specific environment configuration
 * @param config - Provider configuration with name, base URL, and model names
 * @returns Environment configuration object
 */
export const createProviderEnv = (config: ProviderConfig): EnvironmentConfig =>
  ({
    ANTHROPIC_BASE_URL: config.baseUrl,
    API_TIMEOUT_MS: "3000000",
    ANTHROPIC_DEFAULT_HAIKU_MODEL: config.haikuModel,
    ANTHROPIC_DEFAULT_SONNET_MODEL: config.sonnetModel,
    ANTHROPIC_DEFAULT_OPUS_MODEL: config.opusModel,
  }) as const;
