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
 * Check if file exists at given path
 * @param path - File system path to check
 * @returns True if file exists, false otherwise
 */
export const fileExists = (path: string): boolean => existsSync(path);
