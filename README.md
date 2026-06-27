# MCLAVIER Marketplace

A full-stack actuarial model marketplace built with Next.js, FastAPI, PostgreSQL, and Python functions that simulate Databricks workflows.

## La révolution de l'IA et la nécessité de devenir un actuaire Full-Stack

`Vers l’autonomie technologique et la fin des intermédiaires`

### Problématique historique : Le cloisonnement Métier / IT


La première révolution numérique a automatisé les systèmes complexes au prix d'une hyper-spécialisation. Les organisations ont massivement recruté des développeurs déconnectés des enjeux métiers, tandis que l'actuaire se retrouvait relégué en bout de chaîne. Face à la rigidité et à la complexité des infrastructures IT, l'actuaire est resté cantonné à Excel. Certes, l'outil est flexible ; mais il est structurellement limité pour la mise en production et les calculs plus avancés (comme des modèles ALM).

Le paradigme traditionnel reposait sur un dialogue entre un expert métier dictant des besoins fonctionnels à un développeur possédant la maîtrise technique, mais sans vision macro de l'activité.

### Le nouveau paradigme : L'IA comme pont technologique

L'émergence de l'IA générative redéfinit fondamentalement cette dynamique. L'interlocuteur de l'actuaire n'est plus le développeur informatique, mais directement l'infrastructure IT. En supprimant cet intermédiaire, l'IA permet à l'actuaire de s'approprier l'ensemble de la tech stack (stack = ensemble des composantes tech à maitriser pour déployer un outil).

Ce projet vise à démontrer qu'un actuaire peut désormais concevoir, tester et déployer ses propres modèles actuariels et automatisations de processus en totale autonomie, de l'algorithme à l'interface utilisateur, sans dépendance technique externe.

### Objectifs Stratégiques

Pour l'actuaire en quête de montée en compétences, ce projet s'articule autour de trois piliers d'efficience :

* Produire plus : Élargir le périmètre d'action en gérant des projets de bout en bout (full-stack).

* Produire vite : Réduire drastiquement le time-to-market en éliminant les cycles de spécification et de recette inter-équipes.

* Produire mieux : Garantir la fidélité des modèles en supprimant les biais de traduction entre le besoin actuariel et le code final.

### Vision Prospective : La polarisation du marché du travail

L'intuition macroéconomique sous-jacente à ce projet repose sur une thèse de polarisation accrue du marché du travail. L'avènement de l'IA va accentuer la scission entre deux profils de main-d'œuvre :

* Les profils à haute valeur ajoutée : Des professionnels augmentés, hautement productifs, capables de maîtriser l'architecture complète de leurs projets.

* Les profils à utilité marginale : Une force de travail cantonnée à des tâches exécutives, subissant de plein fouet l'obsolescence de leurs compétences.


### Application pour le monde du conseil

Bien évidemment, lorsque l'on parle de suppression des intermédiaires, nous pensons à la réduction du besoin de conseil. Mettons ce sujet de premier temps de côté car ils concernent des considérations stratégiques qui n'est pas l'objet de ce projet ni de mon rôle au sein du cabinet. Cependant, une touche d'optimisme serait de dire que les cabinets de conseil ne vendent pas des livrables mais la disposition de profils 




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

## Environnements

Deux backends disponibles. Seul le fichier d'environnement et la commande `docker compose` changent — aucune modification de code.

### Mode local — PostgreSQL Docker (3 containers)

Démarre un container PostgreSQL 16 en local. Données persistées dans un volume Docker (`pg_data`). Recommandé pour le développement sans connexion internet.

**Première utilisation :**
```bash
cp .env.example .env.local
# Édite .env.local : mets DATABASE_URL=postgresql+asyncpg://marketplace:marketplace@db:5432/marketplace
```

**Lancement :**
```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up
```

### Mode production — Supabase (2 containers)

Utilise l'instance Supabase hébergée. Aucun container base de données n'est démarré.

**Première utilisation :**
```bash
cp .env.example .env.production
# Édite .env.production : renseigne ENV_FILE, DATABASE_URL (pooler Supabase)
```

**Lancement :**
```bash
docker compose --env-file .env.production up
```

| | Local | Production (Supabase) |
|---|---|---|
| Containers | db + backend + frontend | backend + frontend |
| Données | Volume Docker `pg_data` | Supabase cloud |
| Connexion | `@db:5432` (réseau Docker) | pooler `aws-0-eu-west-3.pooler.supabase.com` |
| SSL | Non | Oui (automatique via `database.py`) |

> **Railway :** les variables `DATABASE_URL`, `NEXT_PUBLIC_API_URL` et `NEXT_PUBLIC_WS_URL`
> sont injectées directement depuis le dashboard Railway — pas de fichier `.env` nécessaire.

## Quick Start

```bash
# Local (PostgreSQL Docker)
docker compose -f docker-compose.yml -f docker-compose.local.yml up

# Production (Supabase)
docker compose --env-file .env.production up
```

- Frontend : http://localhost:3000
- API docs : http://localhost:8000/docs

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
