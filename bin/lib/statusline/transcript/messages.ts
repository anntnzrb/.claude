/**
 * User message counting utilities
 */

import { safeRead } from "../../shared/fs.ts";

/**
 * Check if entry represents a quota-relevant user message
 * @param line - JSONL line to parse and validate
 * @returns Promise resolving to true if entry is a user message that counts toward quota
 */
const isUserMessage = (line: string): Promise<boolean> =>
  Promise.resolve(line)
    .then(JSON.parse)
    .then((entry) => {
      const msg = entry.message?.content || "";
      return (
        entry.type === "user" &&
        !entry.toolUseResult &&
        !entry.isMeta &&
        ![
          "<command-name>",
          "<local-command-stdout>",
          "Caveat: The messages below",
        ].some((pattern) => msg.includes(pattern))
      );
    })
    .catch(() => false);

/**
 * Count actual user messages in Claude Code transcript file
 *
 * Parses JSONL transcript and counts only messages that are relevant for quota tracking.
 * Filters out tool results, meta messages, and system-generated content.
 *
 * @param path - Path to transcript JSONL file
 * @returns Promise resolving to number of quota-relevant user messages
 */
export const countUserMessages = async (path: string): Promise<number> =>
  path
    ? safeRead(path)
        .then((content) => content.split("\n").filter((line) => line.trim()))
        .then((lines) => Promise.all(lines.map(isUserMessage)))
        .then((results) => results.filter(Boolean).length)
    : 0;
