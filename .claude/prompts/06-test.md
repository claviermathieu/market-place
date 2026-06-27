# Template — Add Tests

## Context

Read `CLAUDE.md` before starting.
Read the file(s) to be tested before writing any test code:
- `[file to test]`

Existing tests (if any) are in `backend/tests/`. Run them with:
```bash
docker compose exec backend pytest
```

## What to test

Module: `[backend/routers/name.py]` or `[backend/functions/name/function.py]`

### Test cases required

| Test | Input | Expected output |
|------|-------|-----------------|
| Happy path | [inputs] | [expected response/return] |
| Edge case — minimum | [inputs] | [expected] |
| Edge case — maximum | [inputs] | [expected] |
| [Error case] | [invalid input] | [expected error code/message] |

## Test setup

Use `pytest-asyncio` for async tests. Use `httpx.AsyncClient` for endpoint tests.

```python
import pytest
import pytest_asyncio
from httpx import AsyncClient
from main import app

@pytest_asyncio.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c
```

## Constraints

- Do NOT use mocks for the database — tests run against the actual Docker DB
- If a test requires specific DB state, create it in a pytest fixture and clean up after
- Test file goes in `backend/tests/test_[name].py`
- Test function names: `test_[endpoint_or_function]_[scenario]`
- Each test must be independent — no shared state between tests

## What NOT to test

- The ORM models (SQLAlchemy guarantees their behavior)
- Pydantic validation (Pydantic guarantees its own behavior)
- The WebSocket (integration tested manually via the browser)

## For function.py tests (actuarial computation)

```python
import pytest
import numpy as np

@pytest.mark.asyncio
async def test_mortality_simulator_base_case():
    from functions.mortality.function import run
    result = await run({"age": 45, "shock_rate": 0})
    
    # Structural checks
    assert "table" in result
    assert "series" in result
    assert "summary" in result
    
    # Domain correctness: life expectancy at 45 with no shock ≈ 27-32 years
    le = result["summary"]["life_expectancy"]
    assert 25 <= le <= 35, f"Life expectancy {le} outside expected range"
    
    # All survival values between 0 and 100%
    for point in result["series"]:
        assert 0 <= point["y"] <= 100
```
