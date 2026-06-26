import asyncio
import httpx
import websockets
import json
import time

async def test():
    async with httpx.AsyncClient() as client:
        r = await client.post(
            "http://localhost:8000/apps/1/run",
            json={"inputs": {"age": 45, "shock_rate": 0.15}}
        )
        run_id = r.json()["run_id"]
        print(f"run_id: {run_id}")

    start = time.time()
    uri = f"ws://localhost:8000/ws/runs/{run_id}"

    async with websockets.connect(uri) as ws:
        async for message in ws:
            data = json.loads(message)
            elapsed = round(time.time() - start, 1)
            print(f"[{elapsed}s] status: {data['status']}")
            if data["status"] in ("SUCCESS", "FAILED"):
                print("WebSocket closed cleanly")
                break

asyncio.run(test())
