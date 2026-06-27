# ADR-003 — Use WebSocket for job status updates

**Status:** Accepted

## Context

Jobs take 5–15 seconds to complete. The UI needs to show a loading state during
execution and then display results when done. We needed a mechanism for the frontend
to learn when a job completes.

Alternatives considered:
- **Client-side HTTP polling** — frontend calls `GET /runs/{id}` every 2 seconds. Simple, but wastes network requests; 10 requests for a 20-second job.
- **Server-Sent Events (SSE)** — one-directional stream from server to client. Simpler than WebSocket; no handshake. But SSE has inconsistent browser support over HTTP/2, and FastAPI's SSE support requires careful response flushing.
- **WebSocket** — bidirectional, persistent connection. Overkill for one-directional status updates, but well-supported everywhere and straightforward in FastAPI.
- **Long polling** — server holds the connection open until the job completes. Risk of timeout on slow jobs; complex retry logic needed.

## Decision

Use WebSocket at `GET /ws/runs/{run_id}`.

The implementation uses server-side polling — the WebSocket handler itself polls the
database every 3 seconds using `asyncio.sleep(3)`, then pushes the current status to
the client. This is sometimes called "push via polling":

```
Client                          Server
  |-------- WS connect -------->|
  |                             |  db.query(run) → PENDING
  |<------- {PENDING} ----------|
  |                             |  asyncio.sleep(3)
  |                             |  db.query(run) → RUNNING
  |<------- {RUNNING} ----------|
  |                             |  asyncio.sleep(3)
  |                             |  db.query(run) → SUCCESS
  |<------- {SUCCESS, result} --|
  |<------- WS close -----------|
```

## Consequences

**Easier:**
- The frontend has a simple `ws.onmessage` handler — no retry logic, no polling loop
- Status updates are immediate once the DB is written (within 3 seconds)
- No CORS issues — WebSocket uses `ws://` origin separately from HTTP

**Harder:**
- The 3-second server-side sleep is a fixed latency: a job that completes in 6.1 seconds shows SUCCESS at ~9 seconds (next poll cycle). Acceptable for 5–15 second jobs.
- WebSocket connections must be cleaned up on `WebSocketDisconnect` — not doing this causes connection leaks
- The `ws://` URL must be configured separately from the `http://` API URL (see `NEXT_PUBLIC_WS_URL` env var)

## What we learned

**CORS for WebSocket:** The FastAPI CORS middleware does not cover WebSocket connections.
The browser checks the `Origin` header on the WS upgrade request, but this is validated
by the WebSocket server, not CORS. Since we allow all origins (no auth), this is not an issue.
If auth is added later, WebSocket origin validation needs its own implementation.

**Cleanup is mandatory:**

```python
try:
    while True:
        ...
        await asyncio.sleep(3)
except WebSocketDisconnect:
    pass
finally:
    try:
        await websocket.close()
    except Exception:
        pass
```

Without the `finally` block, a client disconnect leaves the coroutine running indefinitely,
polling the DB and holding the connection open.
