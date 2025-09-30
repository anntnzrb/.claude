/**
 * AGENTS.md symlink management
 */

import { dirname, join } from "path";
import { fileExists, safeDelete } from "../shared/fs.ts";
import { safeJsonRead, safeJsonWrite } from "../shared/json.ts";

/**
 * Find all AGENTS.md files recursively from current directory
 * @param cwd - Current working directory to search from
 * @returns Promise resolving to array of AGENTS.md file paths
 */
const findAgentsMdFiles = async (cwd: string): Promise<string[]> =>
  Bun.$`find ${cwd} -type f -name "AGENTS.md" 2>/dev/null`
    .quiet()
    .then(({ stdout }) =>
      stdout
        .toString()
        .trim()
        .split("\n")
        .filter(Boolean),
    )
    .catch(() => []);

/**
 * Create CLAUDE.md symlinks next to each AGENTS.md file
 * @param cwd - Current working directory to search from
 * @returns Promise resolving to array of created symlink paths
 */
export const createAgentsSymlinks = async (cwd: string): Promise<string[]> => {
  const agentsFiles = await findAgentsMdFiles(cwd);
  const created: string[] = [];

  for (const agentsMdPath of agentsFiles) {
    const dir = dirname(agentsMdPath);
    const claudeMdPath = join(dir, "CLAUDE.md");

    if (fileExists(claudeMdPath)) continue;

    try {
      await Bun.$`ln -s AGENTS.md ${claudeMdPath}`.quiet();
      created.push(claudeMdPath);
    } catch (err) {
      console.warn(`Failed to symlink: ${claudeMdPath}`);
    }
  }

  return created;
};

/**
 * Save manifest of created symlinks for cleanup
 * @param symlinks - Array of symlink paths to save
 * @returns Promise that resolves when manifest is saved
 */
export const saveSymlinkManifest = (symlinks: string[]): Promise<void> => {
  const manifestPath = `/tmp/claude-symlinks-${process.pid}.json`;
  return safeJsonWrite(manifestPath, symlinks);
};

/**
 * Cleanup symlinks created from AGENTS.md files
 * @returns Promise that resolves when all symlinks are removed
 */
export const cleanupAgentsSymlinks = async (): Promise<void> => {
  const manifestPath = `/tmp/claude-symlinks-${process.pid}.json`;
  if (!fileExists(manifestPath)) return;

  const symlinks = (await safeJsonRead<string[]>(manifestPath)) || [];
  await Promise.all(symlinks.map(safeDelete));
  await safeDelete(manifestPath);
};
