#!/usr/bin/env bun

/**
 * Claude Code statusline generator
 */

import { existsSync } from "fs";
import { homedir } from "os";
import { basename } from "path";

/**
 * ANSI color codes for terminal formatting
 * @readonly
 */
const colors = {
  /** Dim/faded text color */
  dim: "\x1b[2m",
  /** Cyan color for directory paths */
  cyan: "\x1b[36m",
  /** Green color for added lines */
  green: "\x1b[32m",
  /** Light green color for cost display */
  lightGreen: "\x1b[92m",
  /** Red color for removed lines */
  red: "\x1b[31m",
  /** Reset all formatting */
  reset: "\x1b[0m",
} as const;

/**
 * Log error message to stderr and exit process with failure code
 * @param msg - Error message to display
 * @returns Never returns (process exits)
 */
const die = (msg: string): never => (
  console.error(`Error: ${msg}`),
  process.exit(1)
);

/**
 * Safely read file content, returning empty string on error or missing file
 * @param path - File system path to read
 * @returns Promise resolving to file content or empty string
 */
const safeRead = (path: string) =>
  existsSync(path)
    ? Bun.file(path)
        .text()
        .catch(() => "")
    : Promise.resolve("");

/**
 * Parse JSON input string, filtering out comment lines starting with #
 * @param input - Raw JSON input string that may contain comments
 * @returns Parsed JSON object or empty object on parse error
 */
const parseInput = (input: string) => {
  try {
    return JSON.parse(input.replace(/^#.*/gm, ""));
  } catch {
    return {};
  }
};

/**
 * Log session input to temporary file for debugging
 * @param input - Raw input string to log
 * @param sessionId - Session identifier from parsed data
 * @returns Promise that resolves silently on success or failure
 */
const logSession = (input: string, sessionId: string = "unknown") =>
  Bun.write(
    `/tmp/claude-statusline-${sessionId}.json`,
    `# JSON input captured on ${new Date().toISOString()}\n${input}\n`,
  ).catch(() => {});

/**
 * Get git-aware display path for current directory
 *
 * Attempts to show path relative to git repository root, falling back to
 * home-relative path or truncated path for non-git directories.
 *
 * @param path - Full directory path to format
 * @returns Formatted display path (e.g., "repo/subdir", "~/path", or "parent/dir")
 */
const getDisplayPath = async (path: string): Promise<string> => {
  if (!path) return "";

  try {
    const { stdout } =
      await Bun.$`cd ${path} && git rev-parse --show-toplevel 2>/dev/null`.quiet();
    if (stdout.trim()) {
      const repoRoot = stdout.trim();
      const repoName = basename(repoRoot);
      const relPath = path.replace(repoRoot, "").replace(/^\//, "") || ".";
      return relPath === "." ? repoName : `${repoName}/${relPath}`;
    }
  } catch {}

  return path.startsWith(homedir())
    ? path.replace(homedir(), "") || "~"
    : path.split("/").slice(-2).join("/");
};

/**
 * Count user messages in Claude Code transcript file
 *
 * Counts all messages with type "user" but excludes tool result messages
 * to get accurate count of actual user interactions.
 *
 * @param path - Path to transcript JSON file
 * @returns Promise resolving to number of user messages
 */
const countUserMessages = async (path: string): Promise<number> =>
  path
    ? safeRead(path).then((content) =>
        Math.max(
          0,
          (content.match(/"type":"user"/g)?.length ?? 0) -
            (content.match(/toolUseResult.*?"type":"user"/g)?.length ?? 0),
        ),
      )
    : 0;

/**
 * Build formatted status line with ANSI colors and emojis
 *
 * Creates a comprehensive status display.
 *
 * @param data - Status data object containing model, cwd, costs, etc.
 * @returns Formatted status line string with ANSI escape codes and newline
 */
const buildStatusLine = (data: any) => {
  const model = data.model?.id?.replace(/^claude-/, "") ?? "Claude";
  const style =
    data.output_style?.name !== "default" && data.output_style?.name
      ? ` [${data.output_style.name}]`
      : "";
  const version = data.version ? `[v${data.version}] ` : "";
  const msgCount = data.msgCount > 0 ? ` 💬 ${data.msgCount}` : "";
  const cost =
    data.cost?.total_cost_usd > 0
      ? ` 💰 $${data.cost.total_cost_usd.toFixed(2)}`
      : "";

  const lines = [
    data.cost?.total_lines_added > 0 &&
      `${colors.green}+${data.cost.total_lines_added}${colors.reset}`,
    data.cost?.total_lines_removed > 0 &&
      `${colors.red}-${data.cost.total_lines_removed}${colors.reset}`,
  ].filter(Boolean);

  const linesStr = lines.length > 0 ? ` [${lines.join("/")}]` : "";

  return `${colors.dim}${version}🧠 ${model}${colors.reset} @ ${colors.cyan}📁 ${data.cwd}/${colors.reset}${style}${msgCount}${linesStr}${colors.lightGreen}${cost}${colors.reset}\n`;
};

/**
 * Read JSON input from file argument or stdin
 * @param args - Command line arguments (first arg used as file path if provided)
 * @returns Promise resolving to input text content
 */
const readInput = (args: string[]) =>
  args.length > 0 ? Bun.file(args[0]).text() : new Response(Bun.stdin).text();

/**
 * Main statusline generation pipeline
 *
 * Orchestrates the complete statusline generation process:
 * 1. Parse command line arguments
 * 2. Read input from file or stdin
 * 3. Parse JSON data with comment filtering
 * 4. Concurrently fetch display path and message count
 * 5. Build and output formatted status line
 *
 * @returns Promise that resolves when status line is written to stdout
 */
const main = () => {
  const [, , ...args] = process.argv;

  return readInput(args)
    .then(async (input) => {
      const data = parseInput(input);
      logSession(input, data.session_id);

      const [cwd, msgCount] = await Promise.all([
        getDisplayPath(
          data.workspace?.current_dir ?? data.cwd ?? process.cwd(),
        ),
        countUserMessages(data.transcript_path ?? ""),
      ]);
      return { ...data, cwd, msgCount };
    })
    .then(buildStatusLine)
    .then(process.stdout.write.bind(process.stdout));
};

main().catch(die);
