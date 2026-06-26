# MCLAVIER Marketplace

A full-stack actuarial model marketplace built with Next.js, FastAPI, PostgreSQL, and Python functions that simulate Databricks workflows.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser :3000                         │
│                    Next.js (React + Tailwind)                 │
│   /           /apps/[id]           /history                  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP + WebSocket
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI :8000                               │
│                                                              │
│  GET  /apps              POST /apps/{id}/run                 │
│  GET  /apps/{id}         POST /apps/register                 │
│  GET  /runs/{id}         WS   /ws/runs/{id}                  │
│  GET  /runs                                                   │
│                                                              │
│  BackgroundTasks ──► Python function (asyncio)               │
│                       functions/mortality/function.py         │
│                       functions/pricer/function.py            │
└──────────────────────┬──────────────────────────────────────┘
                       │ asyncpg (SQLAlchemy async)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL :5432                             │
│                                                              │
│  users       apps        job_runs      job_results           │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
docker-compose up
```

- Frontend: http://localhost:3000
- API docs: http://localhost:8000/docs

## API Examples

### List all apps
```bash
curl http://localhost:8000/apps
```

### Get app detail + input schema
```bash
curl http://localhost:8000/apps/1
```

### Trigger a run
```bash
curl -X POST http://localhost:8000/apps/1/run \
  -H "Content-Type: application/json" \
  -d '{"inputs": {"age": 45, "shock_rate": 10}}'
# → {"run_id": 1, "status": "PENDING"}
```

### Poll run status
```bash
curl http://localhost:8000/runs/1
```

### Register a new app from GitHub
```bash
curl -X POST http://localhost:8000/apps/register \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/your-org/my-model"}'
```

### WebSocket status stream
```js
const ws = new WebSocket("ws://localhost:8000/ws/runs/1");
ws.onmessage = (e) => console.log(JSON.parse(e.data));
// → {"status": "RUNNING", "run_id": 1, "result": null}
// → {"status": "SUCCESS", "run_id": 1, "result": {...}}
```

## Adding a New App in 5 Minutes

Every app is a GitHub repo with exactly two files:

### `manifest.json`
```json
{
  "name": "My Model",
  "description": "Short description shown in the marketplace.",
  "inputs": {
    "param_one": {
      "type": "number",
      "label": "Parameter One",
      "min": 0,
      "max": 100,
      "step": 1,
      "default": 50,
      "unit": "%"
    }
  }
}
```

### `function.py`
```python
import asyncio
import numpy as np

async def run(inputs: dict) -> dict:
    # Simulate computation time
    await asyncio.sleep(5)

    value = inputs.get("param_one", 50)
    # ... your computation ...

    return {
        "columns": ["X", "Y"],
        "table": [{"x": 1, "y": value}],
        "series": [{"x": 1, "y": value}],
        "summary": {"result": value}
    }
```

Then register it:
```bash
curl -X POST http://localhost:8000/apps/register \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/your-org/my-model"}'
```

The app immediately appears in the marketplace.

## Project Structure

```
marketplace/
├── .github/workflows/    # CI (lint + test) and CD (docker build verify)
├── docker-compose.yml
├── backend/
│   ├── main.py           # FastAPI app, lifespan, CORS, seed
│   ├── models.py         # SQLAlchemy ORM models
│   ├── schemas.py        # Pydantic v2 request/response schemas
│   ├── database.py       # Async engine + session factory
│   ├── routers/
│   │   ├── apps.py       # GET/POST /apps, POST /apps/register
│   │   └── runs.py       # GET /runs, WS /ws/runs/{id}
│   ├── functions/
│   │   ├── mortality/    # Mortality Simulator (manifest + function)
│   │   └── pricer/       # Portfolio Pricer (manifest + function)
│   └── tests/
└── frontend/
    ├── pages/
    │   ├── index.js      # Marketplace grid + Add App
    │   ├── apps/[id].js  # Form + results panel + WebSocket
    │   └── history.js    # All past runs table
    └── components/
        ├── Navbar.js
        ├── AppCard.js
        ├── JobForm.js    # Range sliders from input_schema
        ├── ResultPanel.js # Chart (recharts) + table
        └── AddAppModal.js
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS, Recharts |
| Backend | FastAPI, Python 3.12, asyncio, BackgroundTasks |
| ORM | SQLAlchemy 2.0 async + asyncpg |
| Database | PostgreSQL 16 |
| Functions | Pure Python async (`run(inputs) -> dict`) |
| Infra | Docker + docker-compose |
| CI | GitHub Actions (ruff, eslint, pytest) |
