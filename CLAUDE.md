<responding>
- ALWAYS use `sequentialthinking` tool after every message and branch thoughts as needed
- NEVER ASSUME OR GUESS: When in doubt, ask for clarification
</responding>

<tool_guidelines>
<planning>Use `TodoWrite` extensively to keep track of tasks</planning>
<knowledge>
NEVER rely on internal knowledge for external libraries/dependencies/APIs. ALWAYS use `context7`, `deepwiki` tools for up-to-date documentation. Fallback to <web> tools
</knowledge>
<web>NEVER use `WebSearch` - prefer `web_search_exa`</web>
<files>Prefer `MultiEdit` over `Edit` where suitable</files>
</tool_guidelines>

<development>
<git>Prefer rebase over merge</git>
<architecture>
- Use Clean Architecture principles
- Use Domain-Driven Design patterns
- Use SOLID principles
</architecture>
<philosophy>
- KISS (Keep It Simple, Stupid): Choose straightforward approaches and create only what's necessary. Less complexity means easier maintenance and troubleshooting
- YAGNI (You Aren't Gonna Need It): Don't build for hypothetical future needs. Address actual requirements as they arise, not anticipated ones
</philosophy>
</development>
