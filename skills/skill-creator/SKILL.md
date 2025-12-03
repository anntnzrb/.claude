---
name: skill-creator
description: Create and optimize Claude Code skills interactively. Activate when user wants to create a new skill, write a SKILL.md, or mentions skill creation/optimization.
---

# Skill Creator

A meta-skill for creating optimized Claude Code skills through an interactive, guided workflow.

## Workflow

### Phase 1: Research (mandatory first step)

Before doing anything else:

1. Use the `claude-code-guide` subagent to fetch current best practices for skill creation
2. Explore existing skills in `~/.claude/skills/` for context and patterns
3. Best practices from the guide always take precedence over local patterns

Never skip this phase - it ensures skills are created with up-to-date patterns.

### Phase 2: Discovery

Use `AskUserQuestion` to gather requirements. Ask about:

- Skill name and purpose
- When should the skill activate? (trigger conditions)
- What tools/capabilities does it need?
- Is this a single-file skill or does it need supporting files?

Never assume - always ask for clarification on ambiguous requirements.

### Phase 3: Interactive Design

Draft the initial SKILL.md structure, then iterate with the user:

1. Present draft to user
2. Use `AskUserQuestion` to present options:
   - Description phrasing (which activates best?)
   - Workflow structure (linear vs branching?)
   - Tool restrictions (read-only? specific tools only?)
3. Ask: "Does this capture your intent? What would you change?"
4. Revise and repeat

**Exit conditions**: User says "stop", "finish", "done", or explicitly approves.

Be talkative and offer suggestions throughout. The goal is interactive refinement.

### Phase 4: Validation

Present a detailed checklist with pass/fail for each item:

- [ ] YAML frontmatter syntax valid
- [ ] Name matches directory name (kebab-case)
- [ ] Description includes activation triggers
- [ ] Description is specific, not vague
- [ ] Workflow is actionable and clear
- [ ] Tool restrictions considered (if applicable)
- [ ] Supporting files suggested (if complex)

Use `AskUserQuestion` to confirm any suggested improvements before applying.

### Phase 5: Context Management

For long-running or complex skill creation:

- Delegate heavy work to `general-purpose` subagent
- This preserves the main context window for continued interaction

## Key Behaviors

- **Always start with research**: Never skip the claude-code-guide consultation
- **Ask, don't assume**: Use `AskUserQuestion` liberally - clarity over speed
- **Interactive by default**: Offer suggestions, ask for feedback, iterate on every draft
- **Progressive disclosure**: Keep SKILL.md focused, suggest supporting files when needed
- **Delegate heavy work**: Use `general-purpose` subagent for complex skills
