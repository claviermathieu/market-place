import asyncio
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from database import Base, get_db
import main as app_module

TEST_DB_URL = "postgresql+asyncpg://marketplace:marketplace@localhost:5432/marketplace_test"

test_engine = create_async_engine(TEST_DB_URL, echo=False)
TestSession = async_sessionmaker(
    test_engine, expire_on_commit=False, class_=AsyncSession
)


async def override_get_db():
    async with TestSession() as session:
        yield session


@pytest_asyncio.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    from models import User, App
    from pathlib import Path
    import json

    FUNCTIONS_DIR = Path(__file__).parent.parent / "functions"
    async with TestSession() as db:
        user = User(id=1, email="admin@mclavier.tech", role="admin")
        db.add(user)
        for folder in ("mortality", "pricer"):
            mp = FUNCTIONS_DIR / folder / "manifest.json"
            if mp.exists():
                with open(mp) as f:
                    m = json.load(f)
                db.add(App(
                    name=m["name"],
                    description=m.get("description", ""),
                    function_name=folder,
                    function_path=str(FUNCTIONS_DIR / folder),
                    input_schema=m.get("inputs", {}),
                ))
        await db.commit()

    yield

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()


@pytest_asyncio.fixture
async def client():
    app_module.app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app_module.app), base_url="http://test"
    ) as ac:
        yield ac
    app_module.app.dependency_overrides.clear()
