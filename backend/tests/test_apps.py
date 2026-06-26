import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_apps(client: AsyncClient):
    resp = await client.get("/apps")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 2
    names = [a["name"] for a in data]
    assert "Mortality Simulator" in names
    assert "Portfolio Pricer" in names


@pytest.mark.asyncio
async def test_get_app(client: AsyncClient):
    resp = await client.get("/apps/1")
    assert resp.status_code == 200
    data = resp.json()
    assert "name" in data
    assert "input_schema" in data


@pytest.mark.asyncio
async def test_get_app_not_found(client: AsyncClient):
    resp = await client.get("/apps/9999")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_register_app_missing_url(client: AsyncClient):
    resp = await client.post("/apps/register", json={"repo_url": ""})
    assert resp.status_code in (422, 400)
