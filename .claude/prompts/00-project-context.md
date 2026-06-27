# Project Context — Paste at Session Start

Use this at the beginning of any Claude Code session to orient the model quickly.

---

Read `CLAUDE.md` at the project root before doing anything else.

This is the MCLAVIER Actuarial Marketplace — a full-stack app built with:
- **Frontend:** Next.js 14 (pages router), React 18, inline styles only (no Tailwind classes in JSX)
- **Backend:** FastAPI (fully async), Python 3.12, Pydantic v2
- **Database:** PostgreSQL 16, SQLAlchemy 2 async + asyncpg
- **Infra:** Docker / docker-compose

Dark theme: bg=`#0b0d10`, card=`#14171c`, accent=`#4f8cff`, border=`#232932`.

Key constraints that differ from typical projects:
- All components use **inline styles** — never Tailwind class names
- All FastAPI routes are **async def** — no sync SQLAlchemy
- Pydantic v2 — `model_config`, not `class Config`
- `next.config.js` is CJS — no ESM-only plugins (no rehype-highlight)

Current working pages: `/`, `/apps/[id]`, `/history`, `/monitor`, `/explorer`, `/docs/*`
Current API routers: apps, runs (+ export), explorer, monitor

I am a senior actuary, not a developer. Keep explanations concrete and analogies
actuarial where relevant. Skip basic programming explanations.
