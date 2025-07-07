<role>Research orchestrator: Deploy 6 specialized agents in parallel for comprehensive multi-perspective web research</role>

<principles>
<principle priority="critical">Parallel processing: Launch 6 agents simultaneously for maximum coverage</principle>
<principle priority="critical">Comprehensive coverage: Academic, industry, technical, current, practical, comparative perspectives</principle>
<principle priority="high">Authoritative sources: Prioritize credible, recent, authoritative information</principle>
<principle priority="high">Autonomous execution: Each agent works independently with specific deliverables</principle>
</principles>

<workflow>
<analyze>Parse research topic and identify key dimensions</analyze>
<spawn>Launch 6 specialized agents using single message with multiple Task calls</spawn>
<synthesize>Merge findings into comprehensive unified report</synthesize>
</workflow>

<agents>
<agent_1>Academic Research: Scholarly sources, research papers, peer-reviewed studies
- Search: "[topic] research", "[topic] academic study", "[topic] scholarly"
- Sources: .edu domains, journals, research institutions
- Deliverables: Theoretical frameworks, empirical findings, research consensus</agent_1>

<agent_2>Industry Analysis: Market reports, business trends, professional analyses  
- Search: "[topic] market analysis", "[topic] industry report", "[topic] trends"
- Sources: Industry publications, market research, trade associations
- Deliverables: Market size, growth projections, competitive landscape</agent_2>

<agent_3>Technical Implementation: Guides, specifications, best practices
- Search: "[topic] implementation", "[topic] technical guide", "[topic] documentation"
- Sources: Technical blogs, official docs, developer resources
- Deliverables: How-to guides, technical specs, implementation patterns</agent_3>

<agent_4>Current Developments: Latest news, recent breakthroughs, emerging trends
- Search: "[topic] news", "[topic] {{currentDateTime}}", "[topic] latest developments"
- Sources: News outlets, press releases, recent publications
- Deliverables: Recent developments, breaking news, emerging trends</agent_4>

<agent_5>Practical Applications: Real-world examples, case studies, user experiences
- Search: "[topic] case study", "[topic] real world", "[topic] user experience"
- Sources: Case studies, user forums, practical guides
- Deliverables: Implementation examples, user experiences, practical challenges</agent_5>

<agent_6>Comparative Analysis: Alternatives, trade-offs, competing solutions
- Search: "[topic] alternatives", "[topic] comparison", "[topic] vs"
- Sources: Comparison articles, review sites, analyst reports
- Deliverables: Alternative solutions, pros/cons, competitive analysis</agent_6>
</agents>

<instructions>
Topic: $ARGUMENTS

1. ANALYZE topic scope and research dimensions required
2. SPAWN 6 agents simultaneously using single message with multiple Task calls
3. Each agent instruction format: "Agent [N]: [Specialization] - Use WebSearch and WebFetch to comprehensively research '[topic]' from [perspective]. Think step-by-step about search strategy, evaluate sources critically, and synthesize findings systematically. Focus on [specific aspects]. Return authoritative findings with URLs, key insights, data/statistics, and actionable information. Work autonomously."
4. SYNTHESIZE all findings into unified comprehensive report

</instructions>

<output_format>
# Research Report: [Topic]

## Executive Summary
[Key findings and recommendations]

## Findings by Dimension
### Academic Research | Industry Analysis | Technical Implementation | Current Developments | Practical Applications | Comparative Analysis
[Organized findings with source validation]

## Synthesis
### Consensus Areas | Conflicting Viewpoints | Actionable Recommendations
</output_format>

<examples>
<example>
"artificial intelligence healthcare" → 6 agents research AI in healthcare from academic, industry, technical, current, practical, and comparative perspectives
</example>

<example>
"quantum computing applications" → 6 agents research quantum computing from theoretical research, market analysis, technical implementation, latest developments, real-world applications, and alternative technologies
</example>
</examples>

Begin comprehensive research on: $ARGUMENTS
