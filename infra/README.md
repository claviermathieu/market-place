# Infrastructure

## Railway Deployment

Railway deploys each service as an independent container — not via docker-compose.
Each service is configured separately in the Railway dashboard and pointed at its Dockerfile.

### Services

| Service | Dockerfile | Config |
|---------|-----------|--------|
| backend | `backend/Dockerfile` | `railway/backend.json` |
| frontend | `frontend/Dockerfile` | `railway/frontend.json` |

### Required environment variables

Set these in the Railway dashboard under each service → Variables.

#### Backend

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase Session Pooler connection string: `postgresql+asyncpg://postgres.<PROJECT>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres` |

#### Frontend

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Public URL of the deployed backend service, e.g. `https://backend-<hash>.railway.app` |
| `NEXT_PUBLIC_WS_URL` | Same host with `wss://` scheme, e.g. `wss://backend-<hash>.railway.app` |

### Deployment steps

1. Create a new Railway project.
2. Add a service from GitHub repo — select the **backend** root with `backend/Dockerfile`.
3. Add a second service — select the same repo with `frontend/Dockerfile`.
4. Set the environment variables above on each service.
5. Railway auto-deploys on every push to the connected branch.

### Notes

- The `Procfile` at project root is a Railway fallback for single-service detection; the per-service Dockerfiles take precedence.
- `NEXT_PUBLIC_*` variables are baked into the Next.js build. If the backend URL changes, the frontend must be rebuilt.
- The backend connects to Supabase with `ssl.CERT_NONE` (encrypted but CA not verified) — standard for Supabase session pooler from hosted environments.

---

## Local vs Production

| Step | Local | Production |
|------|-------|------------|
| 1 | `cp .env.example .env.local` | Set vars in Railway dashboard |
| 2 | Fill in real values in `.env.local` | — |
| 3 | `docker compose up` | Push to `main` → auto-deploy |

**Important:** `NEXT_PUBLIC_*` variables are baked into the Next.js build at build time, not runtime. Railway must trigger a full frontend rebuild after any change to these variables.

---

## Local development

See [../README.md](../README.md) — Database Environments section.
