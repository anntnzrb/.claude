# Algorithm Patterns

## Graph Traversal

### Breadth-First Search (BFS)

**Use when**: Shortest path in unweighted graph, level-order traversal

```
queue = [start]
visited = {start}
distance = {start: 0}

while queue:
    node = queue.pop_front()
    for neighbor in adjacent(node):
        if neighbor not in visited:
            visited.add(neighbor)
            distance[neighbor] = distance[node] + 1
            queue.append(neighbor)
```

### Depth-First Search (DFS)

**Use when**: Path existence, cycle detection, topological sort, exhaustive search

```
def dfs(node, visited):
    if node in visited:
        return
    visited.add(node)
    for neighbor in adjacent(node):
        dfs(neighbor, visited)
```

### Dijkstra's Algorithm

**Use when**: Shortest path with weighted edges (non-negative weights)

```
priority_queue = [(0, start)]  # (distance, node)
distances = {start: 0}

while priority_queue:
    dist, node = pop_min(priority_queue)
    if dist > distances.get(node, infinity):
        continue
    for neighbor, weight in edges(node):
        new_dist = dist + weight
        if new_dist < distances.get(neighbor, infinity):
            distances[neighbor] = new_dist
            push(priority_queue, (new_dist, neighbor))
```

### A* Search

**Use when**: Shortest path with good heuristic available

Like Dijkstra but priority = `cost + heuristic(node, goal)`
- Heuristic must be admissible (never overestimate)
- Common: Manhattan distance for grids

```
priority_queue = [(heuristic(start, goal), 0, start)]  # (f, g, node)
g_scores = {start: 0}

while priority_queue:
    _, g, node = pop_min(priority_queue)
    if node == goal:
        return g
    for neighbor, weight in edges(node):
        new_g = g + weight
        if new_g < g_scores.get(neighbor, infinity):
            g_scores[neighbor] = new_g
            f = new_g + heuristic(neighbor, goal)
            push(priority_queue, (f, new_g, neighbor))
```

## Dynamic Programming

### Recognition Signs

- Optimal substructure (solution built from sub-solutions)
- Overlapping subproblems (same calculations repeated)
- "Count the number of ways..."
- "Find minimum/maximum..."
- "Is it possible to..."

### Top-Down (Memoization)

```
memo = {}

def solve(state):
    if state in memo:
        return memo[state]
    if is_base_case(state):
        return base_value(state)

    result = combine(solve(subproblem) for subproblem in subproblems(state))
    memo[state] = result
    return result
```

### Bottom-Up (Tabulation)

```
dp = initialize_base_cases()

for state in topological_order():
    dp[state] = combine(dp[subproblem] for subproblem in subproblems(state))

return dp[final_state]
```

### Key Insight

**State definition is everything.** Ask: "What information do I need to make the next decision?"

Parameters must be **hashable** (use tuples, not lists).

## Cycle Detection

### Floyd's Algorithm (Tortoise and Hare)

**Use when**: "After N iterations..." where N is astronomically large

```
def find_cycle(initial_state, step_function):
    # Phase 1: Find a point in the cycle
    slow = fast = initial_state
    while True:
        slow = step(slow)
        fast = step(step(fast))
        if slow == fast:
            break

    # Phase 2: Find cycle start
    slow = initial_state
    while slow != fast:
        slow = step(slow)
        fast = step(fast)
    cycle_start = slow

    # Phase 3: Find cycle length
    cycle_length = 1
    fast = step(slow)
    while fast != slow:
        fast = step(fast)
        cycle_length += 1

    return cycle_start, cycle_length
```

**Using the cycle:**
```
# To find state after N steps:
remaining = (N - steps_to_cycle_start) % cycle_length
result = cycle_states[remaining]
```

## Binary Search

**Use when**: Monotonic property, "find minimum X such that..."

```
def binary_search(lo, hi, predicate):
    while lo < hi:
        mid = (lo + hi) // 2
        if predicate(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo
```

## Flood Fill

**Use when**: Finding connected regions, counting areas

```
def flood_fill(grid, start, target, replacement):
    if grid[start] != target:
        return

    queue = [start]
    visited = {start}

    while queue:
        pos = queue.pop()
        grid[pos] = replacement
        for neighbor in adjacent(pos):
            if neighbor not in visited and grid[neighbor] == target:
                visited.add(neighbor)
                queue.append(neighbor)
```

## Simulation

**Use when**: Problem describes step-by-step process

1. Model state explicitly
2. Implement transition function
3. Watch for cycles to skip iterations

```
state = initial_state
seen = {state: 0}

for step in range(1, max_steps + 1):
    state = transition(state)
    if state in seen:
        cycle_start = seen[state]
        cycle_length = step - cycle_start
        remaining = (target_step - cycle_start) % cycle_length
        # Look up result from stored states
        break
    seen[state] = step
```

## Number Theory

### GCD / LCM

For cycle synchronization:
```
gcd(a, b) = gcd(b, a % b)  # Euclidean algorithm
lcm(a, b) = a * b // gcd(a, b)
```

### Chinese Remainder Theorem

For multiple modular conditions:
```
# x ≡ a₁ (mod m₁)
# x ≡ a₂ (mod m₂)
# Find x (mod m₁*m₂)
```

### Modular Arithmetic

For large numbers, keep results under control:
```
result = (result + new_value) % MOD
result = (result * factor) % MOD
```
