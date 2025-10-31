/**
 * Provider registry for Claude Code
 *
 * Consolidates GLM/Z.ai and MiniMax M2 provider configurations into a single registry,
 * reducing code duplication from having separate provider files.
 */

import type { EnvironmentConfig } from "../types.ts";

export interface ProviderConfig {
  name: string;
  baseUrl: string;
  haikuModel: string;
  sonnetModel: string;
  opusModel: string;
  apiKeyEnvVar: string;
  tokenValidator: () => void;
  env: EnvironmentConfig;
}

/**
 * Create a token validation function for a provider
 */
const createTokenValidator = (providerName: string, envVarName: string) => {
  return (): void => {
    const token = process.env[envVarName];
    if (!token || token.trim() === "") {
      throw new Error(
        `${envVarName} environment variable is required for ${providerName} but is not set or is empty`,
      );
    }
  };
};

/**
 * Create provider-specific environment configuration
 */
const createProviderEnv = (config: ProviderConfig): EnvironmentConfig =>
  ({
    ANTHROPIC_BASE_URL: config.baseUrl,
    API_TIMEOUT_MS: "3000000",
    ANTHROPIC_DEFAULT_HAIKU_MODEL: config.haikuModel,
    ANTHROPIC_DEFAULT_SONNET_MODEL: config.sonnetModel,
    ANTHROPIC_DEFAULT_OPUS_MODEL: config.opusModel,
  }) as const;

/**
 * Provider registry
 */
export const providers = {
  glm: {
    name: "GLM mode",
    baseUrl: "https://api.z.ai/api/anthropic",
    haikuModel: "glm-4.5-air",
    sonnetModel: "glm-4.6",
    opusModel: "glm-4.6",
    apiKeyEnvVar: "ZAI_API_KEY",
    tokenValidator: createTokenValidator("GLM mode", "ZAI_API_KEY"),
    env: {} as EnvironmentConfig,
  },
  minimax: {
    name: "MiniMax M2 mode",
    baseUrl: "https://api.minimax.io/anthropic",
    haikuModel: "MiniMax-M2",
    sonnetModel: "MiniMax-M2",
    opusModel: "MiniMax-M2",
    apiKeyEnvVar: "MINIMAX_API_KEY",
    tokenValidator: createTokenValidator("MiniMax M2 mode", "MINIMAX_API_KEY"),
    env: {} as EnvironmentConfig,
  },
};

// Initialize env for each provider
providers.glm.env = createProviderEnv(providers.glm);
providers.minimax.env = createProviderEnv(providers.minimax);

// Export named exports for backwards compatibility
export const glmEnv = providers.glm.env;
export const minimaxEnv = providers.minimax.env;

export const validateZaiToken = providers.glm.tokenValidator;
export const validateMiniMaxToken = providers.minimax.tokenValidator;
