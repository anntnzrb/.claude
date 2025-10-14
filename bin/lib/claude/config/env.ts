/**
 * Claude Code environment configuration
 */

import type { EnvironmentConfig } from "../types.ts";
import { glmEnv } from "./glm.ts";

/**
 * Environment variables to disable non-essential Claude features
 * @readonly
 */
export const claudeEnv: EnvironmentConfig = {
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
} as const;

/**
 * Claude Code execution command components
 * @readonly
 */
export const claudeCmd = [
  "bun",
  "x",
  "--bun",
  "@anthropic-ai/claude-code@latest",
] as const;
