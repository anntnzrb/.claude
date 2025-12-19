---
name: go
description: Develop Go applications using modern patterns, popular libraries, and idiomatic design. Activate when working with .go files, go.mod, go.sum, or user mentions Go, Golang, goroutines, channels, or Go libraries like gin, cobra, gorm.
---

# Go Development Skill

## Activation Triggers

- Working with `.go` files, `go.mod`, `go.sum`, `go.work`
- User mentions Go, Golang, or Go-specific terms
- Questions about Go libraries, frameworks, or tooling
- Concurrency patterns (goroutines, channels, context)

## Workflow: Research-First Approach

Before implementing, gather context from authoritative sources:

```
# Parallel DeepWiki queries for library questions
deepwiki_ask_question("gin-gonic/gin", "how to set up middleware")
deepwiki_ask_question("uber-go/zap", "structured logging setup")

# For style/idiom questions
deepwiki_read_wiki_contents("uber-go/guide")
```

## Repository Routing Table

Query DeepWiki for these repos based on the topic:

| Topic | Repository | Use For |
|-------|------------|---------|
| **Style & Idioms** | `uber-go/guide` | Code style, naming, patterns |
| **Linting** | `golangci/golangci-lint` | Linter config, rules |
| **Testing** | `stretchr/testify` | Assertions, mocking, suites |
| **Logging** | `uber-go/zap` | High-performance structured logging |
| **Logging (alt)** | `rs/zerolog` | Zero-allocation JSON logging |
| **Web/HTTP** | `gin-gonic/gin` | HTTP framework, middleware |
| **Web/HTTP (alt)** | `go-chi/chi` | Lightweight router |
| **Web/HTTP (alt)** | `labstack/echo` | High-performance web framework |
| **CLI** | `spf13/cobra` | CLI applications, subcommands |
| **CLI (TUI)** | `charmbracelet/bubbletea` | Terminal UI applications |
| **Config** | `spf13/viper` | Configuration management |
| **Config (alt)** | `knadh/koanf` | Lightweight config library |
| **Database/ORM** | `go-gorm/gorm` | ORM, migrations, associations |
| **Database (SQL)** | `jmoiron/sqlx` | Extensions to database/sql |
| **Database (Postgres)** | `jackc/pgx` | PostgreSQL driver |
| **DI** | `uber-go/fx` | Dependency injection framework |
| **DI (codegen)** | `google/wire` | Compile-time DI |
| **Validation** | `go-playground/validator` | Struct validation |
| **HTTP Client** | `go-resty/resty` | REST client with retries |
| **Concurrency** | `sourcegraph/conc` | Structured concurrency |
| **Worker Pools** | `panjf2000/ants` | Goroutine pool |
| **Errors** | `uber-go/multierr` | Error aggregation |
| **Errors (alt)** | `samber/oops` | Error handling with context |
| **Generics/Utils** | `samber/lo` | Lodash-style utilities |

## CLI Quick Reference

### Module Management
```bash
go mod init <module>       # Initialize module
go mod tidy                # Sync dependencies
go get <pkg>@latest        # Add/update dependency
go get <pkg>@v1.2.3        # Specific version
go mod download            # Download dependencies
go mod why <pkg>           # Why is pkg needed
go mod graph               # Dependency graph
```

### Build & Run
```bash
go build ./...             # Build all packages
go run .                   # Run current package
go install ./cmd/...       # Install binaries
go generate ./...          # Run go:generate directives
```

### Testing
```bash
go test ./...              # Run all tests
go test -v ./...           # Verbose output
go test -race ./...        # Race detector
go test -cover ./...       # Coverage summary
go test -coverprofile=c.out ./... && go tool cover -html=c.out  # Coverage HTML
go test -bench=. ./...     # Run benchmarks
go test -fuzz=FuzzXxx ./...  # Fuzz testing
go test -run=TestName      # Run specific test
go test -count=1           # Disable test caching
```

### Linting (golangci-lint)
```bash
golangci-lint run          # Run all linters
golangci-lint run --fix    # Auto-fix issues
golangci-lint linters      # List available linters
```

### Workspaces (multi-module)
```bash
go work init ./mod1 ./mod2 # Initialize workspace
go work use ./mod3         # Add module to workspace
go work sync               # Sync workspace
```

### Other Tools
```bash
go fmt ./...               # Format code
go vet ./...               # Static analysis
go doc <pkg>               # View documentation
go env                     # Environment variables
go version                 # Go version
```

## Files

- `reference.md` - Go 1.24+ features, project layout, Uber style highlights
- `cookbook/testing.md` - Table-driven tests, testify, mocking, benchmarks
- `cookbook/concurrency.md` - Goroutines, channels, context, errgroup
- `cookbook/patterns.md` - Functional options, DI, error handling
