/**
 * Instructions file synchronization and cleanup
 */

import { fileExists, safeRead, safeWrite, safeDelete } from "../shared/fs.ts";
import { paths } from "./config/paths.ts";

/**
 * Sync centralized instructions to CLAUDE.md
 * @returns Promise that resolves when sync is complete or skipped
 */
export const syncInstructions = (): Promise<void> =>
  !fileExists(paths.instructionsSource)
    ? Promise.resolve()
    : safeRead(paths.instructionsSource).then((content) =>
        safeWrite(paths.instructionsTarget, content),
      );

/**
 * Cleanup CLAUDE.md file after session ends
 * @returns Promise that resolves when cleanup is complete or skipped
 */
export const cleanupInstructions = (): Promise<void> =>
  safeDelete(paths.instructionsTarget);
