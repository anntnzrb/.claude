## Search Priority Guidelines

### HIGH PRIORITY (use first for knowledge base lookup)
- `get_available_sources` - Get available knowledge base sources
- `perform_rag_query` - Primary RAG search for stored content
- `search_code_examples` - Search for relevant code examples

### LOW PRIORITY (fallback only)
- Other search tools - Use only when RAG search is insufficient

**Intent**: Prioritize knowledge base RAG search over external searches for comprehensive, contextual results.

Using Archon's knowledge base, look up for: $ARGUMENTS
