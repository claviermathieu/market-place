# Tech Stack Reference

Complete list of technologies and versions used in this project.

## Backend

| Technology | Version | Role |
|-----------|---------|------|
| Python | 3.12 | Runtime |
| FastAPI | 0.111.x | HTTP + WebSocket framework |
| uvicorn | 0.29.x | ASGI server |
| SQLAlchemy | 2.x (async) | ORM + query builder |
| asyncpg | 0.29.x | PostgreSQL async driver |
| Pydantic | v2 | Request/response validation |
| reportlab | 4.2.0 | PDF generation |
| numpy | 1.26.x | Numerical computation |
| alembic | — | Not used; schema managed via `metadata.create_all()` in `main.py` |

## Frontend

| Technology | Version | Role |
|-----------|---------|------|
| Next.js | 14 (pages router) | React framework + SSR |
| React | 18 | UI library |
| Recharts | 2.x | Chart library (AreaChart, LineChart, BarChart) |
| html2canvas | 1.4.x | DOM-to-PNG screenshot for chart export |
| @next/mdx | 14.x | MDX integration for documentation pages |
| @mdx-js/loader | 3.x | Required peer dep of @next/mdx |
| remark-gfm | 4.x | GitHub-flavored markdown in MDX |

## Infrastructure

| Technology | Version | Role |
|-----------|---------|------|
| Docker | 25.x | Containerization |
| docker-compose | 2.x | Multi-container orchestration |
| PostgreSQL | 16 | Primary database |

## How the services are networked

```
                    ┌──────────────────────────────────────┐
                    │           docker-compose              │
                    │                                       │
  User Browser      │  ┌─────────┐    ┌──────────────────┐ │
  :3000 ──────────► │  │ frontend│    │     backend       │ │
  :8000 ──────────► │  │ Next.js │◄──►│    FastAPI        │ │
                    │  │ :3000   │    │    :8000          │ │
                    │  └─────────┘    └────────┬─────────┘ │
                    │                          │            │
                    │                  ┌───────▼───────┐    │
                    │                  │      db       │    │
                    │                  │  PostgreSQL   │    │
                    │                  │    :5432      │    │
                    │                  └───────────────┘    │
                    └──────────────────────────────────────┘
```

- Frontend calls backend at `NEXT_PUBLIC_API_URL` (default: `http://localhost:8000`)
- Frontend connects WebSocket at `NEXT_PUBLIC_WS_URL` (default: `ws://localhost:8000`)
- Backend connects to PostgreSQL at `DATABASE_URL` (set via docker-compose env)
- Services communicate over the internal Docker network by service name

## Environment variables

### Backend (.env or docker-compose)

| Variable | Default | Description |
|---------|---------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://...` | Full asyncpg connection string |
| `BACKEND_CORS_ORIGINS` | `["http://localhost:3000"]` | CORS allowed origins |

### Frontend (.env.local or docker-compose)

| Variable | Default | Description |
|---------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend HTTP base URL |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:8000` | Backend WebSocket base URL |

## Key constraints from version choices

- **SQLAlchemy 2 async** requires `create_async_engine` + `async_sessionmaker` — not the 1.x session pattern
- **Pydantic v2** uses `model_config = {"from_attributes": True}` — not `class Config: orm_mode = True`
- **Next.js 14 pages router** — `getServerSideProps` / `getStaticProps` not App Router layouts
- **MDX v2** via @next/mdx — bare `{...}` in prose is JSX; wrap in backticks or use `(...)`
- **@mdx-js/loader 3.x** is ESM — cannot use ESM-only rehype plugins in CJS `next.config.js`
