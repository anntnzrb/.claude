/**
 * File system utilities with safe error handling
 */

import { existsSync } from "fs";

/**
 * Safe file read with fallback to empty string on error
 * @param path - File system path to read from
 * @returns Promise resolving to file content or empty string on error
 */
export const safeRead = (path: string): Promise<string> =>
  existsSync(path)
    ? Bun.file(path)
        .text()
        .catch(() => "")
    : Promise.resolve("");

/**
 * Safe file write with fallback to void on error
 * @param path - File system path to write to
 * @param content - Content to write
 * @returns Promise resolving to void or logging warning on error
 */
export const safeWrite = (path: string, content: string): Promise<void> =>
  Bun.write(path, content)
    .then(() => {})
    .catch((err) => {
      console.warn(`File write failed: ${err}`);
    });

/**
 * Safe file deletion with silent error handling
 * @param path - File system path to delete
 * @returns Promise that resolves when deletion completes or fails silently
 */
export const safeDelete = (path: string): Promise<void> =>
  existsSync(path)
    ? Bun.file(path)
        .delete()
        .then(() => {})
        .catch(() => {})
    : Promise.resolve();

/**
 * Parse JSONL file with custom line processor
 * @param path - Path to JSONL file
 * @param parseLine - Function to parse and filter each line
 * @returns Promise resolving to array of parsed results
 */
export const parseJsonlFile = async <T>(
  path: string,
  parseLine: (data: any) => T | null,
): Promise<T[]> => {
  const content = await safeRead(path);
  if (!content) return [];

  const results = await Promise.all(
    content
      .split("\n")
      .filter((line) => line.trim())
      .map((line) =>
        Promise.resolve(line)
          .then(JSON.parse)
          .then(parseLine)
          .catch(() => null),
      ),
  );

  return results.filter((r): r is T => r !== null);
};
