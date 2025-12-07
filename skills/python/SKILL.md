---
name: python
description: Develop Python applications using modern patterns, uv, and functional-first design. Activate when working with .py files, pyproject.toml, uv commands, or user mentions Python, itertools, functools, pytest, mypy, ruff, async, or functional programming patterns.
---

# Python Development

Functional-first Python 3.14+ with **uv**, **type safety**, and **immutability**.

## Workflow

```
1. MODEL    → Define types (dataclasses, Protocols, Pydantic)
2. COMPOSE  → Build with pure functions, pipe/compose
3. TEST     → Write tests first (pytest)
4. VALIDATE → uv run mypy src/ && uv run ruff check
5. ITERATE  → Refactor toward immutability
```

## CLI

```bash
# Project setup
uv init my-project && cd my-project
uv add requests pydantic httpx
uv add --dev pytest pytest-asyncio mypy ruff

# Run
uv run python script.py
uv run pytest

# Linting (ruff check)
uv run ruff check src/           # Check for issues
uv run ruff check --fix src/     # Auto-fix issues

# Formatting (ruff format)
uv run ruff format src/          # Format code
uv run ruff format --check src/  # Check without modifying

# Type checking
uv run mypy src/

# Dependencies
uv sync --locked               # CI: strict lockfile
uv lock --upgrade-package pkg  # Upgrade specific
```

## Core Patterns

### Pure Functions + Immutability

```python
from dataclasses import dataclass

@dataclass(frozen=True)  # Immutable
class Point:
    x: float
    y: float

    def translate(self, dx: float, dy: float) -> "Point":
        return Point(self.x + dx, self.y + dy)  # New instance
```

### Composition with Pipe

```python
from functools import reduce
from typing import Callable, Any

def pipe(*fns: Callable[[Any], Any]) -> Callable[[Any], Any]:
    return reduce(lambda f, g: lambda x: g(f(x)), fns)

# Usage: read left-to-right
process = pipe(parse, validate, transform, save)
result = process(data)
```

### Structural Typing with Protocol

```python
from typing import Protocol

class Persistable(Protocol):
    def save(self) -> None: ...
    def load(self) -> None: ...

def backup(store: Persistable) -> None:  # Duck typing!
    store.save()
```

## Itertools Patterns

```python
from itertools import chain, batched, pairwise, groupby, accumulate, takewhile

# chain: Flatten iterables
list(chain([1, 2], [3, 4]))  # [1, 2, 3, 4]

# batched: Chunk into groups (3.12+)
list(batched("ABCDEFG", 3))  # [('A','B','C'), ('D','E','F'), ('G',)]

# pairwise: Consecutive pairs
list(pairwise("ABCD"))  # [('A','B'), ('B','C'), ('C','D')]

# groupby: Group consecutive (requires sorted input!)
data = [("a", 1), ("a", 2), ("b", 3)]
{k: list(g) for k, g in groupby(data, key=lambda x: x[0])}
# {'a': [('a', 1), ('a', 2)], 'b': [('b', 3)]}

# accumulate: Running totals
list(accumulate([1, 2, 3, 4]))  # [1, 3, 6, 10]

# takewhile/dropwhile: Conditional slicing
list(takewhile(lambda x: x < 5, [1, 3, 6, 2]))  # [1, 3]

# combinations/permutations/product
from itertools import combinations, permutations, product
list(combinations("ABC", 2))  # [('A','B'), ('A','C'), ('B','C')]
list(product([0, 1], repeat=2))  # [(0,0), (0,1), (1,0), (1,1)]
```

## Functools Patterns

```python
from functools import reduce, partial, lru_cache

# reduce: Fold to single value
reduce(lambda acc, x: acc + x, [1, 2, 3, 4], 0)  # 10

# partial: Fix arguments
from operator import mul
double = partial(mul, 2)
double(5)  # 10

# lru_cache: Memoization
@lru_cache(maxsize=128)
def fib(n: int) -> int:
    return n if n < 2 else fib(n-1) + fib(n-2)
```

## Async Patterns

```python
import asyncio
import httpx

# TaskGroup: Structured concurrency (3.11+)
async def fetch_all(urls: list[str]) -> list[str]:
    async with httpx.AsyncClient() as client:
        async with asyncio.TaskGroup() as tg:
            tasks = [tg.create_task(client.get(url)) for url in urls]
    return [t.result().text for t in tasks]

# Async generator
async def async_range(n: int):
    for i in range(n):
        await asyncio.sleep(0.01)
        yield i

async def consume():
    async for value in async_range(5):
        print(value)

# Gather with error handling
async def fetch_safe(urls: list[str]):
    results = await asyncio.gather(
        *[fetch(url) for url in urls],
        return_exceptions=True
    )
    successes = [r for r in results if not isinstance(r, Exception)]
    errors = [r for r in results if isinstance(r, Exception)]
    return successes, errors
```

## Project Structure

```
my-project/
├── src/my_project/
│   ├── __init__.py
│   ├── main.py
│   ├── domain/        # Types, entities
│   └── services/      # Business logic
├── tests/
├── pyproject.toml
└── uv.lock            # Always commit!
```

## Anti-Patterns

| Avoid | Do Instead |
|-------|------------|
| Mutable default args `def f(lst=[])` | `def f(lst=None)` |
| `requests.get` in async | `httpx.AsyncClient` |
| Classes for data bags | `@dataclass(frozen=True)` |
| Inheritance hierarchies | Protocols + composition |
| Mutating function args | Return new values |
| `try/except Exception` | Specific exception types |
| Blocking in async | `await asyncio.to_thread(fn)` |

## References

- [patterns.md](patterns.md) - Functional patterns & composition
- [async.md](async.md) - Async/await deep dive
- [testing.md](testing.md) - pytest patterns & fixtures
- [design-patterns.md](design-patterns.md) - Builder, DI, Factory, Strategy, Repository
- [modern.md](modern.md) - Python 3.8–3.14 key features
