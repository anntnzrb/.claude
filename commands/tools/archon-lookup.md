## Search Priority Guidelines

### HIGH PRIORITY (use first for knowledge base lookup)
- `get_available_sources` - Get available knowledge base sources
- `perform_rag_query` - Primary RAG search for stored content
- `search_code_examples` - Search for relevant code examples

### LOW PRIORITY (fallback only)
- Other search tools - Use only when RAG search is insufficient

**Intent**: Prioritize knowledge base RAG search over external searches for comprehensive, contextual results.

## Progressive Search Strategy

### 1. **Initial Broad Search**
- Start with conceptual terms and general descriptions
- Use natural language descriptions of what you're looking for

### 2. **If Initial Search Fails - Use Specific Terminology**
- **Quote exact terms**: Put specific names, phrases, and keywords in quotes
- **Include domain-specific terminology**: Use field-specific jargon and precise vocabulary
- **Add contextual details**: Include how something works, its purpose, or characteristics

### 3. **Source/Context-Targeted Search**
- Include likely source names, authors, or publications
- Search for specific frameworks, systems, or methodologies
- Use qualified names or specific identifiers

### 4. **Multi-Query Approach**
- Query 1: General concept + domain/field
- Query 2: Specific terminology + contextual details
- Query 3: Source/system name + specific element if needed

**Key Insight**: Be more **specific and precise** rather than **conceptual and broad** when initial searches fail.

Using Archon's knowledge base, look up for: $ARGUMENTS
