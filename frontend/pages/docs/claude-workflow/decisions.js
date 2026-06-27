import { useState } from 'react'
import Link from 'next/link'
import DocsLayout from '../../../components/docs/DocsLayout'
import Callout from '../../../components/docs/Callout'
import CodeBlock from '../../../components/docs/CodeBlock'

const F = '\`\`\`'

const ADRS = [
  {
    id: 'ADR-001',
    title: 'Use async FastAPI over sync',
    status: 'Accepted',
    context: `The marketplace runs Python computation functions that take 5–10 seconds each.
We needed the API to remain responsive during computation so that:
- Multiple simultaneous jobs could run without blocking the API
- The WebSocket endpoint could stream status updates while a job ran
- The health endpoint would still respond during heavy computation

Alternatives considered:
- Sync FastAPI with threading — thread management is error-prone and interacts poorly with asyncpg
- Celery + Redis — correct for production, but adds two infrastructure components for a single-user tool
- Flask + threading — same threading issues, no native async support`,
    decision: `Use FastAPI with full async support throughout:
- asyncpg as the PostgreSQL driver (not psycopg2)
- SQLAlchemy 2 async ORM (create_async_engine, async_sessionmaker)
- BackgroundTasks for job execution — the job runs in a background coroutine without blocking the HTTP response
- asyncio.sleep() inside functions to simulate non-blocking computation delays`,
    easier: [
      'The event loop is never blocked; multiple jobs can run concurrently',
      'WebSocket connections work cleanly alongside regular HTTP traffic',
      'No thread safety issues — asyncio\'s cooperative multitasking is simpler to reason about',
    ],
    harder: [
      'Every database call must be awaited — forgetting this causes a greenlet_spawn error that is easy to introduce and hard to debug',
      'Cannot use any synchronous library that does I/O inside an async route without run_in_executor',
      'New contributors with sync Python backgrounds need to learn the async model',
    ],
    learned: `The most common mistake: mixing sync SQLAlchemy calls into async routes.

Symptom: sqlalchemy.exc.MissingGreenlet: greenlet_spawn has not been called

Cause: using session.execute() (sync) instead of await session.execute() (async),
or using .lazy relationships that trigger implicit sync DB calls.

Fix: Always use the async versions; never use lazy-loaded relationships — always
selectinload() or joinedload() in the query.

Gotcha with BackgroundTasks: BackgroundTasks.add_task(coroutine) runs the coroutine
on the event loop after the response is sent. If the event loop is blocked by a sync
call in the background task, the WebSocket poll will see stale status.`,
  },
  {
    id: 'ADR-002',
    title: 'Store inputs and results as JSONB',
    status: 'Accepted',
    context: `Each marketplace app has a different set of inputs. The Mortality Simulator takes age
and shock_rate; the Portfolio Pricer takes n_assets and volatility. Future apps will have
entirely different schemas.

We needed a database design that could store arbitrary input/output shapes without
requiring a schema migration for every new app.

Alternatives considered:
- Typed columns per app — creates separate tables per app, impossible to join
- EAV (Entity-Attribute-Value) — avoids schema migrations but makes queries painful and loses types
- JSONB in PostgreSQL — stores arbitrary JSON with full indexing support`,
    decision: `Use JSONB for:
- apps.input_schema — the manifest's input field definitions
- job_runs.inputs — the actual values submitted for a run
- job_results.payload — the complete result ({columns, table, series, summary})`,
    easier: [
      'Adding a new app type requires zero database migrations',
      'The full result payload is stored atomically',
      'asyncpg automatically deserializes JSONB → Python dict on read',
    ],
    harder: [
      'Can\'t efficiently query "all runs where age > 50" without a GIN index and JSONB operators',
      'No type enforcement at the database level — the function contract is the only schema',
      'Payload size is unbounded; a function returning 10,000 rows would store all of them',
    ],
    learned: `asyncpg and JSONB: When SQLAlchemy reads a JSONB column via asyncpg, it returns
a Python dict directly — not a string. No json.loads() needed.

Empty JSONB vs NULL: Always check run.result is not None before accessing
run.result.payload — the JobResult row might not exist yet if the job is still running.

The manifest contract: The input_schema JSONB is the only source of truth for what inputs
an app accepts. Frontend generates sliders from it. Backend validates against it. No code
needed to keep them in sync.`,
  },
  {
    id: 'ADR-003',
    title: 'Use WebSocket for job status updates',
    status: 'Accepted',
    context: `Jobs take 5–15 seconds to complete. The UI needs to show a loading state during execution
and display results when done. We needed a mechanism for the frontend to learn when a job completes.

Alternatives considered:
- HTTP polling — simple, but wastes network requests (10 requests for a 20-second job)
- Server-Sent Events (SSE) — simpler than WebSocket, but inconsistent browser support over HTTP/2
- WebSocket — bidirectional, persistent, well-supported everywhere
- Long polling — risk of timeout on slow jobs; complex retry logic needed`,
    decision: `Use WebSocket at GET /ws/runs/{run_id}.

The implementation uses server-side polling — the WebSocket handler polls the database
every 3 seconds using asyncio.sleep(3), then pushes the current status to the client
("push via polling"):

  Client connects → server queries DB → sends status → sleeps 3s → repeats
  When status = SUCCESS, server sends full result and closes the WebSocket`,
    easier: [
      'The frontend has a simple ws.onmessage handler — no retry logic, no polling loop',
      'Status updates are immediate once the DB is written (within 3 seconds)',
      'No CORS issues — WebSocket origin is validated separately from HTTP CORS',
    ],
    harder: [
      'The 3-second sleep is a fixed latency: a job completing in 6.1s shows SUCCESS at ~9s',
      'WebSocket connections must be cleaned up on WebSocketDisconnect — not doing this causes leaks',
      'The ws:// URL must be configured separately from the http:// API URL',
    ],
    learned: `CORS for WebSocket: The FastAPI CORS middleware does NOT cover WebSocket connections.
The browser checks the Origin header on the WS upgrade request independently.

Cleanup is mandatory — without a finally block, a client disconnect leaves
the coroutine running indefinitely:

try:
    while True:
        await asyncio.sleep(3)
        # query + send status
except WebSocketDisconnect:
    pass
finally:
    try:
        await websocket.close()
    except Exception:
        pass`,
    learnedCode: true,
  },
  {
    id: 'ADR-004',
    title: 'Use MDX within Next.js over Docusaurus',
    status: 'Accepted',
    context: `The project needed documentation — architecture, API reference, build logs, and an AI guide.
We needed a documentation system that:
- Is accessible at /docs within the same app (not a separate site)
- Supports rich content: code blocks, callouts, interactive components
- Doesn't require a separate deployment or a second frontend container

Alternatives considered:
- Docusaurus — excellent framework, but runs as a separate Node.js app on a different port
- Plain Markdown in Next.js — no component support; can't embed Callout or EndpointCard inline
- Notion / GitBook — external services, different auth models, can't be self-hosted alongside the app
- MDX via @next/mdx — pages integrate directly into the Next.js pages router`,
    decision: `Use @next/mdx with the Next.js pages router.

Each MDX file in frontend/pages/docs/ becomes a route at /docs/[filename].
Custom components (DocsLayout, Callout, CodeBlock, EndpointCard) are imported
in each MDX file using the layout export pattern.`,
    easier: [
      'Docs are in the same Git repo as the code — they change together',
      'No additional Docker service or port mapping needed',
      'Custom React components work inline in MDX content',
    ],
    harder: [
      'MDX v2 parses JSX in prose text — bare {...} outside code blocks causes build failures',
      'Cannot use ESM-only rehype plugins (like rehype-highlight) in CJS next.config.js',
      'Sub-directory MDX pages need fragile ../../../ import paths to reach components',
    ],
    learned: `The rehype-highlight problem: the first attempt used rehypePlugins: [require('rehype-highlight')]
in next.config.js. This caused a unified error: "Expected usable value but received an empty preset."
Root cause: rehype-highlight v7 is ESM-only; require() returns an empty object.
Fix: remove it entirely. Code block styling is handled via a <style> tag in DocsLayout's <Head>.

The peer dependency problem: @next/mdx requires @mdx-js/loader as an explicit peer dependency
that npm does not install automatically. This caused: "Cannot find module '@mdx-js/loader'".`,
  },
  {
    id: 'ADR-005',
    title: 'Use importlib for app function dispatch',
    status: 'Accepted',
    context: `Apps in the marketplace are registered by cloning a GitHub repository. Each repo contains
a function.py file at an arbitrary path on disk. When a job runs, we need to import and
execute function.py without knowing its path at startup time.

Alternatives considered:
- Add function directory to sys.path — causes name collisions when two apps both have function.py
- exec() the file content — dangerous (no module scope, globals leak), security concern
- Package as installable Python package — too much friction for new app authors
- importlib.util.spec_from_file_location — load a module from arbitrary path with unique module name`,
    decision: `Use importlib to load function.py at runtime:

spec = importlib.util.spec_from_file_location("app_name", "/path/to/function.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
run_fn = module.run
result = await run_fn(inputs)`,
    easier: [
      'Any valid Python file at any disk path can be loaded and executed',
      'No sys.path pollution — each function loads into its own module namespace',
      'No infrastructure changes needed to add a new app — clone, register, run',
    ],
    harder: [
      'function.py must expose exactly async def run(inputs: dict) -> dict',
      'Errors in function.py surface as ImportError at runtime, not startup',
      'Hot-reload not supported — file changes require a backend restart',
    ],
    learned: `Module naming: Using the same module name "user_function" for every loaded function means
Python's module cache (sys.modules) may return a cached version. Use the app name as the
module name to ensure each app's module is cached under a unique key.

Security: This approach executes arbitrary Python code from cloned repositories.
In a single-user local tool this is acceptable. In a multi-user production deployment,
each function must run in an isolated process or container.

The registration validation checks:
1. manifest.json exists and parses as valid JSON
2. function.py exists and can be imported
3. The imported module exposes async def run
These checks fail early with a clear error before any DB write.`,
  },
]

