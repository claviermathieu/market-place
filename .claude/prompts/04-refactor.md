# Template — Safe Refactor

## Context

Read `CLAUDE.md` before starting.
Read ALL files that will be touched before writing any code:
- [FILE 1]
- [FILE 2]

## What to refactor

[Describe what is structurally wrong and why it needs to change. Be specific.]

Example: "The `ResultPanel.js` component has the API URL hardcoded as a string literal
on line 47. It should use `process.env.NEXT_PUBLIC_API_URL` like all other components."

## Exact scope

Files to change:
- `[file path]` — [what changes and why]

Files NOT to change (explicitly):
- [file that might look related but must not be touched]

## Behavior must not change

The refactor is correct when:
1. [observable behavior that must still work after]
2. [another observable behavior]

Run this to verify:
```bash
[curl command or UI action that proves nothing broke]
```

## Constraints

- Do NOT add new features during a refactor
- Do NOT change function signatures or API response shapes
- Do NOT rename exported functions or components — this breaks imports
- If you find additional code that should be refactored, document it as a TODO comment but do NOT fix it now
- Make the smallest possible change that achieves the goal

## Why surgical refactors matter

Each line changed is a potential regression. In this codebase, the frontend
and backend are coupled at the API contract level. Renaming a JSON key in
the backend breaks the frontend silently — no TypeScript to catch it.
Minimize surface area.
