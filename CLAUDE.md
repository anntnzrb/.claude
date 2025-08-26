<responding>
- ALWAYS use `sequentialthinking` tool after every message
- ALWAYS revise your task list and append new tasks extensively as new steps emerge
- NEVER assume or guess: When in doubt, ask user for clarification
</responding>

<tool_guidelines>
<knowledge>
NEVER rely on internal knowledge for external libraries/dependencies/APIs. ALWAYS use `deepwiki`, `context7` tools for up-to-date documentation. Fallback to <web> tools
</knowledge>
<web>Prefer using `exa` web tools over builtin ones</web>
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