function StatusBadge({ status }) {
  const colors = {
    Accepted: { bg: 'rgba(52,211,153,.1)', border: 'rgba(52,211,153,.25)', color: '#34d399', icon: '✓' },
    Rejected: { bg: 'rgba(248,113,113,.1)', border: 'rgba(248,113,113,.25)', color: '#f87171', icon: '✗' },
    Superseded: { bg: 'rgba(245,158,11,.1)', border: 'rgba(245,158,11,.25)', color: '#f59e0b', icon: '→' },
  }
  const c = colors[status] || colors.Accepted
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 11px', borderRadius: 999,
      fontSize: 11.5, fontWeight: 700,
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      letterSpacing: '0.04em',
    }}>
      {c.icon} {status}
    </span>
  )
}

function AdrSection({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: '#454c57', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

export default function DecisionsPage() {
  const [open, setOpen] = useState(null)

  return (
    <DocsLayout title="Architecture Decisions">
      <h1>Architecture Decisions</h1>

      <p>
        Architecture Decision Records (ADRs) document significant technical choices — what was
        decided, what alternatives were rejected, and what the real-world consequences turned out
        to be. Each record includes a "What we learned" section with the gotchas we actually hit.
      </p>

      {/* Table of contents */}
      <div style={{ background: '#14171c', border: '1px solid #232932', borderRadius: 12, padding: '16px 20px', margin: '24px 0 36px' }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: '#454c57', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          Contents
        </div>
        {ADRS.map(adr => (
          <a
            key={adr.id}
            href={`#${adr.id.toLowerCase()}`}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', textDecoration: 'none' }}
          >
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#3a4150', fontFamily: "'JetBrains Mono', monospace", minWidth: 60 }}>{adr.id}</span>
            <span style={{ fontSize: 13.5, color: '#8a909c' }}>{adr.title}</span>
          </a>
        ))}
      </div>

      {ADRS.map((adr, i) => (
        <div key={adr.id} id={adr.id.toLowerCase()} style={{ marginBottom: 52 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#3a4150', fontFamily: "'JetBrains Mono', monospace", paddingTop: 2 }}>
              {adr.id}
            </span>
            <h2 style={{ margin: 0, padding: 0, border: 'none', flex: '1 1 200px' }}>{adr.title}</h2>
            <StatusBadge status={adr.status} />
          </div>

          <AdrSection label="Context">
            <p style={{ margin: 0, whiteSpace: 'pre-line', fontSize: 14, color: '#8a909c', lineHeight: 1.75 }}>
              {adr.context}
            </p>
          </AdrSection>

          <AdrSection label="Decision">
            <p style={{ margin: 0, whiteSpace: 'pre-line', fontSize: 14, color: '#9aa0ab', lineHeight: 1.75 }}>
              {adr.decision}
            </p>
          </AdrSection>

          <AdrSection label="Consequences">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ background: 'rgba(52,211,153,.05)', border: '1px solid rgba(52,211,153,.15)', borderRadius: 9, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#34d399', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Easier</div>
                <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
                  {adr.easier.map((e, j) => (
                    <li key={j} style={{ fontSize: 13, color: '#8a909c', lineHeight: 1.65, marginBottom: 5 }}>{e}</li>
                  ))}
                </ul>
              </div>
              <div style={{ background: 'rgba(248,113,113,.05)', border: '1px solid rgba(248,113,113,.15)', borderRadius: 9, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#f87171', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Harder</div>
                <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
                  {adr.harder.map((h, j) => (
                    <li key={j} style={{ fontSize: 13, color: '#8a909c', lineHeight: 1.65, marginBottom: 5 }}>{h}</li>
                  ))}
                </ul>
              </div>
            </div>
          </AdrSection>

          <Callout type="tip">
            <strong>What we learned</strong>
            <div style={{ marginTop: 8, whiteSpace: 'pre-line', fontFamily: adr.learnedCode ? "'JetBrains Mono', monospace" : 'inherit', fontSize: adr.learnedCode ? 12.5 : 14 }}>
              {adr.learned}
            </div>
          </Callout>

          {i < ADRS.length - 1 && (
            <hr style={{ border: 'none', borderTop: '1px solid #1b2027', margin: '44px 0 0' }} />
          )}
        </div>
      ))}
    </DocsLayout>
  )
}
