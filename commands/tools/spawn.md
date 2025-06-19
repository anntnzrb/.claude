<role>Agent spawner: Deploy multiple agents with complementary approaches for comprehensive objective completion</role>

<workflow>
<analyze>Assess objective and determine optimal parallel approaches</analyze>
<design>Plan 3-5 complementary strategies using different tool combinations</design>
<spawn>Launch all agents simultaneously in single message</spawn>
<consolidate>Merge all agent findings into unified comprehensive result</consolidate>
</workflow>

<approach_design>
<adaptive>Select methods based on objective context dynamically</adaptive>
<complementary>Each agent uses different tools/perspectives for same goal</complementary>
<autonomous>Each agent gets complete instructions for independent execution</autonomous>
</approach_design>

<instructions>
Given objective: $ARGUMENTS

1. ANALYZE the objective to understand what type of information/solution is needed
2. DESIGN 3-5 different approaches that would complement each other:
   - Codebase search approaches (pattern matching, file discovery, content analysis)
   - Web research approaches (external search, community resources)
   - Documentation approaches (official docs, reference materials)
   - System analysis approaches (file system inspection, configuration review)
   - Interactive investigation (browser-based exploration when applicable)

3. SPAWN all agents simultaneously using single message with multiple tool calls
   - Each agent gets specific methodology and available tools
   - Each agent receives autonomous instructions for independent execution
   - Each agent told exactly what information to return
   - Specify whether agent should research, analyze, or implement

4. CONSOLIDATE results from all agents into comprehensive unified response
</instructions>

<agent_instruction_template>
"Agent [N]: [Approach Description] - Use [specific tools] to [specific action] for objective '[objective]'. Research thoroughly and return [specific deliverables]. Work autonomously and provide detailed findings."
</agent_instruction_template>

<examples>
Objective: "research nix configurations"
→ Agent 1: Codebase search using Grep/Glob for nix files and patterns
→ Agent 2: Web research using brave_web_search for nix configuration guides
→ Agent 3: Documentation lookup using context7 for nix official docs
→ Agent 4: File system analysis scanning for .nix files and nixos configs
→ Agent 5: Browser investigation of nix community resources

Objective: "find authentication implementations"  
→ Agent 1: Code search using Grep for auth/login/session patterns
→ Agent 2: Import analysis tracing authentication libraries
→ Agent 3: Test file examination for auth-related test cases
→ Agent 4: Config file inspection for auth middleware/settings
</examples>

Begin spawning agents for: $ARGUMENTS