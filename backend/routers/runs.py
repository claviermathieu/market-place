import asyncio

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db, AsyncSessionLocal
from models import JobRun
from schemas import RunStatusResponse, HistoryRunResponse

router = APIRouter()


@router.get("/runs/{run_id}", response_model=RunStatusResponse)
async def get_run(run_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(JobRun)
        .where(JobRun.id == run_id)
        .options(selectinload(JobRun.result))
    )
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    return RunStatusResponse(
        run_id=run.id,
        status=run.status,
        started_at=run.started_at,
        finished_at=run.finished_at,
        result=run.result.payload if run.result else None,
    )


@router.get("/runs", response_model=list[HistoryRunResponse])
async def list_runs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(JobRun)
        .options(selectinload(JobRun.app))
        .order_by(JobRun.started_at.desc())
    )
    runs = result.scalars().all()
    return [
        HistoryRunResponse(
            run_id=r.id,
            app_id=r.app_id,
            app_name=r.app.name if r.app else "Unknown",
            status=r.status,
            started_at=r.started_at,
            finished_at=r.finished_at,
        )
        for r in runs
    ]


@router.websocket("/ws/runs/{run_id}")
async def ws_run_status(websocket: WebSocket, run_id: int):
    await websocket.accept()
    try:
        while True:
            async with AsyncSessionLocal() as db:
                result = await db.execute(
                    select(JobRun)
                    .where(JobRun.id == run_id)
                    .options(selectinload(JobRun.result))
                )
                run = result.scalar_one_or_none()

            if not run:
                await websocket.send_json({"status": "NOT_FOUND"})
                break

            payload = run.result.payload if run.result else None
            await websocket.send_json(
                {
                    "status": run.status.value,
                    "run_id": run.id,
                    "result": payload,
                }
            )

            if run.status.value in ("SUCCESS", "FAILED"):
                break

            await asyncio.sleep(3)
    except WebSocketDisconnect:
        pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass
