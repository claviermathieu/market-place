import DocsLayout from '../../../components/docs/DocsLayout'
import CodeBlock from '../../../components/docs/CodeBlock'
import Callout from '../../../components/docs/Callout'

// Backtick fence helper — template literals can't contain unescaped backticks
const F = '\`\`\`'

const T00 = `Read \`CLAUDE.md\` at the project root before doing anything else.

This is the MCLAVIER Actuarial Marketplace — a full-stack app built with:
- **Frontend:** Next.js 14 (pages router), React 18, inline styles only (no Tailwind classes in JSX)
- **Backend:** FastAPI (fully async), Python 3.12, Pydantic v2
- **Database:** PostgreSQL 16, SQLAlchemy 2 async + asyncpg
- **Infra:** Docker / docker-compose

Dark theme: bg=\`#0b0d10\`, card=\`#14171c\`, accent=\`#4f8cff\`, border=\`#232932\`.

Key constraints that differ from typical projects:
- All components use **inline styles** — never Tailwind class names
- All FastAPI routes are **async def** — no sync SQLAlchemy
- Pydantic v2 — \`model_config\`, not \`class Config\`
- \`next.config.js\` is CJS — no ESM-only plugins (no rehype-highlight)

Current working pages: /, /apps/[id], /history, /monitor, /explorer, /docs/*
Current API routers: apps, runs (+ export), explorer, monitor

I am a senior actuary, not a developer. Keep explanations concrete and analogies
actuarial where relevant. Skip basic programming explanations.`

const T01 = `# Template — New Feature

## Context

Read \`CLAUDE.md\` and \`.claude/context/conventions.md\` before starting.
Read the following existing files before writing any code:
- \`backend/main.py\` (to see current router registrations)
- \`frontend/components/Navbar.js\` (to see current nav items)
- [LIST ANY OTHER RELEVANT FILES]

Current branch: [BRANCH_NAME]

## Task

Add **[FEATURE NAME]**.

### Backend changes

New router: \`backend/routers/[name].py\`

Endpoints:
- \`[METHOD] /[prefix]/[path]\` — [description]
- \`[METHOD] /[prefix]/[path]\` — [description]

Register in \`backend/main.py\`:
${F}python
from routers.[name] import router as [name]_router
app.include_router([name]_router, prefix="/[prefix]")
${F}

### Frontend changes

New page: \`frontend/pages/[path].js\`
New components (if needed): \`frontend/components/[Name].js\`

Navbar update — add "[Label]" between "[Before]" and "[After]":
${F}js
<NavItem label="[Label]" active={is[Name]} onClick={() => router.push("/[path]")} />
${F}

### Database changes

[describe schema change, or write "None — no schema changes needed"]

## Constraints

- Do NOT modify any existing file except: \`backend/main.py\` (router registration only),
  \`frontend/components/Navbar.js\` (nav item only)
- Do NOT install new packages without listing them here first: [packages needed, or "none"]
- All new backend code must use \`async def\` and \`await\`
- All new frontend components must use inline styles — no Tailwind class names
- Match the dark theme: bg=\`#14171c\`, border=\`#232932\`, accent=\`#4f8cff\`, text=\`#9aa0ab\`

## Validation

The feature works when:
1. \`curl -s http://localhost:8000/[path]\` returns [expected JSON shape]
2. Navigating to \`http://localhost:3000/[path]\` renders [expected UI state]
3. [any other specific check]

## After implementation

Rebuild with: \`docker compose build && docker compose up -d\``

