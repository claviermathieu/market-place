# ADR-001 — Use async FastAPI over sync

**Status:** Accepted

## Context

The marketplace runs Python computation functions that take 5–10 seconds each.
We needed the API to remain responsive during computation so that:
- Multiple simultaneous jobs could run without blocking the API
- The WebSocket endpoint could stream status updates while a job was running
- The health endpoint would still respond during heavy computation

Alternatives considered:
- **Sync FastAPI with threading** — uvicorn spins up worker threads for sync routes, but thread management is error-prone and the threading model interacts poorly with asyncpg
- **Celery + Redis** — correct solution for production, but adds two infrastructure components for what is currently a single-user tool
- **Flask + threading** — same threading issues, no native async support

## Decision

Use FastAPI with full async support throughout:
- `asyncpg` as the PostgreSQL driver (not psycopg2)
- SQLAlchemy 2 async ORM (`create_async_engine`, `async_sessionmaker`)
- `BackgroundTasks` for job execution — the job runs in a background coroutine without blocking the HTTP response
- `asyncio.sleep()` inside functions to simulate non-blocking computation delays

## Consequences

**Easier:**
- The event loop is never blocked; multiple jobs can run concurrently
- WebSocket connections work cleanly alongside regular HTTP traffic
- No thread safety issues — asyncio's cooperative multitasking is simpler to reason about

**Harder:**
- Every database call must be `await`ed — forgetting this causes a `greenlet_spawn` error that is easy to introduce and hard to debug
- Cannot use any synchronous library that does I/O inside an async route without `run_in_executor`
- New contributors with sync Python backgrounds need to learn the async model

## What we learned

**The most common mistake:** mixing sync SQLAlchemy calls into async routes.

Symptoms: `sqlalchemy.exc.MissingGreenlet: greenlet_spawn has not been called`

Cause: using `session.execute()` (sync) instead of `await session.execute()` (async),
or using `.lazy` relationships that trigger implicit sync DB calls.

Fix: Always use the async versions; never use lazy-loaded relationships — always `selectinload()` or `joinedload()` in the query.

**Gotcha with BackgroundTasks:** `BackgroundTasks.add_task(coroutine)` runs the coroutine
on the event loop after the response is sent. If the event loop is blocked by a sync call
in the background task, the WebSocket poll will see stale status. Keep background tasks pure async.
