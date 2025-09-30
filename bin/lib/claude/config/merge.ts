/**
 * Configuration merging utilities
 */

import { fileExists } from "../../shared/fs.ts";
import { safeJsonRead } from "../../shared/json.ts";
import { paths } from "./paths.ts";

/**
 * Merge global configs into final global configuration
 * @returns Promise that resolves when merge is complete or skipped
 */
export const mergeConfigs = (): Promise<void> =>
  (fileExists(paths.claude) &&
    Promise.all([safeJsonRead(paths.global), safeJsonRead(paths.claude)])
      .then(([global, claude]) => ({
        ...global,
        ...claude,
      }))
      .then((merged) =>
        Bun.write(paths.global, JSON.stringify(merged, null, 2)),
      )
      .then(() => {})
      .catch((err) => console.warn(`Config merge failed: ${err}`))) ||
  Promise.resolve();
