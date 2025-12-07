# Modern Python Features

Key features from Python 3.8 through 3.14.

---

## Python 3.8

### Walrus Operator `:=`

Assignment inside expressions:

```python
# Read until empty line
while (line := input()) != "":
    print(f"Got: {line}")

# Filter and capture
if (match := pattern.search(text)) is not None:
    print(match.group(0))

# List comprehension with reuse
results = [y for x in data if (y := expensive(x)) > threshold]
```

### Positional-Only Parameters `/`

```python
def greet(name, /, greeting="Hello"):
    return f"{greeting}, {name}!"

greet("Alice")              # OK
greet("Alice", "Hi")        # OK
greet(name="Alice")         # TypeError - name is positional-only
```

### Self-Documenting F-Strings

```python
x = 10
y = 25
print(f"{x=}, {y=}, {x+y=}")
# Output: x=10, y=25, x+y=35

user = {"name": "Alice", "age": 30}
print(f"{user['name']=}")
# Output: user['name']='Alice'
```

---

## Python 3.9

### Dict Merge Operators `|`

```python
defaults = {"host": "localhost", "port": 8080}
overrides = {"port": 3000, "debug": True}

# Merge (new dict)
config = defaults | overrides
# {'host': 'localhost', 'port': 3000, 'debug': True}

# Update in place
defaults |= overrides
```

### Built-in Generic Types

```python
# No more typing.List, typing.Dict imports
def process(items: list[str]) -> dict[str, int]:
    return {item: len(item) for item in items}

# Works with all builtins
ids: set[int] = {1, 2, 3}
pairs: tuple[str, int] = ("age", 25)
```

### String `removeprefix` / `removesuffix`

```python
filename = "test_user_service.py"

filename.removeprefix("test_")     # "user_service.py"
filename.removesuffix(".py")       # "test_user_service"

# Replaces awkward patterns like:
# s[len(prefix):] if s.startswith(prefix) else s
```

---

## Python 3.10

### Pattern Matching

```python
def handle(command):
    match command.split():
        case ["quit"]:
            return "Goodbye"
        case ["load", filename]:
            return f"Loading {filename}"
        case ["save", filename, "--force"]:
            return f"Force saving {filename}"
        case _:
            return "Unknown command"

# With guards
match point:
    case (x, y) if x == y:
        print("On diagonal")
    case (x, y):
        print(f"At ({x}, {y})")

# Class patterns
match event:
    case Click(x=0, y=0):
        print("Origin click")
    case Click(x=x, y=y):
        print(f"Click at {x}, {y}")
```

### Union Type Syntax `|`

```python
# Instead of Union[int, str]
def process(value: int | str | None) -> str:
    if value is None:
        return "empty"
    return str(value)

# Works in isinstance too
isinstance(x, int | str)  # Same as isinstance(x, (int, str))
```

### Parenthesized Context Managers

```python
with (
    open("input.txt") as src,
    open("output.txt", "w") as dst,
    some_lock as lock,
):
    dst.write(src.read())
```

---

## Python 3.11

### Exception Groups & `except*`

```python
# Raise multiple exceptions
raise ExceptionGroup("errors", [
    ValueError("invalid value"),
    TypeError("wrong type"),
])

# Catch by type
try:
    async_operation()
except* ValueError as eg:
    print(f"Value errors: {eg.exceptions}")
except* TypeError as eg:
    print(f"Type errors: {eg.exceptions}")
```

### `TaskGroup` for Structured Concurrency

```python
import asyncio

async def main():
    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(fetch("url1"))
        task2 = tg.create_task(fetch("url2"))
    # All tasks complete or all cancelled on error
    return task1.result(), task2.result()
```

### `tomllib` (TOML Parser)

```python
import tomllib

with open("pyproject.toml", "rb") as f:
    config = tomllib.load(f)

# Or from string
data = tomllib.loads('[section]\nkey = "value"')
```

### `Self` Type

```python
from typing import Self

class Builder:
    def with_name(self, name: str) -> Self:
        self.name = name
        return self

    def clone(self) -> Self:
        return type(self)()
```

---

## Python 3.12

### Type Parameter Syntax

```python
# Old way
from typing import TypeVar
T = TypeVar("T")
def first(items: list[T]) -> T: ...

# New way - cleaner!
def first[T](items: list[T]) -> T:
    return items[0]

# Generic classes
class Stack[T]:
    def __init__(self) -> None:
        self._items: list[T] = []

    def push(self, item: T) -> None:
        self._items.append(item)

    def pop(self) -> T:
        return self._items.pop()

# Constrained types
def add[T: (int, float)](a: T, b: T) -> T:
    return a + b
```

