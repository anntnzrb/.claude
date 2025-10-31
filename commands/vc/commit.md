---
allowed-tools: Bash(git status:*), Bash(git add:*), Bash(git commit:*), Bash(git diff:*), Bash(git log:*), Bash(git restore:*), Bash(git reset:*)
argument-hint: [message]
description: Create atomic commits grouped by logical change type
---

## Context

- Current git status: !`git status`
- Current git diff: !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Workflow

1. **Reset to clean slate**: `git reset HEAD .` - Unstage everything to start fresh
2. **Analyze changes**: Review git diff to identify all change types across files
3. **Stage atomically**: For files with mixed changes, use `git add -p` to stage related hunks together
4. **Commit by type**: Create commits following conventional commits format

## Core Principles

**🎯 One logical change per commit** - Don't mix different change types in a single commit

**📦 Atomic staging** - Group related changes together, even if in the same file

**🏷️ Conventional commits** - Use format: `type(scope): description`

## Examples

**Mixed file changes:**
```
FileA.ts: access modifiers + async patterns + string operations
FileB.ts: access modifiers + collection updates

Correct approach:
1. Stage all access modifier changes → commit
2. Stage async pattern changes → commit
3. Stage string operation changes → commit
4. Stage collection updates → commit
```

**Rules**
- ✅ Group by WHAT changed, not WHERE
- ✅ Use `git add -p` for partial staging of mixed changes
- ✅ Keep commit messages focused and descriptive
- ❌ Don't mix change types in one commit

Start committing the first logical change group now.
