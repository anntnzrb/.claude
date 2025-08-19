<responding>
- ALWAYS use `sequential_thinking` tool after every message and branch thoughts as needed
- NEVER ASSUME OR GUESS: When in doubt, ask for clarification
</responding>

<tool_guidelines>
<libraries>
- NEVER rely on internal knowledge for external libraries/frameworks/APIs - always check up-to-date documentation
- Use `ref_search_documentation` & `ref_read_url` to gather up-to-date documentation
- Fallback to web tools
</libraries>
<web>
- NEVER use `WebFetch` or `WebSearch` - prefer `web_search_exa`
</web>
<file_operations>
- Prefer `MultiEdit` over `Edit` where suitable
- Prefer using serena's semantic search/edit tools as they provide LSP-based symbol understanding and precise code navigation, in contrast to basic file reading which is token-inefficient and lacks structural awareness
- Use `replace_regex`, `delete_lines`, `replace_lines`, `insert_at_line` over `Edit`/`MultiEdit` - for precise file editing operations
- Use `list_dir`, `find_file` over `LS`, `Glob` - for project-aware file discovery
- Use `search_for_pattern` over `Grep` - for project-scoped content search with safety
- Use `Grep` over `search_for_pattern` - for complex patterns, multi-project searches, performance-critical scenarios
- Use `get_symbols_overview`, `find_symbol`, `find_referencing_symbols` over `Read`, `Grep` - for semantic code understanding
- Use `replace_symbol_body`, `insert_after_symbol`, `insert_before_symbol` over `Write`/`Edit`/`MultiEdit` - for semantic code modifications
</file_operations>
<serena>
- NEVER perform onboarding unless explicitly told to do so
</serena>
</tool_guidelines>

<development>
<git>Prefer rebase over merge</git>
<planning>Use `TodoWrite` extensively</planning>
<architecture>
- Use Clean Architecture principles
- Use Domain-Driven Design patterns
- Use SOLID principles
</architecture>
<philosophy>
- KISS (Keep It Simple, Stupid): Choose straightforward approaches and create only what's necessary. Less complexity means easier maintenance and troubleshooting.
- YAGNI (You Aren't Gonna Need It): Don't build for hypothetical future needs. Address actual requirements as they arise, not anticipated ones.
</philosophy>
</development>
