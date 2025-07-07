# Project Guidelines

## Architecture

**Size Limits**

- Files MUST NOT exceed 500 lines
- Functions MUST NOT exceed 50 lines
- Extract utilities, components, and logic into separate modules

**Component Organization**

- Single responsibility per component
- Domain-based structure: `ui/` (generic), `[domain]/` (specific)
- Extract UI states into focused components

## Effect-ts Patterns

**Core Utilities**

- `pipe`: Function composition
- `Option`: Nullable value handling
- `Match`: Replace conditionals/switch statements

## Development

**Environment**: `bun`-first, else try `node`

**Workflow**

- `bun run lint` after edits
- NEVER run server (user does this)

**Principles**: Prioritize DX, minimal SLOC, consistent patterns, composable functions
