# Concurrency & State Management

## Reference Types Overview

| Type | Use Case | Coordination | Sync/Async |
|------|----------|--------------|------------|
| Atom | Independent state | None | Sync |
| Ref | Coordinated state | STM | Sync |
| Agent | Async updates | None | Async |
| Var | Thread-local | None | Sync |

## Atoms

### Basic Usage

```clojure
;; Create
(def counter (atom 0))
(def users (atom {}))

;; Read
@counter          ; => 0
(deref counter)   ; => 0

;; Update with swap! (fn applied to current value)
(swap! counter inc)           ; => 1
(swap! counter + 5)           ; => 6
(swap! users assoc :alice {:name "Alice"})

;; Replace with reset! (use sparingly)
(reset! counter 0)

;; Compare-and-set (low-level)
(compare-and-set! counter 0 1) ; true if was 0
```

### Atom Patterns

```clojure
;; Update and return old value
(let [old @counter]
  (swap! counter inc)
  old)

;; Conditional update
(swap! state
  (fn [s]
    (if (valid? s)
      (transform s)
      s)))

;; With validators
(def positive (atom 0 :validator pos?))
(reset! positive -1) ; throws

;; With watchers
(add-watch counter :logger
  (fn [key ref old new]
    (println "Changed from" old "to" new)))

(remove-watch counter :logger)
```

### Thread-Safe Cache

```clojure
(def cache (atom {}))

(defn cached [key compute-fn]
  (if-let [v (get @cache key)]
    v
    (let [v (compute-fn)]
      (swap! cache assoc key v)
      v)))

;; Or use swap! with update-if-absent pattern
(defn memoized-get [cache key compute-fn]
  (or (get @cache key)
      (get (swap! cache
             (fn [m]
               (if (contains? m key)
                 m
                 (assoc m key (compute-fn)))))
           key)))
```

## Refs & STM

### Coordinated Updates

```clojure
;; Create refs
(def account-a (ref {:balance 1000}))
(def account-b (ref {:balance 500}))

;; Transaction: all-or-nothing
(dosync
  (alter account-a update :balance - 100)
  (alter account-b update :balance + 100))

;; Read inside transaction
(dosync
  (let [total (+ (:balance @account-a)
                 (:balance @account-b))]
    (println "Total:" total)))
```

### Ref Operations

```clojure
;; alter: apply fn (retries on conflict)
(dosync (alter counter inc))

;; commute: apply fn (no retry for commutative ops)
(dosync (commute counter inc))

;; ref-set: replace value
(dosync (ref-set counter 0))

;; ensure: read consistency without modify
(dosync
  (ensure account-a)
  (if (> (:balance @account-a) 100)
    (alter account-b update :balance + 50)))
```

### STM Guidelines

```clojure
;; DO: Use for coordinated state
(dosync
  (alter inventory update item dec)
  (alter orders conj new-order))

;; DON'T: Side effects in transactions (may retry!)
(dosync
  (alter state transform)
  (send-email!))  ; BAD: may send multiple times

;; DO: Perform side effects after
(let [result (dosync (alter state transform))]
  (send-email! result))
```

## Agents

### Async State Updates

```clojure
;; Create
(def log-agent (agent []))

;; send: for CPU-bound work (fixed thread pool)
(send log-agent conj {:event :login :time (now)})

;; send-off: for blocking I/O (cached thread pool)
(send-off log-agent
  (fn [logs]
    (write-to-file! logs)
    []))

;; Read (current value, may have pending actions)
@log-agent

;; Wait for completion
(await log-agent)              ; Wait for this agent
(await-for 1000 agent1 agent2) ; Timeout ms
```

### Error Handling

```clojure
;; Check for errors
(agent-error log-agent)

;; Restart failed agent
(restart-agent log-agent []
  :clear-actions true)

;; Set error handler
(set-error-handler! log-agent
  (fn [ag ex]
    (println "Agent error:" (.getMessage ex))))

;; Set error mode
(set-error-mode! log-agent :continue) ; or :fail
```

### Agent for Serialized I/O

```clojure
(def file-writer (agent nil))

(defn write-line [filename line]
  (send-off file-writer
    (fn [_]
      (spit filename (str line "\n") :append true))))

;; All writes serialized, no locks needed
(write-line "log.txt" "Event 1")
(write-line "log.txt" "Event 2")
```

## Dynamic Vars

