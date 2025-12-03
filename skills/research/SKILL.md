---
name: research
description: Research external information using web search and codebase exploration. Activate when user requests research or asks about libraries, APIs, external repos, current events, or needs up-to-date information. Delegates to subagents to preserve context window.
allowed-tools: Task
---

# Research Skill

Delegates research to `general-purpose` subagents to preserve the main context window. Supports parallel execution for multiple queries.

## Workflow

### 1. Identify Research Queries

Break the user's request into discrete, focused research questions:
- GitHub repo questions → route to deepwiki
- Code/API/library questions → route to exa code context
- General web/current events → route to exa web search

### 2. Launch Parallel Subagents

**CRITICAL**: Launch multiple `Task` calls in a SINGLE message block for parallel execution.

```
Task(subagent_type="general-purpose", prompt="...")
Task(subagent_type="general-purpose", prompt="...")
Task(subagent_type="general-purpose", prompt="...")
```

Each subagent prompt MUST include:
1. The specific research question
2. Tool priority instructions (see below)
3. Request for concise summary with source URLs

### 3. Synthesize Results

Combine subagent outputs into a coherent response for the user.

### 4. Cite Sources

Include all URLs from research in a Sources section.

## Subagent Prompt Template

Use this template for each research subagent:

```
Research: [SPECIFIC QUESTION]

Tool priority:
1. Exa (primary): Use `mcp__exa__web_search_exa` for web, `mcp__exa__get_code_context_exa` for code/APIs
2. Deepwiki (for GitHub repos): Use `mcp__deepwiki__ask_question` with format `owner/repo`
3. Skip using WebSearch

Return:
- Concise summary (2-4 paragraphs max)
- Key findings as bullet points
- Source URLs
```

## Examples

### Single Query
```
Task(
  subagent_type="general-purpose",
  prompt="Research: How does React Server Components handle data fetching?\n\nTool priority:\n1. Use mcp__exa__get_code_context_exa for code patterns\n2. Use mcp__deepwiki__ask_question with 'facebook/react' for official docs."
)
```

### Parallel Queries (single message block)
```
Task(subagent_type="general-purpose", prompt="Research Next.js app router patterns using exa code context...")
Task(subagent_type="general-purpose", prompt="Research Vercel deployment config using deepwiki vercel/next.js...")
Task(subagent_type="general-purpose", prompt="Research edge runtime limitations using exa web search...")
```

## Guidelines

- Prefer specific queries over broad ones
- Include language/framework context in prompts
- For deepwiki, always use `owner/repo` format
- Maximum 4-5 parallel subagents to avoid overwhelming
- Each subagent should return focused, actionable findings
