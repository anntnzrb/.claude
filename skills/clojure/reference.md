# Reference Guide

## Data Structure Selection

| Need | Data Structure |
|------|----------------|
| Indexed access, append at end | Vector `[]` |
| Sequential prepend | List `'()` |
| Key-value lookup | Map `{}` |
| Membership testing, uniqueness | Set `#{}` |
| FIFO queue | `clojure.lang.PersistentQueue/EMPTY` |
| Ordered by key | Sorted map `(sorted-map)` |
| Coordinate storage | Vector/tuple as map key |

### When to Use What

- **Vector**: Default choice for sequences. O(~1) indexed access and append.
- **List**: When prepending is the primary operation (stacks, recursion).
- **Map**: Key-value associations. Keywords as keys for named fields.
- **Set**: Membership testing, deduplication, filtering.

## Naming Conventions

```clojure
;; kebab-case for vars and functions
(def max-retry-attempts 3)
(defn calculate-total-price [items] ...)

;; Predicates end with ?
(defn valid-email? [email] ...)

;; Side-effecting functions end with !
(defn save-user! [user] ...)
(defn reset-counter! [] ...)

;; Dynamic vars use earmuffs
(def ^:dynamic *config* {...})

;; CamelCase for protocols and records
(defprotocol Storage ...)
(defrecord DatabaseStorage [conn] ...)

;; Private functions use defn-
(defn- parse [input] ...)      ; Internal helper
(defn process [data] ...)      ; Public API
```

## Best Practices

### Do

- **Prefer pure functions**: Same input, same output, no side effects
- **Use immutable data**: Let Clojure's persistent data structures work for you
- **Leverage threading macros**: `->` and `->>` for readable pipelines
- **Destructure liberally**: Makes code self-documenting
- **Use keywords as functions**: `(:name user)` instead of `(get user :name)`
- **Keep functions small**: Single responsibility, testable in isolation
- **Use the REPL**: Develop incrementally, test immediately
- **Spec your data**: Define specs for critical domain entities

### Don't

- **Avoid mutable state**: Use atoms/refs only when necessary
- **Avoid deep nesting**: Threading macros and small functions
- **Don't reinvent the wheel**: Check clojure.core and standard library first
- **Don't overuse macros**: Functions are simpler, composable, testable
- **Avoid global state**: Pass dependencies explicitly or use dynamic vars
- **Don't ignore laziness**: Be aware when sequences are lazy vs realized

## REPL Workflow

```clojure
;; Reload namespace
(require '[myapp.core :as core] :reload)

;; Reload all dependencies
(require '[myapp.core :as core] :reload-all)

;; Inspect var metadata
(meta #'core/my-fn)

;; Find docs
(doc map)
(source map)
(apropos "str")

;; Pretty print
(clojure.pprint/pprint (complex-data))

;; Time execution
(time (expensive-operation))
```

## Performance Tips

### Avoid

- **Reflection**: Use type hints `^String` for hot paths
- **Realizing lazy seqs unnecessarily**: Use `first`, `take` when possible
- **Repeated hash lookups**: Destructure once, use locals
- **Boxing in tight loops**: Use primitive type hints

### Prefer

- **Transducers**: For multi-step transformations on large data
- **Reducers**: For parallel fold operations
- **Persistent vectors over lists**: For random access
- **`into` over repeated `conj`**: Batches efficiently
- **`mapv`/`filterv`**: When you need vectors, avoid intermediate lazy seqs

## Code Organization

```
src/
├── myapp/
│   ├── core.clj         ; Entry point, -main
│   ├── config.clj       ; Configuration loading
│   ├── domain/          ; Domain entities, specs
│   │   ├── user.clj
│   │   └── order.clj
│   ├── db/              ; Database access
│   │   └── queries.clj
│   └── api/             ; HTTP handlers
│       └── routes.clj
test/
├── myapp/
│   └── domain/
│       └── user_test.clj
```

## Common Idioms

```clojure
;; Safe navigation (nil-punning)
(some-> user :address :city str/upper-case)

;; Default values
(or (:name user) "Anonymous")
(:name user "Anonymous")  ; Same with get

;; Update multiple keys
(-> user
    (assoc :updated-at (java.util.Date.))
    (update :version inc))

;; Conditional update
(cond-> user
  admin? (assoc :role :admin)
  verified? (assoc :verified true))

;; Juxt for extracting multiple values
((juxt :name :email) user)  ; => ["Alice" "alice@ex.com"]

;; Frequencies for counting
(frequencies ["a" "b" "a" "c" "a"])
; => {"a" 3, "b" 1, "c" 1}

;; Group and transform
(->> items
     (group-by :category)
     (map-vals #(map :name %)))
```

## Error Handling

```clojure
;; Use ex-info for exceptions with data
(throw (ex-info "User not found" {:user-id id}))

;; Catch and extract data
(try
  (find-user id)
  (catch Exception e
    (let [{:keys [user-id]} (ex-data e)]
      (log/error "Failed for user:" user-id))))

;; Return result maps instead of exceptions
{:ok result}
{:error {:type :not-found :message "..."}}
```
