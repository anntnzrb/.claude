---
name: git-commit
description: Create granular, logically-separated git commits using conventional commits. Activate when user asks to commit, make a commit, or save changes to git. Only commits session-modified files with patch-level precision.
allowed-tools: Task
---

# Git Commit Skill

Delegates all commit work to a subagent to preserve the main context window.

## Workflow

Launch a single `Task` call to handle the entire commit process:

```
Task(
  subagent_type="general-purpose",
  model="haiku",
  prompt="[full commit instructions below]"
)
```

## Subagent Prompt Template

Use this exact prompt structure when launching the subagent:

```
Create atomic git commits using conventional commits format.

## Constraints
- Subject line: ≤52 characters (hard limit)
- Body: Wrap at 72 characters per line
- Format: type(scope): description

## Commit Types
- feat: New feature
- fix: Bug fix
- docs: Documentation only
- style: Formatting (no logic change)
- refactor: Code restructuring (no behavior change)
- perf: Performance improvement
- test: Adding/updating tests
- build: Build system, dependencies
- ci: CI/CD configuration
- chore: Maintenance, tooling

## Task

1. Run `git status -s` and `git diff --stat` to identify changes
2. Group related changes logically by feature/fix/module
3. For each logical group:
   - Stage files with `git add <files>`
   - For mixed changes in one file, use `printf 'y\nn\n...' | git add -p <file>`
   - Verify with `git diff --cached --stat`
   - Commit using HEREDOC format:
     ```bash
     git commit -m "$(cat <<'EOF'
     type(scope): description
     EOF
     )"
     ```
4. Show final summary: `git log --oneline -n <commit-count>`

## Guidelines
- Session-only by default: Ask before committing external changes
- Show `git diff --cached` summary before each commit
- One logical change per commit
- Imperative mood: "Add" not "Added"
- Specific scopes: prefer `auth` over `code`, `api` over `backend`

## Good Examples
- feat(auth): add OAuth2 login flow
- fix(api): handle null response from user service
- refactor(utils): extract date formatting helpers
```

## Example Invocation

```
Task(
  subagent_type="general-purpose",
  model="haiku",
  prompt="Create atomic git commits using conventional commits format.\n\n[full prompt from template above]"
)
```
