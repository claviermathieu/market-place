from datetime import datetime
from typing import Any
from pydantic import BaseModel
from models import JobStatus


class AppSchema(BaseModel):
    id: int
    name: str
    description: str
    function_name: str
    repo_url: str | None
    function_path: str
    input_schema: dict[str, Any]

    model_config = {"from_attributes": True}


class RunRequest(BaseModel):
    inputs: dict[str, Any]


class RunResponse(BaseModel):
    run_id: int
    status: JobStatus


class RunStatusResponse(BaseModel):
    run_id: int
    status: JobStatus
    started_at: datetime
    finished_at: datetime | None
    result: dict[str, Any] | None

    model_config = {"from_attributes": True}


class RegisterAppRequest(BaseModel):
    repo_url: str


class HistoryRunResponse(BaseModel):
    run_id: int
    app_id: int
    app_name: str
    status: JobStatus
    started_at: datetime
    finished_at: datetime | None

    model_config = {"from_attributes": True}
