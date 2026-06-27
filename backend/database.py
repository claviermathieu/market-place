import ssl

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from pydantic_settings import BaseSettings

# Supabase session pooler uses a self-signed CA in its certificate chain.
# We enforce TLS encryption but skip chain verification (acceptable for a hosted PaaS).
_ssl_ctx = ssl.create_default_context()
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode = ssl.CERT_NONE


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://marketplace:marketplace@db:5432/marketplace"

    class Config:
        env_file = ".env"


settings = Settings()

engine = create_async_engine(
    settings.database_url,
    echo=False,
    connect_args={"ssl": _ssl_ctx},
)
AsyncSessionLocal = async_sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
