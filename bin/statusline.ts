#!/usr/bin/env bun

/**
 * Claude Code statusline generator
 * Generates formatted status line with model, directory, cost, and line changes
 */

import { existsSync } from "fs";
import { homedir } from "os";
import { basename } from "path";

const colors = {
  dim: "\x1b[2m", cyan: "\x1b[36m", green: "\x1b[32m", 
  lightGreen: "\x1b[92m", red: "\x1b[31m", reset: "\x1b[0m"
} as const;

const die = (msg: string): never => (console.error(`Error: ${msg}`), process.exit(1));

const safeRead = (path: string) =>
  existsSync(path) ? Bun.file(path).text().catch(() => "") : Promise.resolve("");

const parseInput = (input: string) => {
  try { return JSON.parse(input.replace(/^#.*/gm, "")); } 
  catch { return {}; }
};

const getDisplayPath = async (path: string): Promise<string> => {
  if (!path) return "";
  
  try {
    const { stdout } = await Bun.$`cd ${path} && git rev-parse --show-toplevel 2>/dev/null`.quiet();
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

const countUserMessages = async (path: string): Promise<number> =>
  path ? safeRead(path).then(content => 
    Math.max(0, 
      (content.match(/"type":"user"/g)?.length ?? 0) -
      (content.match(/toolUseResult.*?"type":"user"/g)?.length ?? 0)
    )
  ) : 0;

const buildStatusLine = (data: any) => {
  const model = data.model?.id?.replace(/^claude-/, "") ?? "Claude";
  const style = data.output_style?.name !== "default" && data.output_style?.name ? ` [${data.output_style.name}]` : "";
  const version = data.version ? `[v${data.version}] ` : "";
  const msgCount = data.msgCount > 0 ? ` 💬 ${data.msgCount}` : "";
  const cost = data.cost?.total_cost_usd > 0 ? ` 💰 $${data.cost.total_cost_usd.toFixed(2)}` : "";
  
  const lines = [
    data.cost?.total_lines_added > 0 && `${colors.green}+${data.cost.total_lines_added}${colors.reset}`,
    data.cost?.total_lines_removed > 0 && `${colors.red}-${data.cost.total_lines_removed}${colors.reset}`
  ].filter(Boolean);
  
  const linesStr = lines.length > 0 ? ` [${lines.join("/")}]` : "";
  
  return `${colors.dim}${version}🧠 ${model}${colors.reset} @ ${colors.cyan}📁 ${data.cwd}/${colors.reset}${style}${msgCount}${linesStr}${colors.lightGreen}${cost}${colors.reset}\n`;
};

const readInput = (args: string[]) =>
  args.length > 0 ? Bun.file(args[0]).text() : new Response(Bun.stdin).text();

const main = () => {
  const [, , ...args] = process.argv;
  
  return readInput(args)
    .then(parseInput)
    .then(async (data) => {
      const [cwd, msgCount] = await Promise.all([
        getDisplayPath(data.workspace?.current_dir ?? data.cwd ?? process.cwd()),
        countUserMessages(data.transcript_path ?? "")
      ]);
      return { ...data, cwd, msgCount };
    })
    .then(buildStatusLine)
    .then(process.stdout.write.bind(process.stdout));
};

main().catch(die);