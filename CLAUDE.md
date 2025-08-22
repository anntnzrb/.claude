<responding>
- ALWAYS use `think` tool after every message and branch thoughts as needed
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
</file_operations>
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
