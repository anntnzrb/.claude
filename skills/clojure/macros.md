# Macros & Metaprogramming

## When to Use Macros

Use macros when you need:
- **New control flow** (like `when`, `if-let`)
- **Code transformation** at compile time
- **DSLs** with custom syntax
- **Performance** (avoiding function call overhead)

**Don't use macros** when a function would work - functions are simpler, composable, and can be passed as values.

```clojure
;; BAD: macro for simple transformation
(defmacro add-one [x] `(+ ~x 1))

;; GOOD: function instead
(defn add-one [x] (+ x 1))
```

## Syntax Quoting Basics

### Quote vs Syntax Quote

```clojure
;; Quote: literal list
'(a b c)         ; => (a b c)

;; Syntax quote: namespace-qualified + unquoting
`(a b c)         ; => (user/a user/b user/c)

;; Unquote: insert value
(let [x 1]
  `(a ~x c))     ; => (user/a 1 user/c)

;; Unquote-splicing: insert sequence elements
(let [xs [1 2 3]]
  `(a ~@xs b))   ; => (user/a 1 2 3 user/b)
```

### Simple Macro

```clojure
(defmacro unless [pred & body]
  `(if (not ~pred)
     (do ~@body)))

;; Usage
(unless (empty? items)
  (process items)
  (notify))

;; Expands to
(if (not (empty? items))
  (do (process items)
      (notify)))
```

## Hygiene with Gensym

### The Problem

```clojure
;; BAD: name collision
(defmacro with-value [v & body]
  `(let [x ~v]     ; x might shadow user's x!
     ~@body))

(let [x 10]
  (with-value 5
    (+ x x)))      ; User expects 20, gets 10!
```

### The Solution: Auto-gensym

```clojure
;; GOOD: auto-gensym with #
(defmacro with-value [v & body]
  `(let [x# ~v]    ; x# generates unique name
     ~@body))

;; Or explicit gensym
(defmacro with-value [v & body]
  (let [sym (gensym "x")]
    `(let [~sym ~v]
       ~@body)))
```

### Complete Example

```clojure
(defmacro with-timing [& body]
  `(let [start# (System/currentTimeMillis)]
     (try
       ~@body
       (finally
         (println "Elapsed:"
           (- (System/currentTimeMillis) start#)
           "ms")))))

(with-timing
  (Thread/sleep 100)
  :done)
; Elapsed: 100 ms
; => :done
```

## Macro Debugging

### macroexpand

```clojure
;; Expand one level
(macroexpand '(unless true (println "hi")))
; => (if (clojure.core/not true) (do (println "hi")))

;; Expand all levels
(macroexpand-all '(unless true (println "hi")))

;; Pretty print
(clojure.pprint/pprint
  (macroexpand '(my-macro ...)))
```

### Common Mistakes

```clojure
;; MISTAKE: Double evaluation
(defmacro square [x]
  `(* ~x ~x))

(square (expensive-fn))  ; Calls expensive-fn TWICE!

;; FIX: Bind once
(defmacro square [x]
  `(let [x# ~x]
     (* x# x#)))
```

## Useful Patterns

### Conditional Compile

```clojure
(defmacro when-dev [& body]
  (when (= "dev" (System/getenv "ENV"))
    `(do ~@body)))

;; Only compiles in dev
(when-dev
  (println "Debug mode"))
```

### Resource Management

```clojure
(defmacro with-resource [binding & body]
  `(let [~(first binding) ~(second binding)]
     (try
       ~@body
       (finally
         (close! ~(first binding))))))

;; Usage
(with-resource [conn (connect)]
  (query conn "SELECT ..."))
```

### Threading Helpers

```clojure
(defmacro ->? [expr & forms]
  "Thread if not nil"
  `(some-> ~expr ~@forms))

(defmacro ->>? [expr & forms]
  "Thread-last if not nil"
  `(some->> ~expr ~@forms))
```

### Assertion with Context

```clojure
(defmacro assert-with [test msg & ctx]
  `(when-not ~test
     (throw (ex-info ~msg
              (hash-map ~@ctx)))))

(assert-with (pos? x) "x must be positive"
  :x x
  :context "validation")
```

## &form and &env

### Access Call Site Info

```clojure
;; &form: the actual form being expanded
;; &env: local bindings at expansion site

(defmacro debug [expr]
  `(let [result# ~expr]
     (println "Form:" '~expr)
     (println "Result:" result#)
     result#))

(defmacro locals []
  "Return map of local bindings"
  (into {}
    (for [k (keys &env)]
      [`'~k k])))

(let [x 1 y 2]
  (locals))
; => {x 1, y 2}
```

### Line Number from &form

```clojure
(defmacro log-location [msg]
  (let [{:keys [line column]} (meta &form)]
    `(println ~(str "[" line ":" column "]") ~msg)))
```

## Anaphoric Macros

```clojure
;; 'it' bound to test result
(defmacro if-it [test then else]
  `(let [~'it ~test]
     (if ~'it ~then ~else)))

(if-it (find-user id)
  (process it)    ; 'it' is the found user
  (not-found))

;; 'aif' - anaphoric if
(defmacro aif [test then & [else]]
  `(let [~'it ~test]
     (if ~'it ~then ~else)))
```

## DSL Example

### Simple Query DSL

```clojure
(defmacro query [table & clauses]
  (let [parsed (parse-clauses clauses)]
    `(execute-query
       {:table ~(keyword table)
        :where ~(:where parsed)
        :select ~(:select parsed)
        :order ~(:order parsed)})))

(defn- parse-clauses [clauses]
  (reduce
    (fn [acc [k & v]]
      (assoc acc k (vec v)))
    {}
    (partition-by keyword? clauses)))

;; Usage
(query users
  :where {:active true}
  :select [:name :email]
  :order [:created-at :desc])
```

### Mini Test Framework

```clojure
(defmacro deftest+ [name & body]
  `(defn ~name []
     (try
       ~@body
       (println "PASS:" '~name)
       (catch Exception e#
         (println "FAIL:" '~name)
         (println "  " (.getMessage e#))))))

(defmacro expect [expr]
  `(when-not ~expr
     (throw (ex-info "Expectation failed"
              {:expr '~expr}))))

(deftest+ test-math
  (expect (= 4 (+ 2 2)))
  (expect (pos? 1)))
```

## Testing Macros

```clojure
(deftest test-my-macro
  ;; Test expansion
  (is (= '(if (not x) (do y))
         (macroexpand-1 '(unless x y))))

  ;; Test behavior
  (is (= :executed (unless false :executed)))
  (is (nil? (unless true :not-executed))))
```
