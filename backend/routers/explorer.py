import re
from datetime import datetime, date
from decimal import Decimal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import text

from database import engine

router = APIRouter()

_SAFE_IDENTIFIER = re.compile(r'^[a-zA-Z_][a-zA-Z0-9_]*$')
_FORBIDDEN = re.compile(
    r'\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|GRANT|REVOKE|COPY|EXECUTE|CALL|VACUUM|ANALYZE)\b',
    re.IGNORECASE,
)


def _validate_identifier(name: str) -> None:
    if not _SAFE_IDENTIFIER.match(name):
        raise HTTPException(status_code=400, detail=f"Invalid identifier: {name}")


def _validate_select(sql: str) -> None:
    stripped = sql.strip()
    if not stripped.upper().startswith('SELECT') and not stripped.upper().startswith('WITH'):
        raise HTTPException(status_code=400, detail="Only SELECT statements are allowed")
    if _FORBIDDEN.search(stripped):
        raise HTTPException(status_code=400, detail="Query contains forbidden keywords")


def _serialize(v):
    if v is None:
        return None
    if isinstance(v, (datetime, date)):
        return v.isoformat()
    if isinstance(v, Decimal):
        return float(v)
    if isinstance(v, (dict, list, str, int, float, bool)):
        return v
    return str(v)


def _serialize_row(row) -> dict:
    return {k: _serialize(v) for k, v in dict(row).items()}


@router.get("/tables")
async def list_tables():
    async with engine.connect() as conn:
        result = await conn.execute(text("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """))
        tables = [row[0] for row in result.fetchall()]
    return {"tables": tables}


@router.get("/tables/{table}/schema")
async def get_schema(table: str):
    _validate_identifier(table)
    async with engine.connect() as conn:
        result = await conn.execute(text("""
            SELECT
                c.column_name,
                c.data_type,
                c.is_nullable,
                EXISTS (
                    SELECT 1
                    FROM information_schema.key_column_usage kcu
                    JOIN information_schema.table_constraints tc
                        ON kcu.constraint_name = tc.constraint_name
                        AND kcu.table_schema = tc.table_schema
                    WHERE kcu.table_schema = 'public'
                      AND kcu.table_name = :table
                      AND kcu.column_name = c.column_name
                      AND tc.constraint_type = 'PRIMARY KEY'
                ) AS is_primary_key
            FROM information_schema.columns c
            WHERE c.table_schema = 'public'
              AND c.table_name = :table
            ORDER BY c.ordinal_position
        """), {"table": table})
        rows = result.fetchall()

    if not rows:
        raise HTTPException(status_code=404, detail=f"Table '{table}' not found")

    columns = [
        {
            "name": r[0],
            "type": r[1],
            "nullable": r[2] == "YES",
            "primary_key": bool(r[3]),
        }
        for r in rows
    ]
    return {"table": table, "columns": columns}


@router.get("/tables/{table}/rows")
async def get_rows(table: str, limit: int = 50, offset: int = 0):
    _validate_identifier(table)
    limit = min(max(1, limit), 500)
    offset = max(0, offset)

    async with engine.connect() as conn:
        count_result = await conn.execute(
            text(f'SELECT COUNT(*) FROM "{table}"')
        )
        total = count_result.scalar() or 0

        result = await conn.execute(
            text(f'SELECT * FROM "{table}" LIMIT :lim OFFSET :off'),
            {"lim": limit, "off": offset},
        )
        col_names = list(result.keys())
        rows = [_serialize_row(r) for r in result.mappings().all()]

    return {
        "table": table,
        "total": total,
        "page": offset // limit + 1,
        "per_page": limit,
        "columns": col_names,
        "rows": rows,
    }


class QueryRequest(BaseModel):
    sql: str


@router.post("/query")
async def execute_query(req: QueryRequest):
    _validate_select(req.sql)
    sql_clean = req.sql.strip().rstrip(';')
    wrapped = f"SELECT * FROM (\n{sql_clean}\n) AS _q LIMIT 500"

    async with engine.connect() as conn:
        try:
            result = await conn.execute(text(wrapped))
            col_names = list(result.keys())
            rows = [_serialize_row(r) for r in result.mappings().all()]
        except Exception as e:
            msg = str(e).split('\n')[0]
            raise HTTPException(status_code=400, detail=msg)

    return {
        "columns": col_names,
        "rows": rows,
        "count": len(rows),
    }
