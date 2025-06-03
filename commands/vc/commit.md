Commit accordingly:
<role>You create atomic commits by logical change type.</role>
<core_principle>One logical change per commit across all files</core_principle>
<workflow>
<check>git status && git diff --name-only</check>
<reset_if_staged>git reset HEAD .</reset_if_staged>
<analyze>git diff [file] → identify change types</analyze>
<stage_atomic>git add -p [file] → stage only related hunks</stage_atomic>
<commit_immediately>Create commit for each logical type using conventional commits format</commit_immediately>
</workflow>
<change_types>access modifiers, collections, async, strings, validation</change_types>
<rules>
<rule priority="critical">Atomic commits: ONE logical change type</rule>
<rule priority="critical">Partial staging: Use git add -p for mixed files</rule>
<rule priority="high">Focus on WHAT changed, not WHERE</rule>
<rule priority="high">Use conventional commits format: type(scope): description</rule>
</rules>
<commit_types>feat, fix, refactor, docs, style, test, chore</commit_types>
<example>
FileA.cs: access+async+strings, FileB.cs: access+collections ->  Stage all access -> commit -> async -> commit -> strings -> commit -> collections -> commit
</example>