const T02 = `# Template — New Marketplace App

## Context

Read \`CLAUDE.md\` and \`.claude/context/domain.md\` before starting.

I want to add a new actuarial computation app to the marketplace.
This means creating two files only: manifest.json and function.py.
No backend router changes needed — the existing POST /apps/register handles registration.

## App specification

- **Name:** [APP NAME]
- **Description:** [one sentence — appears in the marketplace card]
- **Actuarial methodology:** [e.g. "Solvency II standard formula, SCR market risk submodule"]
- **Regulatory context:** [e.g. "Solvency II Directive, Article 104"]

## Input schema (manifest.json)

${F}json
{
  "name": "[APP NAME]",
  "description": "[one sentence]",
  "inputs": {
    "[input_key]": {
      "type": "number",
      "label": "[Human-readable label]",
      "min": 0,
      "max": 100,
      "step": 1,
      "default": 50,
      "unit": "%"
    }
  }
}
${F}

Constraints:
- Use "type": "number" — it is the only supported type
- unit is appended to the displayed value (use " yrs" with leading space for year units)
- Choose default as the most realistic base-case value for an actuary

## Expected output format (function.py return value)

${F}python
{
    "columns": ["Col1", "Col2"],   # optional, controls table column order
    "table": [{"col1": ..., "col2": ...}],  # required — data table
    "series": [{"x": 0, "y": 100.0}],       # required — line chart
    "summary": {"key_metric": "value"},      # optional — KPI cards
}
${F}

## Methodology

[Describe the exact formula or algorithm. Be precise:]

- Formula: [e.g. "qx = min(0.99, A * exp(B * x)) where A=0.00009, B=0.091"]
- Computation steps: [numbered list]
- Benchmark: [e.g. "For age=65, shock=0: survival at 85 should be ~32% per CMI 2022"]
- Edge cases: [e.g. "age=100 produces single-row table; shock=0 returns base case"]

## Implementation requirements

${F}python
import asyncio
import numpy as np

async def run(inputs: dict) -> dict:
    # 1. Simulate realistic computation time (5-10 seconds)
    await asyncio.sleep(5 + np.random.uniform(0, 3))

    # 2. Parse inputs — always use .get(key, default) for resilience
    val = float(inputs.get("[input_key]", [default]))

    # 3. Validate bounds
    val = max([min], min([max], val))

    # 4. Compute using numpy — no Python loops if vectorized equivalent exists

    # 5. Return the structured result
    return {...}
${F}

## File locations

Create:
- \`backend/functions/[name]/manifest.json\`
- \`backend/functions/[name]/function.py\`

## Constraints

- Do NOT modify any existing backend file
- Do NOT import any library not already in requirements.txt
- Function must be \`async def run(inputs: dict) -> dict\` — exact signature
- asyncio.sleep is mandatory — without it, the UI shows no loading state`

const T03 = `# Template — Debug a Specific Issue

## Context

Read \`CLAUDE.md\` before starting.
Read the following files before proposing any fix:
- [FILE WHERE THE BUG IS OBSERVED]
- [FILE WHERE THE ROOT CAUSE LIKELY IS]

## Problem description

**Symptom:** [What the user sees — be specific. Include exact error message.]

**Where it occurs:** [URL, API endpoint, or component name]

**When it occurs:** [Always? Only with specific inputs? After a specific action?]

**What I expected:** [The correct behavior]

## Environment

- Branch: [BRANCH_NAME]
- Last working state: [e.g. "Was working before I added the export endpoint"]
- Error message (exact):
${F}
[paste exact error from browser console, Docker logs, or terminal]
${F}

## What I've already tried

- [attempt 1]
- [attempt 2]

## Constraints

- Fix ONLY the identified bug. Do not refactor unrelated code.
- If the fix requires modifying more than 3 lines, explain why before proceeding.
- If the root cause is in a different file than the symptom, identify both.

## How to get Docker logs

${F}bash
docker compose logs -f backend   # Python errors, FastAPI tracebacks
docker compose logs -f frontend  # Next.js build errors, runtime errors
${F}

## Common causes in this codebase

- **greenlet_spawn error** → sync SQLAlchemy in async route — use \`await\`
- **Cannot find module** → new npm package not installed — rebuild Docker
- **MDX parse error "Could not parse expression with acorn"** →
    bare {...} in MDX text outside code block — wrap in backticks or use (...)
- **WebSocket closes immediately** → CORS mismatch or backend not running
- **Empty result from JSONB column** → asyncpg returns None — add \`or {}\` default
- **rehype-highlight unified error** → ESM-only plugin in CJS next.config.js — remove it`

