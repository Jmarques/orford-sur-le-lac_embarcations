# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root — the canonical vocabulary (glossary of comité, structures, rôles…).
- **`docs/decisions/`** — this repo's decision records (its ADRs). Read `docs/decisions/INDEX.md` first, then the records that touch the area you're about to work in. Check a record's "Revisit when" field before re-deciding anything it covers.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo:

```
/
├── CONTEXT.md
├── docs/decisions/
│   ├── INDEX.md
│   └── 000N-<slug>.md
└── site/, apps-script/, tools/…
```

New decision records go in `docs/decisions/` (not `docs/adr/`) and get a line in `INDEX.md`.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids. This mirrors the CLAUDE.md rule for UI copy: a term missing from the glossary means ask, never invent a name.

## Flag decision conflicts

If your output contradicts an existing decision record, surface it explicitly rather than silently overriding:

> _Contradicts decision 0004 (variables visuelles dans theme.css) — but worth reopening because…_
