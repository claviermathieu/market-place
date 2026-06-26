from datetime import datetime
from sqlalchemy import Integer, String, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base
import enum


class JobStatus(str, enum.Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    role: Mapped[str] = mapped_column(String, default="user")

    runs: Mapped[list["JobRun"]] = relationship("JobRun", back_populates="user")


class App(Base):
    __tablename__ = "apps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, default="")
    function_name: Mapped[str] = mapped_column(String, nullable=False)
    repo_url: Mapped[str | None] = mapped_column(String, nullable=True)
    function_path: Mapped[str] = mapped_column(String, nullable=False)
    input_schema: Mapped[dict] = mapped_column(JSONB, default=dict)

    runs: Mapped[list["JobRun"]] = relationship("JobRun", back_populates="app")


class JobRun(Base):
    __tablename__ = "job_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    app_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("apps.id"), nullable=False
    )
    status: Mapped[JobStatus] = mapped_column(
        SAEnum(JobStatus), default=JobStatus.PENDING
    )
    inputs: Mapped[dict] = mapped_column(JSONB, default=dict)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="runs")
    app: Mapped["App"] = relationship("App", back_populates="runs")
    result: Mapped["JobResult | None"] = relationship(
        "JobResult", back_populates="run", uselist=False
    )


class JobResult(Base):
    __tablename__ = "job_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    run_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("job_runs.id"), nullable=False
    )
    payload: Mapped[dict] = mapped_column(JSONB, default=dict)

    run: Mapped["JobRun"] = relationship("JobRun", back_populates="result")
