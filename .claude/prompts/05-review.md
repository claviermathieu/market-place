# Template — Code Review Request

## Context

Read `CLAUDE.md` and `.claude/context/conventions.md` before reviewing.

I have written the following code and want an independent review before merging.

## Files to review

- `[file path]` — [what this file does]
- `[file path]` — [what this file does]

Or: review the diff on the current branch against main:
```bash
git diff main..HEAD
```

## What I'm most concerned about

[Pick the areas where you're least confident:]
- [ ] Security — SQL injection, XSS, input validation
- [ ] Correctness — does the actuarial calculation match the methodology?
- [ ] Edge cases — what inputs would break it?
- [ ] Performance — anything that would block the event loop or cause N+1 queries?
- [ ] API contract — does the response shape match what the frontend expects?
- [ ] Error handling — does it fail gracefully or silently?

## What I'm NOT asking about

- Code style (this project has no linter beyond ruff for Python)
- Test coverage (tests are not currently required for new features)
- Documentation (covered by build logs in `/docs/build-log/`)

## Review format I want

For each issue found:
1. **File and line number**
2. **What the problem is**
3. **Why it matters** (not just "bad practice" — what actually breaks?)
4. **The fix** (exact code, not a description)

Rate each issue: Critical (fix before merge) / Minor (fix later) / Nitpick (optional).

## Self-check I've already done

- [ ] Tested with minimum and maximum slider values
- [ ] Tested with zero inputs where division might occur
- [ ] Verified the API response shape against what ResultPanel expects
- [ ] Checked Docker logs after rebuilding
