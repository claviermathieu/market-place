# Template — Debug a Specific Issue

## Context

Read `CLAUDE.md` before starting.
Read the following files before proposing any fix:
- [FILE WHERE THE BUG IS OBSERVED]
- [FILE WHERE THE ROOT CAUSE LIKELY IS]

## Problem description

**Symptom:** [What the user sees — be specific. Include exact error message if available.]

**Where it occurs:** [URL, API endpoint, or component name]

**When it occurs:** [Always? Only with specific inputs? After a specific action?]

**What I expected:** [The correct behavior]

## Environment

- Branch: [BRANCH_NAME]
- Last working state: [e.g. "Was working before I added the export endpoint"]
- Error message (exact):
```
[paste exact error from browser console, Docker logs, or terminal]
```

## What I've already tried

- [attempt 1]
- [attempt 2]

## Constraints

- Fix ONLY the identified bug. Do not refactor unrelated code.
- If the fix requires modifying more than 3 lines, explain why before proceeding.
- If the root cause is in a different file than the symptom, identify both.

## How to get Docker logs

```bash
docker compose logs -f backend   # Python errors, FastAPI tracebacks
docker compose logs -f frontend  # Next.js build errors, runtime errors
```

## Common causes in this codebase

- **`greenlet_spawn` error** → sync SQLAlchemy call inside async route — use `await`
- **`Cannot find module`** → new npm package in package.json but `npm install` not re-run in Docker — rebuild
- **MDX parse error "Could not parse expression with acorn"** → bare `{...}` in MDX text outside code block — wrap in backticks or replace with `(...)` 
- **WebSocket closes immediately** → CORS origin mismatch or backend not running — check `allow_origins` in `main.py`
- **Empty result from JSONB column** → asyncpg returns `None` for empty JSONB — add `or {}` default
- **`rehype-highlight` unified error** → ESM-only plugin in CJS config — remove it (see ADR-004)