### Thread-Local State

```clojure
;; Define with earmuffs
(def ^:dynamic *db-conn* nil)
(def ^:dynamic *request* nil)

;; Bind for scope
(binding [*db-conn* (connect!)
          *request* {:user "alice"}]
  (do-work))

;; Access
(defn current-user []
  (:user *request*))

;; Nested bindings shadow outer
(binding [*db-conn* conn1]
  (query)  ; uses conn1
  (binding [*db-conn* conn2]
    (query)))  ; uses conn2
```

### Thread Inheritance

```clojure
;; bound-fn preserves bindings for new threads
(binding [*x* 10]
  (future (bound-fn [] (println *x*))))  ; prints 10

;; Without bound-fn, future sees root binding
(binding [*x* 10]
  (future (println *x*)))  ; prints root value
```

## core.async

### Channels

```clojure
(require '[clojure.core.async :as a
           :refer [go go-loop chan <! >! <!! >!!
                   close! timeout alts! alts!!]])

;; Create channels
(def ch (chan))           ; Unbuffered
(def ch (chan 10))        ; Buffered (10 items)
(def ch (chan (a/sliding-buffer 10)))  ; Drops oldest
(def ch (chan (a/dropping-buffer 10))) ; Drops newest

;; With transducer
(def ch (chan 10 (map inc)))

;; Close
(close! ch)
```

### Go Blocks (Lightweight Threads)

```clojure
;; Produce
(go
  (>! ch 1)
  (>! ch 2)
  (close! ch))

;; Consume
(go-loop []
  (when-let [v (<! ch)]
    (println "Got:" v)
    (recur)))

;; Blocking (outside go blocks)
(>!! ch value)  ; Block until taken
(<!! ch)        ; Block until available
```

### Select (alts!)

```clojure
(go
  (let [[v port] (alts! [ch1 ch2 (timeout 1000)])]
    (cond
      (= port ch1) (println "From ch1:" v)
      (= port ch2) (println "From ch2:" v)
      :else (println "Timeout!"))))

;; With priority
(alts! [ch1 ch2] :priority true)  ; Prefer ch1

;; With default
(alts! [ch1 ch2] :default :none)  ; Don't block
```

### Pipelines

```clojure
;; Parallel processing
(a/pipeline 4       ; parallelism
  out-ch            ; output
  (map process)     ; transducer
  in-ch)            ; input

;; Async pipeline (for async operations)
(a/pipeline-async 4
  out-ch
  (fn [v out-ch]
    (go
      (>! out-ch (async-process v))
      (close! out-ch)))
  in-ch)

;; Blocking pipeline (for blocking I/O)
(a/pipeline-blocking 4
  out-ch
  (map blocking-process)
  in-ch)
```

### Common Patterns

```clojure
;; Fan-out: one producer, multiple consumers
(let [ch (chan)]
  (dotimes [i 3]
    (go-loop []
      (when-let [v (<! ch)]
        (println "Worker" i "got" v)
        (recur)))))

;; Fan-in: multiple producers, one consumer
(defn fan-in [chs]
  (let [out (chan)]
    (doseq [ch chs]
      (go-loop []
        (when-let [v (<! ch)]
          (>! out v)
          (recur))))
    out))

;; Pub/sub
(def publisher (chan))
(def publication (a/pub publisher :topic))

(let [sub-ch (chan)]
  (a/sub publication :news sub-ch)
  (go-loop []
    (when-let [msg (<! sub-ch)]
      (println "News:" msg)
      (recur))))

(go (>! publisher {:topic :news :content "Hello"}))
```

## Futures & Promises

### Futures

```clojure
;; Start async computation
(def result (future
              (Thread/sleep 1000)
              42))

;; Check if done
(realized? result)  ; => false/true

;; Get result (blocks)
@result             ; => 42
(deref result 500 :timeout)  ; With timeout
```

### Promises

```clojure
;; Create empty promise
(def p (promise))

;; Deliver value (once only)
(deliver p 42)

;; Get value (blocks until delivered)
@p  ; => 42

;; Check if delivered
(realized? p)
```

### Delays

```clojure
;; Deferred computation (runs once when dereferenced)
(def expensive (delay
                 (println "Computing...")
                 (reduce + (range 1000000))))

;; Force evaluation
@expensive  ; prints "Computing...", returns result
@expensive  ; returns cached result, no recomputation
```
