# Async/Await Reference

Deep dive into async programming in Python 3.14+.

## Table of Contents

1. [Structured Concurrency](#structured-concurrency)
2. [Async Generators](#async-generators)
3. [Async Context Managers](#async-context-managers)
4. [HTTP with httpx](#http-with-httpx)
5. [Error Handling](#error-handling)
6. [Common Patterns](#common-patterns)

---

## Structured Concurrency

### TaskGroup (3.11+)

The recommended way to run concurrent tasks with proper error handling:

```python
import asyncio

async def fetch_data(url: str) -> str:
    await asyncio.sleep(0.1)
    return f"Data from {url}"

async def main():
    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(fetch_data("url1"))
        task2 = tg.create_task(fetch_data("url2"))
        task3 = tg.create_task(fetch_data("url3"))

    # All tasks completed or exception raised
    print(f"Task1: {task1.result()}")
    print(f"Task2: {task2.result()}")
    print(f"Task3: {task3.result()}")

asyncio.run(main())
```

### asyncio.gather (legacy but useful)

```python
async def fetch_all(urls: list[str]) -> list[str]:
    tasks = [fetch_data(url) for url in urls]
    results = await asyncio.gather(*tasks)
    return results

# With return_exceptions for partial failures
async def fetch_all_safe(urls: list[str]):
    results = await asyncio.gather(
        *[fetch_data(url) for url in urls],
        return_exceptions=True
    )
    successes = [r for r in results if not isinstance(r, Exception)]
    errors = [r for r in results if isinstance(r, Exception)]
    return successes, errors
```

### Timeouts

```python
async def with_timeout():
    try:
        async with asyncio.timeout(5.0):
            result = await slow_operation()
            return result
    except asyncio.TimeoutError:
        print("Operation timed out")
        return None

# wait_for (older API)
try:
    result = await asyncio.wait_for(slow_operation(), timeout=5.0)
except asyncio.TimeoutError:
    print("Timed out")
```

---

## Async Generators

### Basic Async Generator

```python
from typing import AsyncGenerator

async def async_range(n: int) -> AsyncGenerator[int, None]:
    for i in range(n):
        await asyncio.sleep(0.01)
        yield i

async def consume():
    async for value in async_range(5):
        print(value)
```

### Async Comprehensions

```python
async def get_items() -> list[int]:
    return [i async for i in async_range(10)]

async def filter_items() -> list[int]:
    return [i async for i in async_range(10) if i % 2 == 0]
```

### Async Generator with Cleanup

```python
async def stream_data():
    try:
        async for chunk in fetch_stream():
            yield chunk
    finally:
        await cleanup_connection()
```

---

## Async Context Managers

### Class-Based

```python
class AsyncDatabaseConnection:
    async def __aenter__(self):
        print("Connecting...")
        await asyncio.sleep(0.1)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        print("Closing...")
        await asyncio.sleep(0.05)
        return False  # Don't suppress exceptions

async def use_db():
    async with AsyncDatabaseConnection() as conn:
        print("Using connection")
```

### Decorator-Based

```python
from contextlib import asynccontextmanager
from typing import AsyncGenerator

@asynccontextmanager
async def async_timer(name: str) -> AsyncGenerator[None, None]:
    import time
    start = time.time()
    try:
        yield
    finally:
        elapsed = time.time() - start
        print(f"{name} took {elapsed:.4f}s")

async def timed_operation():
    async with async_timer("fetch"):
        await fetch_data("url")
```

---

## HTTP with httpx

### AsyncClient Basics

```python
import httpx

async def fetch_json(url: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()

async def post_data(url: str, data: dict) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=data)
        response.raise_for_status()
        return response.json()
```

### Reusing Client (recommended)

```python
async def fetch_multiple(urls: list[str]) -> list[dict]:
    async with httpx.AsyncClient() as client:
        async with asyncio.TaskGroup() as tg:
            tasks = [
                tg.create_task(client.get(url))
                for url in urls
            ]
        return [t.result().json() for t in tasks]
```

### With Timeout and Retry

```python
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1))
async def fetch_with_retry(url: str) -> dict:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()
```

---

## Error Handling

### Exception Groups (3.11+)

```python
async def run_tasks():
    try:
        async with asyncio.TaskGroup() as tg:
            tg.create_task(might_fail_1())
            tg.create_task(might_fail_2())
            tg.create_task(might_fail_3())
    except* ValueError as eg:
        print(f"ValueError(s): {eg.exceptions}")
    except* TypeError as eg:
        print(f"TypeError(s): {eg.exceptions}")
```

### Graceful Degradation

```python
async def fetch_with_fallback(primary: str, fallback: str) -> str:
    try:
        return await fetch_data(primary)
    except Exception:
        return await fetch_data(fallback)

async def fetch_best_effort(urls: list[str]) -> list[str]:
    results = await asyncio.gather(
        *[fetch_data(url) for url in urls],
        return_exceptions=True
    )
    return [r for r in results if isinstance(r, str)]
```

---

## Common Patterns

### Run Blocking Code in Thread

```python
import asyncio

def blocking_io():
    import time
    time.sleep(1)
    return "done"

async def main():
    # Run blocking code without blocking event loop
    result = await asyncio.to_thread(blocking_io)
    print(result)
```

### Semaphore for Rate Limiting

```python
async def fetch_with_limit(urls: list[str], max_concurrent: int = 10):
    semaphore = asyncio.Semaphore(max_concurrent)

    async def limited_fetch(url: str):
        async with semaphore:
            return await fetch_data(url)

    return await asyncio.gather(*[limited_fetch(url) for url in urls])
```

### Event for Coordination

```python
async def waiter(event: asyncio.Event):
    print("Waiting...")
    await event.wait()
    print("Got signal!")

async def setter(event: asyncio.Event):
    await asyncio.sleep(1)
    event.set()

async def main():
    event = asyncio.Event()
    await asyncio.gather(waiter(event), setter(event))
```

### Queue for Producer-Consumer

```python
async def producer(queue: asyncio.Queue):
    for i in range(10):
        await queue.put(i)
        await asyncio.sleep(0.1)
    await queue.put(None)  # Sentinel

async def consumer(queue: asyncio.Queue):
    while True:
        item = await queue.get()
        if item is None:
            break
        print(f"Processing {item}")
        queue.task_done()

async def main():
    queue = asyncio.Queue()
    await asyncio.gather(producer(queue), consumer(queue))
```

### Lock for Shared State

```python
class AsyncCounter:
    def __init__(self):
        self.value = 0
        self._lock = asyncio.Lock()

    async def increment(self):
        async with self._lock:
            self.value += 1
            return self.value
```

---

## Anti-Patterns

| Avoid | Do Instead |
|-------|------------|
| `requests.get(url)` | `await client.get(url)` with httpx |
| `time.sleep(n)` | `await asyncio.sleep(n)` |
| Bare `asyncio.create_task()` | Use TaskGroup or gather |
| Global event loop | `asyncio.run(main())` |
| `loop.run_until_complete()` | `asyncio.run()` |

---

## Quick Reference

```python
# Run async code
asyncio.run(main())

# Create tasks
async with asyncio.TaskGroup() as tg:
    task = tg.create_task(coro())

# Concurrent execution
results = await asyncio.gather(*coros)

# Timeout
async with asyncio.timeout(5.0):
    await slow_op()

# Sleep
await asyncio.sleep(1.0)

# Run blocking in thread
await asyncio.to_thread(blocking_fn)

# Rate limit
async with semaphore:
    await limited_op()
```
