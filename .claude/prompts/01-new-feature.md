# Template — New Feature

## Context

Read `CLAUDE.md` and `.claude/context/conventions.md` before starting.
Read the following existing files before writing any code:
- `backend/main.py` (to see current router registrations)
- `frontend/components/Navbar.js` (to see current nav items)
- [LIST ANY OTHER RELEVANT FILES]

Current branch: [BRANCH_NAME]

## Task

Add **[FEATURE NAME]**.

### Backend changes

New router: `backend/routers/[name].py`

Endpoints:
- `[METHOD] /[prefix]/[path]` — [description]
- `[METHOD] /[prefix]/[path]` — [description]

Register in `backend/main.py`:
```python
from routers.[name] import router as [name]_router
app.include_router([name]_router, prefix="/[prefix]")
```

### Frontend changes

New page: `frontend/pages/[path].js`
New components (if needed): `frontend/components/[Name].js`

Navbar update — add `"[Label]"` between `"[Before]"` and `"[After]"`:
```js
<NavItem label="[Label]" active={is[Name]} onClick={() => router.push("/[path]")} />
```

### Database changes

[describe schema change, or write "None — no schema changes needed"]

## Constraints

- Do NOT modify any existing file except: `backend/main.py` (router registration only), `frontend/components/Navbar.js` (nav item only)
- Do NOT install new packages without listing them here first: [packages needed, or "none"]
- All new backend code must use `async def` and `await`
- All new frontend components must use inline styles — no Tailwind class names
- Match the dark theme: bg=`#14171c`, border=`#232932`, accent=`#4f8cff`, text=`#9aa0ab`

## Validation

The feature works when:
1. `curl -s http://localhost:8000/[path]` returns `[expected JSON shape]`
2. Navigating to `http://localhost:3000/[path]` renders `[expected UI state]`
3. [any other specific check]

## After implementation

Rebuild with: `docker compose build && docker compose up -d`
