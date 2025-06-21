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
- `Effect Schema`: Type-safe validation (no Zod)

**Examples**

```typescript
// Fallback values
const value = Option.fromNullable(data).pipe(Option.getOrElse(() => "default"));

// Conditionals
const result = Match.value({ loading, error, data }).pipe(
  Match.when({ loading: true }, () => <LoadingSpinner />),
  Match.when(({ error }) => error !== null, ({ error }) => <ErrorMessage error={error} />),
  Match.orElse(({ data }) => <DataView data={data} />)
);

// HTTP requests
const fetchData = <T>(url: string, schema?: Schema.Schema<T>) =>
  HttpClient.get(url).pipe(
    Effect.flatMap(response => response.json),
    Effect.flatMap(data => schema ? Schema.decodeUnknown(schema)(data) : Effect.succeed(data as T)),
    Effect.provide(FetchHttpClient.layer)
  );

// Async operations with error handling
const asyncPattern = pipe(
  Effect.tryPromise(() => navigator.clipboard.writeText(data)),
  Effect.tap(() => alert('Success')),
  Effect.catchAll(() => Effect.succeed(alert('Error'))),
  Effect.runPromise
);
```

## Development

**Environment**: `bun`-first (node via `nix shell nixpkgs#nodejs_24 -c ...`)

**Workflow**

- `bun run lint` after edits
- `bun run fmt` after edits
- `bun run build` to verify compilation
- NEVER run server (user does this)

**Principles**: Prioritize DX, minimal SLOC, consistent patterns, composable functions
