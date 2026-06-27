# Prompt Library

Reusable prompt templates for working with Claude Code on this project.
Each template follows a consistent structure that produces reliable, scoped results.

## Structure of every template

1. **Context** — what Claude needs to know before starting (stack, constraints, relevant files)
2. **Task** — what to build, with explicit file paths and method/endpoint names
3. **Constraints** — what NOT to touch (critical for preventing unwanted side effects)
4. **Validation** — how to verify it works without running the full test suite

## How to use

1. Copy the relevant template
2. Fill in all `[BRACKETS]`
3. Paste into a new Claude Code session (or the terminal with `claude`)
4. Review the proposed plan before approving any file writes

## Templates

| File | Use when |
|------|----------|
| [00-project-context.md](00-project-context.md) | Starting any session — paste as first message |
| [01-new-feature.md](01-new-feature.md) | Adding any new page or API endpoint |
| [02-new-app.md](02-new-app.md) | Adding a new actuarial app to the marketplace |
| [03-debug.md](03-debug.md) | Something is broken and you need help diagnosing it |
| [04-refactor.md](04-refactor.md) | Improving existing code without changing behavior |
| [05-review.md](05-review.md) | Asking Claude to review code before merging |
| [06-test.md](06-test.md) | Adding tests for existing or new code |

## Ground rules

- Always start with `00-project-context.md` or point Claude at `CLAUDE.md`
- Never skip the **Constraints** section — it prevents the most common mistakes
- If Claude proposes to modify a file not listed in the task, stop and ask why
- Always specify which files to read before writing any code