const T04 = `# Template — Safe Refactor

## Context

Read \`CLAUDE.md\` before starting.
Read ALL files that will be touched before writing any code:
- [FILE 1]
- [FILE 2]

## What to refactor

[Describe what is structurally wrong and why it needs to change. Be specific.]

Example: "ResultPanel.js has the API URL hardcoded as a string literal on line 47.
It should use \`process.env.NEXT_PUBLIC_API_URL\` like all other components."

## Exact scope

Files to change:
- \`[file path]\` — [what changes and why]

Files NOT to change:
- [file that might look related but must not be touched]

## Behavior must not change

The refactor is correct when:
1. [observable behavior that must still work after]
2. [another observable behavior]

Run this to verify:
${F}bash
[curl command or UI action that proves nothing broke]
${F}

## Constraints

- Do NOT add new features during a refactor
- Do NOT change function signatures or API response shapes
- Do NOT rename exported functions or components — this breaks imports
- If you find additional refactor opportunities, document as TODO but do NOT fix now
- Make the smallest possible change that achieves the goal

## Why surgical refactors matter

Each line changed is a potential regression. The frontend and backend are coupled
at the API contract level. Renaming a JSON key in the backend breaks the frontend
silently — no TypeScript to catch it. Minimize surface area.`

const T05 = `# Template — Code Review Request

## Context

Read \`CLAUDE.md\` and \`.claude/context/conventions.md\` before reviewing.

I have written the following code and want an independent review before merging.

## Files to review

- \`[file path]\` — [what this file does]
- \`[file path]\` — [what this file does]

Or: review the diff against main:
${F}bash
git diff main..HEAD
${F}

## What I'm most concerned about

- [ ] Security — SQL injection, XSS, input validation
- [ ] Correctness — does the actuarial calculation match the methodology?
- [ ] Edge cases — what inputs would break it?
- [ ] Performance — anything that would block the event loop or cause N+1 queries?
- [ ] API contract — does the response shape match what the frontend expects?
- [ ] Error handling — does it fail gracefully or silently?

## What I'm NOT asking about

- Code style (no linter beyond ruff for Python)
- Test coverage (not required for new features)
- Documentation (covered by build logs in /docs/build-log/)

## Review format I want

For each issue found:
1. **File and line number**
2. **What the problem is**
3. **Why it matters** (not just "bad practice" — what actually breaks?)
4. **The fix** (exact code, not a description)

Rate each issue: Critical (fix before merge) / Minor (fix later) / Nitpick.

## Self-check I've already done

- [ ] Tested with minimum and maximum slider values
- [ ] Tested with zero inputs where division might occur
- [ ] Verified the API response shape against what ResultPanel expects
- [ ] Checked Docker logs after rebuilding`

const T06 = `# Template — Add Tests

## Context

Read \`CLAUDE.md\` before starting.
Read the file(s) to be tested before writing any test code:
- [file to test]

Existing tests (if any) are in \`backend/tests/\`. Run them with:
${F}bash
docker compose exec backend pytest
${F}

## What to test

Module: \`[backend/routers/name.py]\` or \`[backend/functions/name/function.py]\`

### Test cases required

| Test | Input | Expected output |
|------|-------|-----------------|
| Happy path | [inputs] | [expected response/return] |
| Edge case — minimum | [inputs] | [expected] |
| Edge case — maximum | [inputs] | [expected] |
| Error case | [invalid input] | [expected error code/message] |

## Test setup

${F}python
import pytest
import pytest_asyncio
from httpx import AsyncClient
from main import app

@pytest_asyncio.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c
${F}

## Constraints

- Do NOT use mocks for the database — tests run against the actual Docker DB
- If a test requires specific DB state, create it in a pytest fixture and clean up after
- Test file goes in \`backend/tests/test_[name].py\`
- Test function names: \`test_[endpoint_or_function]_[scenario]\`
- Each test must be independent — no shared state between tests

## For function.py tests (actuarial computation)

${F}python
import pytest
import numpy as np

@pytest.mark.asyncio
async def test_mortality_simulator_base_case():
    from functions.mortality.function import run
    result = await run({"age": 45, "shock_rate": 0})

    # Structural checks
    assert "table" in result
    assert "series" in result
    assert "summary" in result

    # Domain correctness: life expectancy at 45 with no shock ≈ 27-32 years
    le = result["summary"]["life_expectancy"]
    assert 25 <= le <= 35, f"Life expectancy {le} outside expected range"

    # All survival values between 0 and 100%
    for point in result["series"]:
        assert 0 <= point["y"] <= 100
${F}`

