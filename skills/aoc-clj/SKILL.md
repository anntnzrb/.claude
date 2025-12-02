---
name: aoc-clj
description: Develop Advent of Code solutions in Clojure using Babashka. Activate when user provides AoC problem context/input or mentions solving AoC days. Uses TDD and DDD approach with idiomatic patterns.
---

# Advent of Code Clojure Solver

Expert Clojure developer solving AoC problems with **Babashka**, using **DDD** (domain-first) and **TDD** (test-first).

## Workflow

```
1. DOMAIN    → Define data structures from problem description
2. RED       → Write failing tests from examples
3. GREEN     → Implement minimal code to pass
4. REFACTOR  → Clean up while tests stay green
5. RUN       → Execute on real input
```

## Approach

### 1. Domain First (DDD)

Read the problem and define the domain before any logic:

```clojure
;; Domain - WHAT are we working with?
;; e.g., "robots moving on a grid with velocity"

(defrecord Robot [pos vel])      ; or just use maps
(defrecord Grid [width height])

;; Parse input INTO domain
(defn parse-robot [line] ...)
```

### 2. Test First (TDD)

Extract examples from problem, write tests BEFORE implementation:

```clojure
(def example "...")  ; from problem description

(deftest test-part1
  (is (= EXPECTED (part1 (parse example)))))
```

### 3. Pipeline Everything

```clojure
(->> input str/split-lines (map parse-line) (filter valid?) (reduce +))
```

### 4. Destructure Eagerly

```clojure
(let [[a b c] (str/split line #" ")] ...)
(for [[_ x y] (re-seq #"(\d+),(\d+)" s)] ...)
```

## Template

```clojure
#!/usr/bin/env bb

(require '[clojure.string :as str]
         '[clojure.test :refer [deftest is run-tests]])

;; ─────────────────────────────────────────────────────────────
;; Domain
;; ─────────────────────────────────────────────────────────────

;; TODO: Define domain types/structures

;; ─────────────────────────────────────────────────────────────
;; Parsing
;; ─────────────────────────────────────────────────────────────

(def example "TODO")

(defn parse [input]
  (->> input str/split-lines (mapv identity)))

;; ─────────────────────────────────────────────────────────────
;; Solution
;; ─────────────────────────────────────────────────────────────

(defn part1 [data] nil)
(defn part2 [data] nil)

;; ─────────────────────────────────────────────────────────────
;; Tests
;; ─────────────────────────────────────────────────────────────

(deftest test-part1 (is (= :TODO (part1 (parse example)))))
(deftest test-part2 (is (= :TODO (part2 (parse example)))))

;; ─────────────────────────────────────────────────────────────

(when (= *file* (System/getProperty "babashka.file"))
  (let [results (run-tests)]
    (when (zero? (+ (:fail results) (:error results)))
      (println "\n✓ Tests pass!")
      (let [data (parse (slurp "input.txt"))]
        (println "Part 1:" (part1 data))
        (println "Part 2:" (part2 data))))))
```

## Execution

```bash
bb dayXX.clj          # RED → implement → GREEN → answers
bb nrepl-server 1667  # REPL exploration
```

## Guidelines

1. **Domain first** - name and structure the problem space
2. **Parse into domain** - input → domain types
3. **Test before code** - examples → assertions
4. **Pipeline with ->>** - data flows top to bottom
5. **Destructure at binding** - unpack immediately
