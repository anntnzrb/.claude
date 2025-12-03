---
name: git-commit
description: Create granular, logically-separated git commits using conventional commits. Activate when user asks to commit, make a commit, or save changes to git. Only commits session-modified files with patch-level precision.
allowed-tools: Bash, Read, Grep, Glob
---

# Git Commit Skill

Create atomic, well-structured commits from session changes using conventional commits format.

## Constraints

- **Subject line**: ≤52 characters (hard limit)
- **Body**: Wrap at 72 characters per line
- **Format**: Conventional commits (`type(scope): description`)

## Commit Types

| Type       | Use for                                      |
|------------|----------------------------------------------|
| `feat`     | New feature                                  |
| `fix`      | Bug fix                                      |
| `docs`     | Documentation only                           |
| `style`    | Formatting, whitespace (no logic change)     |
| `refactor` | Code restructuring (no behavior change)      |
| `perf`     | Performance improvement                      |
| `test`     | Adding/updating tests                        |
| `build`    | Build system, dependencies                   |
| `ci`       | CI/CD configuration                          |
| `chore`    | Maintenance, tooling                         |

## Workflow

### Phase 1: Session Analysis

Identify files modified during THIS session:

1. Check your edit history from this conversation
2. Fallback: Use timestamp heuristic with `git status`
3. Distinguish session files from external modifications

```bash
# List modified files with timestamps
git status -s
git diff --stat
```

Present to user: "I modified these files during our session: [list]. External changes detected in: [list]. Which should I commit?"

### Phase 2: Change Analysis

Group related changes logically:

```bash
# View all changes
git diff

# View changes per file
git diff <file>
```

Group by:
- **Feature/functionality**: Changes implementing same feature together
- **Fix vs enhancement**: Bug fixes separate from new features
- **Module/component**: Related files in same directory/module

Present grouping plan to user:
```
Commit 1: feat(auth) - files: src/auth/login.ts, src/auth/session.ts
Commit 2: fix(api) - files: src/api/handler.ts
Commit 3: docs - files: README.md
```

### Phase 3: Granular Staging

**File-level staging** (when entire files belong together):
```bash
git add src/auth/login.ts src/auth/session.ts
```

**Patch-level staging** (when file has mixed changes):
```bash
# Option A: Pipe answers to interactive add
printf 'y\nn\ny\nn\n' | git add -p <file>

# Option B: Create and apply patch
git diff <file> > /tmp/changes.patch
# Edit patch to keep only desired hunks
git apply --cached /tmp/changes.patch
```

**Verify staging**:
```bash
git diff --cached --stat  # What will be committed
git diff --stat           # What remains unstaged
```

### Phase 4: Commit Message Crafting

**Determine type** from change nature:
- Adding new functionality → `feat`
- Fixing broken behavior → `fix`
- Improving existing code → `refactor`

**Infer scope** from file paths:
- `src/auth/*` → `auth`
- `src/api/*` → `api`
- `components/Button.tsx` → `ui` or `button`

**Write message**:
- Imperative mood: "Add" not "Added"
- Focus on WHAT and WHY, not HOW
- Subject ≤52 chars (strict!)

**Template**:
```bash
git commit -m "$(cat <<'EOF'
type(scope): concise description here

Optional body explaining what changed and why.
Wrap lines at 72 characters maximum.
EOF
)"
```

### Phase 5: Execute & Repeat

1. Execute commit
2. Verify with `git log -1 --stat`
3. Repeat phases 3-5 for remaining change groups
4. Show final summary: `git log --oneline -n <commit-count>`

## Guidelines

1. **Session-only by default**: Never commit external changes without explicit approval
2. **Show before commit**: Always display `git diff --cached` summary before committing
3. **One logical change per commit**: Don't mix unrelated changes
4. **Imperative mood**: "Add feature" not "Added feature" or "Adds feature"
5. **Specific scopes**: Prefer `auth` over `code`, `api` over `backend`

## Examples

**Good commit messages**:
```
feat(auth): add OAuth2 login flow
fix(api): handle null response from user service
refactor(utils): extract date formatting helpers
docs(readme): update installation instructions
test(auth): add unit tests for session validation
```

**Bad commit messages**:
```
update code                    # Too vague
Fixed the bug                  # Past tense, no scope
feat: Added new feature for users to login with OAuth2  # Too long (54 chars)
```

## Quick Reference

```bash
# Check session changes
git status -s && git diff --stat

# Stage specific files
git add <file1> <file2>

# Stage specific hunks (piped)
printf 'y\nn\n' | git add -p <file>

# Verify staging
git diff --cached --stat

# Commit with HEREDOC
git commit -m "$(cat <<'EOF'
type(scope): description
EOF
)"

# Verify commit
git log -1 --stat
```
