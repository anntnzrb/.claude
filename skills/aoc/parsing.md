# Input Parsing Patterns

## General Principles

- **Don't over-process**: Extract only what you need
- **Parse lazily**: Transform data at point of use when possible
- **Use pattern matching**: Regex or structured parsers beat manual string manipulation

## Common Formats

### Integer Extraction

When input contains numbers mixed with text:

```
Pattern: -?\d+
Matches: negative and positive integers
```

Example: `"pos=<3,-5>, vel=<-2,1>"` → `[3, -5, -2, 1]`

### Grid of Characters

```
lines = input.split('\n')
grid = [list(line) for line in lines]
# Access: grid[row][col]
```

### Blank-Line Separated Groups

```
groups = input.split('\n\n')
for group in groups:
    items = group.split('\n')
```

### Key-Value Pairs

```
data = {}
for line in lines:
    key, value = line.split(': ')
    data[key] = value
```

### Instructions / Opcodes

```
for line in lines:
    parts = line.split()
    op = parts[0]
    args = parts[1:]
    # or use regex for structured formats
```

## Grid Representations

### Dense Grid (2D Array)

**Best for**: Fixed-size grids, frequent neighbor access

```
grid = [[cell for cell in line] for line in lines]
value = grid[row][col]
```

**Watch out**: Row/column vs x/y confusion

### Sparse Grid (Dictionary)

**Best for**: Infinite grids, sparse data, coordinates as keys

```
grid = {}
for row, line in enumerate(lines):
    for col, char in enumerate(line):
        if char != '.':  # only store non-empty
            grid[(row, col)] = char

value = grid.get((row, col), default='.')
```

**Benefit**: No bounds checking needed, use default values

## Coordinate Systems

### Convention: Pick ONE and stick with it

| Style | Access | Notes |
|-------|--------|-------|
| `(row, col)` | Matrix style | Row increases downward |
| `(x, y)` | Cartesian | Y often increases upward |
| `(col, row)` | Rare | Sometimes matches problem |

**Recommendation**: `(row, col)` with row↓ matches typical grid display

### Complex Numbers for 2D

Position as `x + yi`:
- **Movement**: `pos + direction`
- **Rotation**: Multiply by `i` (90° left) or `-i` (90° right)
- **Manhattan distance**: `|real| + |imag|`

## Direction Handling

### Cardinal Directions

```
UP    = (-1, 0)   # or complex: -1j
DOWN  = (1, 0)    # or complex: 1j
LEFT  = (0, -1)   # or complex: -1
RIGHT = (0, 1)    # or complex: 1

DIRS4 = [UP, DOWN, LEFT, RIGHT]
```

### 8-Directional (with diagonals)

```
DIRS8 = [(dr, dc) for dr in [-1, 0, 1]
                   for dc in [-1, 0, 1]
                   if (dr, dc) != (0, 0)]
```

### Direction from Characters

```
DIR_MAP = {
    'U': (-1, 0), '^': (-1, 0),
    'D': (1, 0),  'v': (1, 0),
    'L': (0, -1), '<': (0, -1),
    'R': (0, 1),  '>': (0, 1),
}
```

## Rotation Patterns

```
90° clockwise:     (row, col) → (col, -row)
90° counter-clock: (row, col) → (-col, row)
180°:              (row, col) → (-row, -col)
```

With complex numbers:
```
90° right: pos * -1j
90° left:  pos * 1j
180°:      pos * -1
```

## Hex Grid Coordinates

Use **cube coordinates** (x, y, z where x + y + z = 0):

```
# Six neighbors
HEX_DIRS = {
    'e':  (1, -1, 0),
    'w':  (-1, 1, 0),
    'ne': (1, 0, -1),
    'nw': (0, 1, -1),
    'se': (0, -1, 1),
    'sw': (-1, 0, 1),
}

def hex_neighbor(pos, direction):
    dx, dy, dz = HEX_DIRS[direction]
    x, y, z = pos
    return (x + dx, y + dy, z + dz)

def hex_distance(a, b):
    return (abs(a[0]-b[0]) + abs(a[1]-b[1]) + abs(a[2]-b[2])) // 2
```

## Boundary Handling

### Padding with Sentinel Values

```
padded = [['#'] * (width + 2)]
for line in lines:
    padded.append(['#'] + list(line) + ['#'])
padded.append(['#'] * (width + 2))
```

### Bounds Checking

```
def in_bounds(row, col, grid):
    return 0 <= row < len(grid) and 0 <= col < len(grid[0])

def neighbors(row, col, grid):
    for dr, dc in DIRS4:
        nr, nc = row + dr, col + dc
        if in_bounds(nr, nc, grid):
            yield nr, nc
```

### Default Values (Sparse Grid)

```
value = grid.get((row, col), '.')  # default for out-of-bounds
```

### Wrapping (Toroidal)

```
row = row % height
col = col % width
```
