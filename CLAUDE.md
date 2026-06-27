# Actuarial Marketplace — Claude Instructions

## Project identity

This is a full-stack actuarial tool marketplace built by a senior actuary at Deloitte
to master end-to-end tool development with AI assistance. It is simultaneously a
working product and a learning resource — every design decision is documented in
`.claude/decisions/`.

## Tech stack

- **Frontend:** Next.js 14 (pages router), React 18, Recharts, MDX v2 via @next/mdx
- **Backend:** FastAPI (fully async), Python 3.12, Pydantic v2, uvicorn
- **Database:** PostgreSQL 16, SQLAlchemy 2 async ORM, asyncpg driver
- **Infrastructure:** Docker, docker-compose (3 services: db, backend, frontend)

## Core rules — always follow these

1. **Never modify an existing working file without being asked.** Read it first, change only what is necessary.
2. **Work on isolated files.** One concern per change. Do not refactor unrelated code in the same edit.
3. **All new FastAPI endpoints must be `async def`.** No sync functions inside async routes.
4. **All new Pydantic models use v2 syntax** — `model_config = {"from_attributes": True}`, not `class Config`.
5. **All frontend components use inline styles only.** Tailwind is installed as a devDependency but NOT used in JSX. Never add Tailwind class names to components.
6. **Dark theme constants** — background: `#0b0d10`, card: `#14171c`, accent: `#4f8cff`, muted: `#9aa0ab`, border: `#232932`.
7. **After any change to `next.config.js`**, warn that a full Docker rebuild is required (`docker compose build --no-cache frontend`).
8. **Never use sync SQLAlchemy.** Always `await db.execute(...)`, never `db.execute(...)`.

## Project structure

```
market-place/
├── backend/
│   ├── main.py              → FastAPI app, lifespan, CORS, router registration
│   ├── database.py          → SQLAlchemy async engine + session factory
│   ├── models.py            → User, App, JobRun, JobResult ORM models
│   ├── schemas.py           → Pydantic request/response models
│   ├── routers/
│   │   ├── apps.py          → GET/POST /apps, POST /apps/{id}/run
│   │   ├── runs.py          → GET /runs, GET /runs/{id}, WS /ws/runs/{id}, export endpoints
│   │   ├── explorer.py      → GET /explorer/tables, /schema, /rows, POST /explorer/query
│   │   └── monitor.py       → GET /monitor/stats, /live, /history
│   └── functions/
│       ├── mortality/        → Gompertz mortality simulator
│       └── pricer/           → GBM portfolio pricer
├── frontend/
│   ├── pages/
│   │   ├── index.js          → Marketplace homepage
│   │   ├── apps/[id].js      → App runner with JobForm + ResultPanel
│   │   ├── history.js        → Run history table
│   │   ├── monitor.js        → Real-time monitoring dashboard
│   │   ├── explorer.js       → PostgreSQL data explorer
│   │   └── docs/             → MDX documentation (see .claude/decisions/ADR-004)
│   └── components/
│       ├── Navbar.js         → Top navigation bar
│       ├── JobForm.js        → Dynamic slider form from manifest.json
│       ├── ResultPanel.js    → Chart + table + export buttons
│       ├── AppCard.js        → Marketplace app card
│       ├── AddAppModal.js    → Register new app + build log template generator
│       ├── JsonTree.js       → Collapsible JSONB tree renderer
│       └── docs/             → DocsLayout, CodeBlock, Callout, EndpointCard
└── .claude/                  → This folder — prompt templates, ADRs, context
```

## Current state

- **5 working pages:** `/`, `/apps/[id]`, `/history`, `/monitor`, `/explorer`, `/docs/*`
- **2 seeded apps:** Mortality Simulator, Portfolio Pricer (seeded in `main.py:seed_db`)
- **Full async pipeline:** `POST /apps/{id}/run` → `BackgroundTask(_execute_job)` → WebSocket polling → `SUCCESS`/`FAILED`
- **Export:** CSV and PDF export via `GET /runs/{id}/export/csv|pdf`, PNG via `html2canvas` in browser
- **App registration:** `POST /apps/register` clones a GitHub repo, validates `manifest.json` + `function.py`

## What NOT to do

- Do not add authentication — `user_id = 1` is hardcoded everywhere
- Do not use Redux or any client-side state management library
- Do not install new npm packages without stating them explicitly first
- Do not install new Python packages without adding to `requirements.txt` and noting the rebuild needed
- Do not use sync SQLAlchemy — greenlet_spawn errors are the symptom
- Do not change the database schema without updating `seed_db()` in `main.py`
- Do not add Tailwind class names — use inline styles only
- Do not use `rehype-highlight` in `next.config.js` — it is ESM-only and breaks the CJS config

## Useful commands

```bash
# Full rebuild (needed when requirements.txt or package.json change)
docker compose build --no-cache && docker compose up

# Frontend only (faster)
docker compose build frontend && docker compose up

# Backend only
docker compose build backend && docker compose up

# View logs
docker compose logs -f backend
docker compose logs -f frontend
```

## Further reading

- `.claude/context/stack.md` — complete tech stack with version numbers
- `.claude/context/conventions.md` — naming, file structure, code style rules
- `.claude/context/domain.md` — actuarial domain glossary
- `.claude/decisions/` — Architecture Decision Records for every major choice
- `.claude/prompts/` — reusable prompt templates for common tasks
