# ADR-002 — Store inputs and results as JSONB

**Status:** Accepted

## Context

Each marketplace app has a different set of inputs. The Mortality Simulator takes
`age` and `shock_rate`; the Portfolio Pricer takes `n_assets` and `volatility`.
Future apps will have entirely different schemas.

We needed a database design that could store arbitrary input/output shapes without
requiring a schema migration for every new app.

Alternatives considered:
- **Typed columns per app** — create `mortality_runs` with `age` and `shock_rate` columns, `pricer_runs` with `n_assets` and `volatility` columns. Clean, queryable, impossible to join.
- **EAV (Entity-Attribute-Value)** — a `run_inputs` table with `(run_id, key, value)` rows. Avoids schema migrations but makes queries painful and loses types.
- **JSONB in PostgreSQL** — stores arbitrary JSON with full indexing support and GIN index capability.

## Decision

Use JSONB for:
- `apps.input_schema` — the manifest's input field definitions
- `job_runs.inputs` — the actual values submitted for a run
- `job_results.payload` — the complete result (`{columns, table, series, summary}`)

## Consequences

**Easier:**
- Adding a new app type requires zero database migrations
- The full result payload (including the table and chart data) is stored atomically
- asyncpg automatically deserializes JSONB → Python dict on read

**Harder:**
- Can't efficiently query "all runs where age > 50" without a GIN index and JSONB operators
- No type enforcement at the database level — the function contract is the only schema
- Payload size is unbounded; a function that returns 10,000 rows would store all of them

**The size tradeoff is acceptable because:**
- Functions are capped to ~25 time periods in the current implementations
- Results are display-only, not used for further computation
- The explorer `/explorer/query` endpoint allows ad-hoc JSONB queries when needed

## What we learned

**asyncpg and JSONB:** When SQLAlchemy reads a JSONB column via asyncpg, it returns
a Python dict directly — not a string. No `json.loads()` needed.

**Empty JSONB vs NULL:** SQLAlchemy's `JSONB(default=dict)` stores `{}` for a new row,
not `NULL`. When reading result payloads, always check `run.result is not None` before
accessing `run.result.payload` — the `JobResult` row itself might not exist yet.

**The manifest contract:** The `input_schema` JSONB is the only source of truth for
what inputs an app accepts. The frontend generates sliders from it dynamically. The
backend validates against it before dispatching. Keeping these in sync requires no code —
they both read from the same JSONB blob.
