import json
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from database import engine, AsyncSessionLocal, Base
from models import User, App
from routers.apps import router as apps_router
from routers.explorer import router as explorer_router
from routers.monitor import router as monitor_router
from routers.runs import router as runs_router

FUNCTIONS_DIR = Path(__file__).parent / "functions"


async def seed_db() -> None:
    async with AsyncSessionLocal() as db:
        result = await db.execute(text("SELECT id FROM users WHERE id = 1"))
        if result.fetchone():
            return

        user = User(id=1, email="admin@mclavier.tech", role="admin")
        db.add(user)

        for folder in ("mortality", "pricer"):
            manifest_path = FUNCTIONS_DIR / folder / "manifest.json"
            if not manifest_path.exists():
                continue
            with open(manifest_path) as f:
                manifest = json.load(f)

            app = App(
                name=manifest["name"],
                description=manifest.get("description", ""),
                function_name=folder,
                repo_url=None,
                function_path=str(FUNCTIONS_DIR / folder),
                input_schema=manifest.get("inputs", {}),
            )
            db.add(app)

        await db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_db()
    yield
    await engine.dispose()


app = FastAPI(title="MCLAVIER Marketplace", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://marketplace.mclavier.com",
        os.getenv("FRONTEND_URL", ""),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(apps_router)
app.include_router(runs_router)
app.include_router(explorer_router, prefix="/explorer")
app.include_router(monitor_router, prefix="/monitor")


@app.get("/health")
async def health():
    return {"status": "ok"}
