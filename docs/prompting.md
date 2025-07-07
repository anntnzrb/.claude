# Guide to Prompt Engineering for Claude

## Table of Contents
1. [Fundamental Principles](#fundamental-principles)
2. [Core Techniques (Ordered by Effectiveness)](#core-techniques)
3. [Advanced Techniques](#advanced-techniques)
4. [Claude 4 Specific Best Practices](#claude-4-specific-best-practices)
5. [Detailed Examples and Use Cases](#detailed-examples-and-use-cases)
6. [Quick Reference Guide](#quick-reference-guide)
7. [Compatibility](#-compatibility)

---

## Fundamental Principles

### The Golden Rule: Be Clear and Direct

**Core Principle**: Treat Claude like a "brilliant but very new employee (with amnesia) who needs explicit instructions."

**Test Your Clarity**: Show your prompt to a colleague with minimal context. If they're confused, Claude will likely be confused too.

#### 1. Provide Contextual Information
- Explain the task's purpose
- Describe the intended audience
- Outline the workflow
- Clarify the end goal

#### 2. Be Specific and Precise
- State exactly what you want Claude to do
- Use numbered or bulleted sequential steps
- Avoid vague language and assumptions

**Example Transformation**:
```
❌ Bad: "Help me with customer feedback"
✅ Good: "Analyze the attached customer feedback emails and categorize them into: 1) Product issues, 2) Service complaints, 3) Feature requests, 4) Positive feedback. For each category, provide a count and list the top 3 specific issues mentioned."
```

---

## Core Techniques

### 1. Use Prompt Generator
- **Purpose**: Solves the "blank page problem" with high-quality templates
- **Location**: Anthropic Console
- **Benefits**: Follows best practices automatically
- **Compatibility**: Works with all Claude models

### 2. Be Clear and Direct
- **Implementation**: Use explicit instructions with context
- **Structure**: Numbered steps, clear objectives, specific requirements
- **Validation**: Test clarity with the "Golden Rule"

### 3. Multishot Prompting (Examples)
- **Definition**: Provide 3-5 diverse examples to guide behavior
- **Benefits**: 
  - Reduces misinterpretation of instructions
  - Enforces uniform structure and style
  - Boosts performance on complex tasks

**Example Structure**:
```xml
<examples>
<example>
Input: [example input]
Output: [desired output format]
</example>
<example>
Input: [different example]
Output: [consistent format]
</example>
</examples>

Now analyze: [your actual input]
```

### 4. Chain of Thought (Let Claude Think)
- **Purpose**: Improves accuracy through step-by-step reasoning
- **Key Insight**: "Always have Claude output its thinking. Without outputting its thought process, no thinking occurs!"

**Three Levels**:
1. **Basic**: "Think step-by-step"
2. **Guided**: "First analyze X, then consider Y, finally conclude Z"
3. **Structured**: Use XML tags like `<thinking>` and `<answer>`

### 5. Use XML Tags
- **Purpose**: Help Claude parse prompts more accurately
- **Benefits**: Clarity, reduced misinterpretation, easier modification

**Common Tags**:
```xml
<instructions>Your main task</instructions>
<context>Background information</context>
<examples>Sample inputs/outputs</examples>
<constraints>Limitations and requirements</constraints>
<output_format>Desired structure</output_format>
```

### 6. System Prompts (Give Claude a Role)
- **Implementation**: Use the `system` parameter to assign specific roles
- **Benefits**: Enhances accuracy, tailors communication style, improves focus

**Example**:
```
System: You are a senior financial analyst with 15 years of experience in risk assessment for Fortune 500 companies.

User: Analyze this quarterly report...
```

### 7. Prefill Claude's Response
- **Purpose**: Control output formatting and skip preambles
- **Method**: Add initial text to the "Assistant" message
- **Limitations**: Cannot end with trailing whitespace; works best with non-extended thinking modes

**Use Cases**:
- Force JSON output: Prefill with `{`
- Maintain character: Prefill with `[Character Name]:`
- Skip preambles: Prefill with direct content

---

## Advanced Techniques

### Chain Prompts (Complex Task Decomposition)
- **When to Use**: Complex tasks requiring multiple sequential steps
- **Benefits**: Improved accuracy, enhanced clarity, better traceability

**Workflow**:
1. Identify distinct sequential steps
2. Use XML tags to pass outputs between prompts
3. Ensure each subtask has a single, clear objective
4. Implement self-correction chains for high-stakes tasks

**Example Chain**:
```
Prompt 1: Research → Output: <research_findings>
Prompt 2: Analyze findings → Output: <analysis>
Prompt 3: Generate recommendations → Output: <recommendations>
```

### Long Context Tips (200K+ Token Handling)
- **Document Positioning**: Put longform data (~20K+ tokens) at the top
- **Performance Impact**: Positioning queries at the end improves response quality by up to 30%

**Document Structure**:
```xml
<document>
<source>Document name/URL</source>
<document_content>
[Large document content here]
</document_content>
</document>

<document>
<source>Another document</source>
<document_content>
[More content]
</document_content>
</document>

[Your query at the end]
```

**Ground in Quotes**: Ask Claude to quote relevant parts first to "cut through the noise"

### Extended Thinking (Advanced Reasoning)
- **Best Language**: English

**Best Practices**:
- Start with high-level, general instructions
- Allow Claude creative freedom in problem-solving
- Use multishot prompting with `<thinking>` tags
- Break complex instructions into numbered steps
- Have Claude reflect on and verify its work

**Cautions**:
- Don't pass Claude's thinking output back as input
- Avoid manually changing model output
- Don't generate tokens just for length

---

## Claude 4 Specific Best Practices

### Key Differences from Previous Versions
- **More Explicit Guidance Required**: Claude 4 models need clearer, more specific instructions
- **Enhanced Instruction Following**: Trained for precise instruction adherence
- **Better Tool Usage**: Optimized for parallel tool calling and efficient workflows

### Migration Recommendations
1. **Be More Explicit**: Add performance-enhancing modifiers to instructions
2. **Add Context**: Explain motivation behind instructions
3. **Request Specific Features**: Explicitly ask for animations, interactions, etc.
4. **Frame for Performance**: Use language that emphasizes desired behaviors

**Example Migration**:
```
❌ Claude 3.5: "Create a dashboard"
✅ Claude 4: "Create an analytics dashboard. Include as many relevant features and interactions as possible. Make it visually appealing with smooth animations."
```

### Optimization Strategies
- **Leverage Interleaved Thinking**: Use for complex reasoning tasks
- **Encourage Parallel Processing**: Request simultaneous tool usage
- **Minimize File Creation**: Ask for general, robust solutions
- **Control Response Format**: Be explicit about desired output structure

---

## Detailed Examples and Use Cases

### Example 1: Customer Feedback Analysis

**Before (Vague)**:
```
Analyze this customer feedback
```

**After (Optimized)**:
```xml
<instructions>
Analyze the provided customer feedback and categorize each piece according to the taxonomy below. For each category, provide specific counts and identify the top 3 most frequently mentioned issues.
</instructions>

<categories>
1. Product Issues (bugs, defects, quality problems)
2. Service Complaints (support, delivery, communication)
3. Feature Requests (new functionality, improvements)
4. Positive Feedback (praise, satisfaction, recommendations)
</categories>

<output_format>
## Category: [Name]
- Count: [number]
- Top Issues:
  1. [specific issue with frequency]
  2. [specific issue with frequency]
  3. [specific issue with frequency]
</output_format>

<feedback>
[Customer feedback data here]
</feedback>
```

### Example 2: Financial Analysis with Role Assignment

**System Prompt**:
```
You are a Chief Financial Officer with 20 years of experience in financial analysis and risk assessment for Fortune 500 companies.
```

**User Prompt**:
```xml
<instructions>
Analyze the attached quarterly financial report and provide strategic recommendations.
</instructions>

<analysis_framework>
1. Revenue and growth trends
2. Profitability and margin analysis
3. Cash flow and liquidity position
4. Risk factors and concerns
5. Strategic recommendations
</analysis_framework>

<thinking>
Work through each section of the analysis framework step by step, considering both the quantitative data and qualitative factors that might impact the business.
</thinking>

<report>
[Financial report data]
</report>
```

### Example 3: Legal Contract Analysis Chain

**Chain Step 1: Initial Analysis**
```xml
<instructions>
Perform an initial review of this legal contract and identify all key sections and clauses.
</instructions>

<contract>
[Contract text]
</contract>

Output your findings in this format:
<contract_structure>
- Section 1: [description]
- Section 2: [description]
[etc.]
</contract_structure>
```

**Chain Step 2: Risk Assessment**
```xml
<instructions>
Based on the contract structure identified below, analyze each section for potential legal risks and liabilities.
</instructions>

<contract_structure>
[Output from Step 1]
</contract_structure>

<risk_analysis>
Focus on:
- Liability exposure
- Termination clauses
- Indemnification terms
- Dispute resolution mechanisms
- Compliance requirements
</risk_analysis>
```

### Example 4: Extended Thinking for Complex Problem Solving

```xml
<instructions>
Solve this complex optimization problem using extended thinking. Break down your approach into clear steps and verify your solution.
</instructions>

<problem>
A company needs to optimize its supply chain across 5 warehouses, 12 distribution centers, and 100 retail locations, considering transportation costs, inventory holding costs, and service level requirements.
</problem>

<thinking>
I need to approach this systematically:

1. First, let me understand the problem structure and constraints
2. Then identify the key variables and relationships
3. Develop a mathematical model
4. Consider solution approaches
5. Verify the solution makes practical sense
</thinking>

<constraints>
- Maximum 48-hour delivery time
- Minimum 95% service level
- Budget limitations: $2M monthly
- Warehouse capacity limits
</constraints>
```

---

## Quick Reference Guide

### Prompt Engineering Checklist

**Before Writing**:
- [ ] Clear success criteria defined
- [ ] Testing method established
- [ ] Initial draft prepared

**Essential Elements**:
- [ ] Clear, specific instructions
- [ ] Relevant context provided
- [ ] Expected output format specified
- [ ] Examples included (if applicable)

**Advanced Techniques**:
- [ ] XML tags for structure
- [ ] Chain of thought reasoning
- [ ] Role assignment via system prompt
- [ ] Multishot examples provided

**Claude 4 Specific**:
- [ ] Explicit performance modifiers
- [ ] Detailed feature requests
- [ ] Context and motivation explained

### Common XML Tags

```xml
<instructions>Main task description</instructions>
<context>Background information</context>
<examples>Sample inputs/outputs</examples>
<constraints>Limitations and requirements</constraints>
<output_format>Desired structure</output_format>
<thinking>Reasoning instructions</thinking>
<data>Input data</data>
<criteria>Success metrics</criteria>
```

### Performance Optimization Quick Tips

1. **Positioning**: Long documents at top, queries at bottom
2. **Examples**: 3-5 diverse, relevant examples
3. **Thinking**: Always output reasoning process
4. **Structure**: Use XML tags for complex prompts
5. **Specificity**: Be explicit about desired behaviors
6. **Context**: Explain the why behind instructions
7. **Testing**: Validate with the "Golden Rule"

### Common Prompt Patterns

**Classification Task**:
```xml
<instructions>Classify the following into categories A, B, or C</instructions>
<examples>
<example>Input: X → Output: Category A</example>
<example>Input: Y → Output: Category B</example>
</examples>
<input>[content to classify]</input>
```

**Analysis Task**:
```xml
<instructions>Analyze the following using the specified framework</instructions>
<framework>
1. Factor A
2. Factor B
3. Factor C
</framework>
<thinking>Work through each factor systematically</thinking>
<data>[content to analyze]</data>
```

**Creative Task**:
```xml
<instructions>Create [specific output] with the following requirements</instructions>
<requirements>
- Requirement 1
- Requirement 2
- Requirement 3
</requirements>
<style>Desired tone/style</style>
<examples>[relevant examples]</examples>
```

---

## Compatibility

### Compatibility Considerations

**Works Across All Models**:
- Basic prompt engineering principles
- XML tag structure
- Multishot prompting
- Chain of thought reasoning

### Future-Proofing Your Prompts

1. **Use Structured Formats**: XML tags and clear sections
2. **Document Intent**: Include reasoning behind instructions
3. **Modular Design**: Break complex prompts into reusable components
4. **Version Control**: Track prompt iterations and performance
5. **Regular Testing**: Validate against updated models

---

## Conclusion

- **Start Simple**: Begin with clear, direct instructions
- **Add Structure**: Use XML tags and examples for complex tasks
- **Think Step-by-Step**: Leverage chain of thought reasoning
- **Test Thoroughly**: Validate with the "Golden Rule"
- **Iterate Continuously**: Refine based on performance
