import asyncio
import csv
import io
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
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


@router.get("/runs/{run_id}/export/csv")
async def export_csv(run_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(JobRun)
        .where(JobRun.id == run_id)
        .options(selectinload(JobRun.result), selectinload(JobRun.app))
    )
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    if not run.result or not run.result.payload:
        raise HTTPException(status_code=404, detail="No result data available")

    payload    = run.result.payload
    table_data = payload.get("table", [])
    columns    = payload.get("columns", list(table_data[0].keys()) if table_data else [])
    app_name   = run.app.name if run.app else "result"

    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=columns, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(table_data)

    filename = f"{app_name.lower().replace(' ', '_')}_run_{run_id}.csv"
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/runs/{run_id}/export/pdf")
async def export_pdf(run_id: int, db: AsyncSession = Depends(get_db)):
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

    result = await db.execute(
        select(JobRun)
        .where(JobRun.id == run_id)
        .options(selectinload(JobRun.result), selectinload(JobRun.app))
    )
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    if not run.result or not run.result.payload:
        raise HTTPException(status_code=404, detail="No result data available")

    payload    = run.result.payload
    table_data = payload.get("table", [])
    columns    = payload.get("columns", list(table_data[0].keys()) if table_data else [])
    summary    = payload.get("summary", {})
    app_name   = run.app.name if run.app else "Result"

    ACCENT  = colors.HexColor("#4f8cff")
    LIGHT   = colors.HexColor("#f7f8fa")
    BORDER  = colors.HexColor("#d1d5db")
    HEAD_TXT = colors.HexColor("#ffffff")
    BODY_TXT = colors.HexColor("#1f2937")
    SUB_TXT  = colors.HexColor("#6b7280")

    buf    = io.BytesIO()
    styles = getSampleStyleSheet()
    doc    = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=20 * mm, rightMargin=20 * mm,
        topMargin=18 * mm, bottomMargin=18 * mm,
    )

    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.enums import TA_RIGHT

    h1  = ParagraphStyle("h1",  parent=styles["Normal"], fontSize=18, fontName="Helvetica-Bold", textColor=BODY_TXT, spaceAfter=4)
    sub = ParagraphStyle("sub", parent=styles["Normal"], fontSize=9,  fontName="Helvetica",      textColor=SUB_TXT,  spaceAfter=2)
    h2  = ParagraphStyle("h2",  parent=styles["Normal"], fontSize=11, fontName="Helvetica-Bold", textColor=BODY_TXT, spaceBefore=8, spaceAfter=4)
    ftr = ParagraphStyle("ftr", parent=styles["Normal"], fontSize=8,  fontName="Helvetica",      textColor=SUB_TXT,  alignment=TA_RIGHT)

    def _tbl(data, col_widths=None):
        t = Table(data, colWidths=col_widths)
        t.setStyle(TableStyle([
            ("BACKGROUND",  (0, 0), (-1, 0),  ACCENT),
            ("TEXTCOLOR",   (0, 0), (-1, 0),  HEAD_TXT),
            ("FONTNAME",    (0, 0), (-1, 0),  "Helvetica-Bold"),
            ("FONTSIZE",    (0, 0), (-1, -1), 8.5),
            ("GRID",        (0, 0), (-1, -1), 0.5, BORDER),
            ("PADDING",     (0, 0), (-1, -1), 5),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
            ("TEXTCOLOR",   (0, 1), (-1, -1), BODY_TXT),
            ("VALIGN",      (0, 0), (-1, -1), "MIDDLE"),
        ]))
        return t

    story = []
    story.append(Paragraph(app_name, h1))
    story.append(Paragraph(
        f"Run #{run_id} · {run.started_at.strftime('%Y-%m-%d %H:%M UTC')} · {run.status.value}",
        sub,
    ))
    story.append(Spacer(1, 6 * mm))

    if run.inputs:
        story.append(Paragraph("Inputs", h2))
        story.append(_tbl(
            [["Parameter", "Value"]] + [[k, str(v)] for k, v in run.inputs.items()],
            col_widths=[85 * mm, 85 * mm],
        ))
        story.append(Spacer(1, 4 * mm))

    if summary:
        story.append(Paragraph("Summary", h2))
        story.append(_tbl(
            [["Metric", "Value"]] + [[k.replace("_", " ").title(), str(v)] for k, v in summary.items()],
            col_widths=[85 * mm, 85 * mm],
        ))
        story.append(Spacer(1, 4 * mm))

    if table_data:
        story.append(Paragraph("Results", h2))
        avail = 170 * mm
        cw    = [avail / max(len(columns), 1)] * len(columns)
        story.append(_tbl(
            [columns] + [[str(row.get(c, "")) for c in columns] for row in table_data],
            col_widths=cw,
        ))

    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph("Generated by MCLAVIER Actuarial Marketplace", ftr))

    doc.build(story)
    buf.seek(0)
    filename = f"{app_name.lower().replace(' ', '_')}_run_{run_id}.pdf"
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


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
