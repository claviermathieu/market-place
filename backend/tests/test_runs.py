import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_trigger_run(client: AsyncClient):
    resp = await client.post(
        "/apps/1/run", json={"inputs": {"age": 45, "shock_rate": 10}}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "run_id" in data
    assert data["status"] == "PENDING"


@pytest.mark.asyncio
async def test_get_run_status(client: AsyncClient):
    run_resp = await client.post(
        "/apps/1/run", json={"inputs": {"age": 50, "shock_rate": 5}}
    )
    run_id = run_resp.json()["run_id"]

    resp = await client.get(f"/runs/{run_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["run_id"] == run_id
    assert data["status"] in ("PENDING", "RUNNING", "SUCCESS", "FAILED")


@pytest.mark.asyncio
async def test_get_run_not_found(client: AsyncClient):
    resp = await client.get("/runs/99999")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_list_runs(client: AsyncClient):
    resp = await client.get("/runs")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