### Type Alias Statement

```python
# Old way
from typing import TypeAlias
Vector: TypeAlias = list[float]

# New way
type Vector = list[float]
type Point = tuple[float, float]
type Callback[T] = Callable[[T], None]
```

### F-String Improvements

```python
# Nested quotes (any quote style)
print(f"User: {user["name"]}")  # Now works!
print(f'Status: {data['status']}')

# Multiline expressions
result = f"{
    some_long_function_call(
        arg1,
        arg2
    )
}"

# Comments inside f-strings
f"{x:=10}"  # This is a format spec, not walrus!
```

### `@override` Decorator

```python
from typing import override

class Parent:
    def greet(self) -> str:
        return "Hello"

class Child(Parent):
    @override
    def greet(self) -> str:  # Type checker verifies this exists in parent
        return "Hi"

    @override
    def great(self) -> str:  # Error: typo, no such method in parent
        return "Oops"
```

### `itertools.batched`

```python
from itertools import batched

list(batched("ABCDEFG", 3))
# [('A', 'B', 'C'), ('D', 'E', 'F'), ('G',)]

# Process in chunks
for batch in batched(large_dataset, 100):
    process_batch(batch)
```

---

## Python 3.13

### Free-Threaded Python (No GIL)

```python
# Build/install with: --disable-gil
# True parallelism for CPU-bound threads

import threading

# These now run in parallel on multiple cores
threads = [
    threading.Thread(target=cpu_intensive, args=(data,))
    for data in chunks
]
for t in threads:
    t.start()
for t in threads:
    t.join()
```

### Improved REPL

- Multiline editing with history
- Syntax highlighting
- Better paste support
- `exit` works (no parentheses needed)

### `copy.replace()`

```python
from copy import replace
from dataclasses import dataclass

@dataclass
class User:
    name: str
    age: int

alice = User("Alice", 30)
bob = replace(alice, name="Bob")
# User(name='Bob', age=30)
```

### `@deprecated` Decorator

```python
from warnings import deprecated

@deprecated("Use new_function() instead")
def old_function():
    ...

old_function()  # Emits DeprecationWarning
```

---

## Python 3.14

### Template Strings (t-strings)

```python
name = "Alice"
age = 30

# Template object (not evaluated string)
template = t"Hello {name}, age {age}"

# Safer than f-strings for user templates
# Can inspect/transform before rendering
print(template.strings)       # ("Hello ", ", age ", "")
print(template.interpolations) # (Interpolation(name, ...), ...)
```

### Deferred Annotation Evaluation

```python
# Forward references work without quotes!
class Node:
    def __init__(self, value: int):
        self.value = value
        self.next: Node | None = None  # No "Node" quotes needed

    def append(self, node: Node) -> Node:
        self.next = node
        return node
```

### `uuid.uuid7()` (Time-Sortable)

```python
from uuid import uuid7

id1 = uuid7()
id2 = uuid7()

assert id1 < id2  # Chronologically sortable!
# Great for database primary keys
```

### Pathlib Copy/Move

```python
from pathlib import Path

src = Path("file.txt")
src.copy(Path("backup/file.txt"))
src.move(Path("archive/file.txt"))

# Directory copy
Path("src/").copy(Path("backup/"), recursive=True)
```

### Simplified Exception Syntax

```python
# Multiple exception types without parentheses
try:
    risky_operation()
except ValueError, TypeError, KeyError:  # No tuple needed!
    handle_error()
```

---

## Quick Reference

| Version | Key Feature | Example |
|---------|-------------|---------|
| 3.8 | Walrus `:=` | `if (n := len(x)) > 10:` |
| 3.8 | Positional-only `/` | `def f(x, /):` |
| 3.9 | Dict merge `\|` | `d1 \| d2` |
| 3.9 | Built-in generics | `list[int]` |
| 3.10 | Pattern matching | `match x: case ...:` |
| 3.10 | Union `\|` | `int \| str` |
| 3.11 | Exception groups | `except* ValueError:` |
| 3.11 | TaskGroup | `async with TaskGroup():` |
| 3.12 | Type params | `def f[T](x: T):` |
| 3.12 | `type` statement | `type Alias = ...` |
| 3.13 | Free-threaded | No GIL option |
| 3.13 | `@deprecated` | Deprecation decorator |
| 3.14 | t-strings | `t"Hello {name}"` |
| 3.14 | `uuid7()` | Time-sortable UUIDs |
