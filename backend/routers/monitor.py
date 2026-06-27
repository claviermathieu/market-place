from fastapi import APIRouter
from sqlalchemy import text

from database import engine

router = APIRouter()


@router.get("/stats")
async def get_stats():
    async with engine.connect() as conn:
        row = (await conn.execute(text("""
            SELECT
                COUNT(*)                                                             AS total,
                COUNT(*) FILTER (WHERE status::text = 'SUCCESS')                    AS success_count,
                AVG(EXTRACT(EPOCH FROM (finished_at - started_at)))
                    FILTER (WHERE finished_at IS NOT NULL AND status::text = 'SUCCESS') AS avg_duration,
                COUNT(*) FILTER (WHERE DATE(started_at) = CURRENT_DATE)             AS runs_today
            FROM job_runs
        """))).fetchone()

        total        = int(row[0] or 0)
        success      = int(row[1] or 0)
        avg_duration = round(float(row[2]), 1) if row[2] else 0.0
        runs_today   = int(row[3] or 0)
        success_rate = round(success / total * 100, 1) if total > 0 else 0.0

        per_app_rows = (await conn.execute(text("""
            SELECT
                a.name,
                COUNT(*)                                                               AS total,
                COUNT(*) FILTER (WHERE jr.status::text = 'SUCCESS')                  AS success_count,
                AVG(EXTRACT(EPOCH FROM (jr.finished_at - jr.started_at)))
                    FILTER (WHERE jr.finished_at IS NOT NULL)                        AS avg_duration,
                MAX(jr.started_at)                                                    AS last_run
            FROM job_runs jr
            JOIN apps a ON jr.app_id = a.id
            GROUP BY a.id, a.name
            ORDER BY total DESC
        """))).fetchall()

    per_app = []
    for r in per_app_rows:
        t = int(r[1] or 0)
        s = int(r[2] or 0)
        per_app.append({
            "app_name":    r[0],
            "total":       t,
            "success_rate": round(s / t * 100, 1) if t > 0 else 0.0,
            "avg_duration": round(float(r[3]), 1) if r[3] else 0.0,
            "last_run":    r[4].isoformat() if r[4] else None,
        })

    return {
        "total_runs":           total,
        "success_rate":         success_rate,
        "avg_duration_seconds": avg_duration,
        "runs_today":           runs_today,
        "per_app":              per_app,
    }


@router.get("/live")
async def get_live():
    async with engine.connect() as conn:
        rows = (await conn.execute(text("""
            SELECT jr.id, jr.started_at, a.name, jr.status::text
            FROM job_runs jr
            JOIN apps a ON jr.app_id = a.id
            WHERE jr.status::text IN ('PENDING', 'RUNNING')
            ORDER BY jr.started_at ASC
        """))).fetchall()

    return {
        "live": [
            {
                "run_id":     r[0],
                "started_at": r[1].isoformat(),
                "app_name":   r[2],
                "status":     r[3],
            }
            for r in rows
        ]
    }


@router.get("/history")
async def get_history():
    async with engine.connect() as conn:
        rows = (await conn.execute(text("""
            SELECT DATE(started_at) AS day, COUNT(*) AS count
            FROM job_runs
            WHERE started_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY DATE(started_at)
            ORDER BY day ASC
        """))).fetchall()

    return {"history": [{"day": str(r[0]), "count": int(r[1])} for r in rows]}
