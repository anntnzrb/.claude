/**
 * Token metrics extraction from transcript
 */

import { safeRead } from "../../shared/fs.ts";
import type { TokenMetrics } from "../types.ts";

/**
 * Parse line to extract data, returning empty array on error
 * @param line - JSONL line to parse
 * @returns Promise resolving to array with data or empty array
 */
const parseLineForMetrics = (line: string): Promise<any[]> =>
  Promise.resolve(line)
    .then(JSON.parse)
    .then((data) =>
      data.message?.usage && data.isSidechain !== true && data.timestamp
        ? [data]
        : [],
    )
    .catch(() => []);

/**
 * Get token metrics from Claude Code transcript file
 *
 * Parses JSONL transcript to find the most recent main chain message
 * and returns token metrics including context length.
 *
 * @param path - Path to transcript JSONL file
 * @returns Promise resolving to token metrics
 */
export const getTokenMetrics = async (path: string): Promise<TokenMetrics> =>
  path
    ? safeRead(path)
        .then((content) =>
          content
            .split("\n")
            .filter((line) => line.trim() && line.startsWith("{")),
        )
        .then((lines) => Promise.all(lines.map(parseLineForMetrics)))
        .then((results) => results.flat())
        .then((entries) =>
          entries.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          ),
        )
        .then((sortedEntries) => sortedEntries.at(-1))
        .then((entry) => ({
          contextLength: entry?.message?.usage
            ? (entry.message.usage.input_tokens || 0) +
              (entry.message.usage.cache_read_input_tokens || 0) +
              (entry.message.usage.cache_creation_input_tokens || 0)
            : 0,
        }))
    : Promise.resolve({ contextLength: 0 });