const TEMPLATES = [
  {
    id: '00',
    title: 'Project Context',
    useCase: 'Paste at the start of any Claude Code session to orient the model without having to re-explain the stack.',
    when: 'Every session — before you ask Claude to do anything. It sets the constraints (inline styles, async-only, Pydantic v2) that prevent the most common mistakes.',
    content: T00,
  },
  {
    id: '01',
    title: 'New Feature',
    useCase: 'Adding any full-stack feature that requires both a new FastAPI router and a new Next.js page.',
    when: 'Use when you need backend + frontend changes. The template forces you to list every file to read and every file that must NOT be touched — this is the critical section.',
    content: T01,
  },
  {
    id: '02',
    title: 'New Marketplace App',
    useCase: 'Creating a new actuarial computation tool — manifest.json + function.py — without touching any existing backend files.',
    when: 'Use when adding an app to the marketplace. Forces you to specify the exact actuarial methodology and output format before Claude writes a single line of code.',
    content: T02,
  },
  {
    id: '03',
    title: 'Debug a Specific Issue',
    useCase: 'Something is broken. Use when you have a specific error message or reproducible failure.',
    when: 'Use as soon as you have a symptom — don\'t start debugging without filling in the "what I\'ve already tried" section. It prevents Claude from suggesting things you\'ve already eliminated.',
    content: T03,
  },
  {
    id: '04',
    title: 'Safe Refactor',
    useCase: 'Improving code structure without changing behavior. Use when you know what needs to change but want Claude to stay strictly in scope.',
    when: 'Use when you notice structural problems (hardcoded values, missing error handling, duplicated logic) during another task. Do NOT refactor in the same session as a feature — context contamination leads to scope creep.',
    content: T04,
  },
  {
    id: '05',
    title: 'Code Review Request',
    useCase: 'Independent review of code you\'ve already written, before merging to main.',
    when: 'Use before any merge to main. Most useful when you\'re not confident about correctness of the actuarial calculation, or when the change touches multiple files.',
    content: T05,
  },
  {
    id: '06',
    title: 'Add Tests',
    useCase: 'Writing pytest tests for new or existing backend code.',
    when: 'Use after a feature is working to lock in its behavior. The domain-correctness assertions in the template (checking life expectancy ranges) are more valuable than structural checks.',
    content: T06,
  },
]

export default function PromptLibraryPage() {
  return (
    <DocsLayout title="Prompt Library">
      <h1>Prompt Library</h1>

      <p>
        Reusable prompt templates for working with Claude Code on this project.
        Each template follows a consistent structure that produces reliable, scoped results.
      </p>

      <h2 style={{ borderTop: 'none', paddingTop: 0, marginTop: 0 }}>Structure of every template</h2>

      <ol>
        <li><strong>Context</strong> — what Claude needs to know before starting: stack, constraints, files to read</li>
        <li><strong>Task</strong> — what to build, with explicit file paths and endpoint names</li>
        <li><strong>Constraints</strong> — what NOT to touch (critical for preventing unwanted side effects)</li>
        <li><strong>Validation</strong> — how to verify it works without running a full test suite</li>
      </ol>

      <Callout type="info">
        Copy the relevant template, fill in all <code>[BRACKETS]</code>, and paste into a new Claude Code session.
        Review the proposed plan before approving any file writes.
      </Callout>

      <hr />

      {TEMPLATES.map((t, i) => (
        <div key={t.id}>
          <h2 style={{ marginTop: i === 0 ? 0 : undefined }}>
            <span style={{ fontSize: '0.65em', fontWeight: 700, color: '#3a4150', marginRight: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em', verticalAlign: 'middle' }}>
              {t.id}
            </span>
            {t.title}
          </h2>

          <p style={{ margin: '0 0 12px', color: '#8a909c', fontSize: 14 }}>{t.useCase}</p>

          <Callout type="tip">
            <strong>When to use this:</strong> {t.when}
          </Callout>

          <CodeBlock language="markdown">{t.content}</CodeBlock>
        </div>
      ))}
    </DocsLayout>
  )
}
