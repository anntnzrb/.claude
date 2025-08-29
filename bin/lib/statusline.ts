#!/usr/bin/env bun

/**
 * Claude Code statusline generator
 */

import { existsSync } from "fs";
import { homedir } from "os";
import { basename } from "path";

/**
 * Domain model interfaces
 */

/** Claude model information */
interface ModelInfo {
  readonly id: string;
  readonly display_name: string;
}

/** Workspace directory paths */
interface WorkspaceInfo {
  readonly current_dir: string;
  readonly project_dir: string;
}

/** Output style configuration */
interface OutputStyle {
  readonly name: string;
}

/** Session cost and performance metrics */
interface CostInfo {
  readonly total_cost_usd: number;
  readonly total_duration_ms: number;
  readonly total_api_duration_ms: number;
}

/** Token context metrics */
interface TokenMetrics {
  readonly contextLength: number;
}

/** Complete Claude Code session data */
interface StatusLineData {
  readonly session_id: string;
  readonly transcript_path: string;
  readonly cwd: string;
  readonly model: ModelInfo;
  readonly workspace: WorkspaceInfo;
  readonly version: string;
  readonly output_style: OutputStyle;
  readonly cost: CostInfo;
  readonly exceeds_200k_tokens: boolean;
}

/** Extended data with computed fields */
interface EnrichedStatusLineData extends StatusLineData {
  readonly msgCount: number;
  readonly tokenMetrics: TokenMetrics;
}

/**
 * Domain formatting utilities
 */
const formatters = {
  model: (model: ModelInfo) => model.display_name || "Claude",
  version: (version?: string) => (version ? `[v${version}]` : ""),
  style: (style: OutputStyle) =>
    style.name === "default" ? "🗣️ [Def]" : `🗣️ [${style.name}]`,
  cost: (cost: CostInfo) =>
    cost.total_cost_usd > 0 ? `💰 $${cost.total_cost_usd.toFixed(2)}` : "",
  contextWarning: (exceeds200k: boolean) => (exceeds200k ? "⚠️ 200k+" : ""),
  messageCount: (count: number) => (count > 0 ? `💬 ${count}` : ""),
  contextLength: (tokens: TokenMetrics) =>
    tokens.contextLength > 0
      ? `💾 ${Math.round(tokens.contextLength / 1000)}k`
      : "",
} as const;

/**
 * ANSI color codes for terminal formatting
 * @readonly
 */
const colors = {
  /** Dim/faded text color */
  dim: "\x1b[2m",
  /** Cyan color for directory paths */
  cyan: "\x1b[36m",
  /** Green color */
  green: "\x1b[32m",
  /** Light green color for cost display */
  lightGreen: "\x1b[92m",
  /** Red color */
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
 * Safely parse JSON string, returning empty object on error
 * @param jsonStr - JSON string to parse
 * @returns Promise resolving to parsed object or empty object on parse error
 */
const safeJsonParse = (jsonStr: string): Promise<Partial<StatusLineData>> =>
  Promise.resolve(jsonStr)
    .then(JSON.parse)
    .catch(() => ({}));

/**
 * Parse JSON input string, filtering out comment lines starting with #
 * @param input - Raw JSON input string that may contain comments
 * @returns Promise resolving to parsed StatusLineData or partial object on parse error
 */
const parseInput = (input: string): Promise<Partial<StatusLineData>> =>
  safeJsonParse(input.replace(/^#.*/gm, ""));

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
 * @param workspace - Workspace info with current_dir
 * @param cwd - Current working directory fallback
 * @returns Formatted display path (e.g., "repo/subdir", "~/path", or "parent/dir")
 */
const getDisplayPath = async (
  workspace?: WorkspaceInfo,
  cwd?: string,
): Promise<string> => {
  const path = workspace?.current_dir || cwd || process.cwd();
  if (!path) return "";

  // Try git-relative path first
  const gitPath =
    await Bun.$`cd ${path} && git rev-parse --show-toplevel 2>/dev/null`
      .quiet()
      .then(({ stdout }) => {
        if (stdout.trim()) {
          const repoRoot = stdout.trim();
          const relPath = path.replace(repoRoot, "").replace(/^\//, "") || ".";
          return relPath === "."
            ? basename(repoRoot)
            : `${basename(repoRoot)}/${relPath}`;
        }
        return null;
      })
      .catch(() => null);

  return (
    gitPath ||
    (path.startsWith(homedir())
      ? path.replace(homedir(), "") || "~"
      : path.split("/").slice(-2).join("/"))
  );
};

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
const countUserMessages = async (path: string): Promise<number> =>
  path
    ? safeRead(path)
        .then((content) => content.split("\n").filter((line) => line.trim()))
        .then((lines) => Promise.all(lines.map(isUserMessage)))
        .then((results) => results.filter(Boolean).length)
    : 0;

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
const getTokenMetrics = async (path: string): Promise<TokenMetrics> =>
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

/**
 * Build formatted status line with ANSI colors and emojis
 *
 * Creates a comprehensive status display showing model info, directory, message count,
 * code changes, cost information, and context warnings. Uses organized formatters
 * for consistent presentation across all status components.
 *
 * @param data - Enriched status data with computed fields
 * @returns Formatted status line string with ANSI escape codes and newline
 */
const buildStatusLine = (data: EnrichedStatusLineData) =>
  [
    // Version
    `${colors.dim}${formatters.version(data.version)}${colors.reset}`,
    // Model
    `🧠 ${formatters.model(data.model)}`,
    // Style
    formatters.style(data.output_style),
    // Directory
    `@ ${colors.cyan}📁 ${data.cwd}${colors.reset}`,
    // Message count
    formatters.messageCount(data.msgCount),
    // Context length
    formatters.contextLength(data.tokenMetrics),
    // Cost
    `${colors.lightGreen}${formatters.cost(data.cost)}${colors.reset}`,
    // Context warning
    formatters.contextWarning(data.exceeds_200k_tokens),
  ]
    .filter(Boolean)
    .join(" ") + "\n";

/**
 * Read JSON input from file argument or stdin
 * @param args - Command line arguments (first arg used as file path if provided)
 * @returns Promise resolving to input text content
 */
const readInput = (args: string[]) =>
  args[0] ? Bun.file(args[0]).text() : new Response(Bun.stdin).text();

/**
 * Enrich parsed data with computed fields
 *
 * Takes parsed session data and enriches it with computed display path, message count, and token metrics.
 * Concurrently fetches git-aware directory path, counts quota-relevant user messages, and gets token metrics.
 *
 * @param data - Parsed status line data from JSON input
 * @param input - Raw input string for debugging/logging purposes
 * @returns Promise resolving to enriched data with computed fields
 */
const enrichData = async (
  data: Partial<StatusLineData>,
  input: string,
): Promise<EnrichedStatusLineData> => {
  logSession(input, data.session_id);
  const [cwd, msgCount, tokenMetrics] = await Promise.all([
    getDisplayPath(data.workspace, data.cwd),
    countUserMessages(data.transcript_path),
    getTokenMetrics(data.transcript_path),
  ]);
  return { ...data, cwd, msgCount, tokenMetrics } as EnrichedStatusLineData;
};

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
const main = () =>
  readInput(process.argv.slice(2))
    .then((input) => parseInput(input).then((data) => enrichData(data, input)))
    .then(buildStatusLine)
    .then(process.stdout.write.bind(process.stdout));

main().catch(die);
