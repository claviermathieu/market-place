import importlib.util
import json
import shutil
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import App, JobRun, JobResult, JobStatus
from schemas import AppSchema, RunRequest, RunResponse, RegisterAppRequest

router = APIRouter()

FUNCTIONS_DIR = Path(__file__).parent.parent / "functions"


def load_function(function_path: str):
    mod_path = Path(function_path) / "function.py"
    if not mod_path.exists():
        raise FileNotFoundError(f"function.py not found at {mod_path}")
    spec = importlib.util.spec_from_file_location("function", mod_path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.run


@router.get("/apps", response_model=list[AppSchema])
async def list_apps(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(App))
    return result.scalars().all()


@router.get("/apps/{app_id}", response_model=AppSchema)
async def get_app(app_id: int, db: AsyncSession = Depends(get_db)):
    app = await db.get(App, app_id)
    if not app:
        raise HTTPException(status_code=404, detail="App not found")
    return app


async def _execute_job(run_id: int, function_path: str, inputs: dict) -> None:
    from database import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        run = await db.get(JobRun, run_id)
        if not run:
            return
        run.status = JobStatus.RUNNING
        await db.commit()

    try:
        fn = load_function(function_path)
        payload = await fn(inputs)
    except Exception:
        async with AsyncSessionLocal() as db:
            from datetime import datetime
            run = await db.get(JobRun, run_id)
            if run:
                run.status = JobStatus.FAILED
                run.finished_at = datetime.utcnow()
                await db.commit()
        return

    async with AsyncSessionLocal() as db:
        from datetime import datetime
        run = await db.get(JobRun, run_id)
        if run:
            run.status = JobStatus.SUCCESS
            run.finished_at = datetime.utcnow()
            result = JobResult(run_id=run_id, payload=payload)
            db.add(result)
            await db.commit()


@router.post("/apps/{app_id}/run", response_model=RunResponse)
async def trigger_run(
    app_id: int,
    body: RunRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    app = await db.get(App, app_id)
    if not app:
        raise HTTPException(status_code=404, detail="App not found")

    run = JobRun(user_id=1, app_id=app_id, inputs=body.inputs)
    db.add(run)
    await db.commit()
    await db.refresh(run)

    background_tasks.add_task(_execute_job, run.id, app.function_path, body.inputs)

    return RunResponse(run_id=run.id, status=run.status)


@router.post("/apps/register", response_model=AppSchema)
async def register_app(body: RegisterAppRequest, db: AsyncSession = Depends(get_db)):
    import git

    repo_url = body.repo_url.strip()

    # Derive a folder name from the URL
    slug = repo_url.rstrip("/").split("/")[-1].replace(".git", "").lower()
    slug = "".join(c if c.isalnum() or c == "_" else "_" for c in slug)

    dest = FUNCTIONS_DIR / slug
    if dest.exists():
        shutil.rmtree(dest)

    try:
        git.Repo.clone_from(repo_url, str(dest))
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Failed to clone repo: {exc}")

    manifest_path = dest / "manifest.json"
    if not manifest_path.exists():
        shutil.rmtree(dest)
        raise HTTPException(
            status_code=422, detail="manifest.json not found in repo root"
        )

    function_path = dest / "function.py"
    if not function_path.exists():
        shutil.rmtree(dest)
        raise HTTPException(
            status_code=422, detail="function.py not found in repo root"
        )

    with open(manifest_path) as f:
        manifest = json.load(f)

    name = manifest.get("name", slug)
    description = manifest.get("description", "")
    inputs_schema = manifest.get("inputs", {})

    app = App(
        name=name,
        description=description,
        function_name=slug,
        repo_url=repo_url,
        function_path=str(dest),
        input_schema=inputs_schema,
    )
    db.add(app)
    await db.commit()
    await db.refresh(app)
    return app
