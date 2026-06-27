# Code Conventions

This document describes the explicit conventions used in this codebase.
These are not aspirational — they reflect what the code actually does.

## Naming

### Backend

- Router files: `routers/{noun}.py` — always plural, lowercase (`apps.py`, `runs.py`, `explorer.py`)
- Router variable: `router = APIRouter()` — always named `router`
- Import alias in `main.py`: `from routers.{name} import router as {name}_router`
- Table names: plural snake_case (`job_runs`, `job_results`, `apps`)
- Model classes: singular PascalCase (`App`, `JobRun`, `JobResult`)
- Schema classes: suffix with `In` or `Out` when ambiguous (`AppCreateIn`, `AppOut`)
- Async helper functions that are not endpoints: prefix with `_` if module-private

### Frontend

- Page files: `pages/{name}.js` — lowercase, no suffix except for dynamic routes (`[id].js`)
- Component files: `components/{Name}.js` — PascalCase
- Component functions: match the file name exactly (`export default function ResultPanel()`)
- State variables: camelCase noun (`const [jobStatus, setJobStatus] = useState(null)`)
- Boolean state: prefix with `is` or `show` (`const [isLoading, setIsLoading]`)

## Styling (frontend)

All components use **inline styles only**. This is intentional — see `CLAUDE.md`.

```js
// Correct
<div style={{ background: "#14171c", borderRadius: 12, padding: "16px 20px" }}>

// Wrong — never do this
<div className="bg-gray-900 rounded-xl p-5">
```

### Dark theme constants

```js
const THEME = {
  bg: "#0b0d10",         // page background
  card: "#14171c",       // card/panel background
  cardAlt: "#1a1e24",    // secondary card, table header
  accent: "#4f8cff",     // primary blue, links, active state
  accentDim: "#243555",  // accent background / hover state
  success: "#34d399",    // green for success states
  warning: "#f59e0b",    // amber for pending/warning
  error: "#f87171",      // red for errors/failures
  text: "#f1f3f6",       // primary text
  textMuted: "#9aa0ab",  // secondary text
  textDim: "#6b727e",    // tertiary text / labels
  textFaint: "#454c57",  // very faint text / column headers
  border: "#232932",     // default border
  borderAlt: "#1c2128",  // table row separator
};
```

## API design

- All routes use `async def`
- Response format: always a JSON object (dict), never a bare array
  ```python
  # Correct
  return {"apps": apps_list, "count": len(apps_list)}
  # Wrong
  return apps_list
  ```
- HTTP status codes: 200 (success), 404 (not found), 422 (validation error, automatic from Pydantic)
- Error responses: `{"detail": "human readable message"}` — matches FastAPI's default

## Database queries

Use SQLAlchemy text() for raw SQL with explicit parameterization:
```python
from sqlalchemy import text

async with engine.connect() as conn:
    result = await conn.execute(
        text("SELECT * FROM apps WHERE id = :id"),
        {"id": app_id}
    )
    row = result.fetchone()
```

Use SQLAlchemy ORM for CRUD operations with relationships:
```python
async with async_session() as db:
    run = await db.get(JobRun, run_id, options=[selectinload(JobRun.result)])
```

Never mix them in the same transaction.

## Frontend data fetching

All data fetching uses the native `fetch` API — no axios, no react-query, no SWR.

```js
const [data, setData] = useState(null);
const [error, setError] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch(`${API}/endpoint`)
    .then(r => r.json())
    .then(setData)
    .catch(e => setError(e.message))
    .finally(() => setLoading(false));
}, []);
```

## File encoding

- No TypeScript — all `.js` files
- No JSX file extension — `.js` files contain JSX (configured in `next.config.js`)
- No `.jsx` extension anywhere
- Python files: UTF-8, no BOM

## Imports order (Python)

```python
# 1. Standard library
import asyncio
import csv
import io
from datetime import datetime

# 2. Third-party
from fastapi import APIRouter, HTTPException
from sqlalchemy import text

# 3. Local
from database import engine
from models import JobRun
```

## Git conventions

- Branches: `feature/description`, `fix/description`
- Commits: imperative mood, present tense ("add export endpoint", not "added export endpoint")
- No commit should contain changes to both backend and frontend (one concern per commit)
