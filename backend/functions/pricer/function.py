import asyncio
import numpy as np


async def run(inputs: dict) -> dict:
    await asyncio.sleep(5 + np.random.uniform(0, 3))

    n_assets = max(1, int(inputs.get("n_assets", 50)))
    vol = float(inputs.get("volatility", 20)) / 100.0

    dt = 1 / 12
    mu = 0.07
    periods = 25


    rng = np.random.default_rng()
    W = rng.standard_normal((n_assets, periods))
    drift = (mu - 0.5 * vol**2) * dt
    diffusion = vol * np.sqrt(dt) * W

    log_returns = drift + diffusion
    paths = 100 * np.exp(np.cumsum(log_returns, axis=1))
    portfolio = paths.mean(axis=0)

    series = [{"x": int(t), "y": round(float(v), 2)} for t, v in enumerate(portfolio)]

    table_rows = [
        {
            "period": f"M{t}",
            "index_value": f"${float(v):.2f}",
            "return": f"{(float(v)/100 - 1)*100:.1f}%",
        }
        for t, v in enumerate(portfolio)
        if t % 4 == 0
    ]

    summary = {
        "n_assets": n_assets,
        "volatility": f"{vol*100:.0f}%",
        "final_value": f"${portfolio[-1]:.2f}",
        "total_return": f"{(portfolio[-1]/100 - 1)*100:.1f}%",
        "sharpe_ratio": round(
            float((portfolio[-1] / 100 - 1) / (vol * np.sqrt(dt * periods))), 2
        ),
    }

    return {
        "columns": ["Period", "Index value", "Return"],
        "table": table_rows,
        "series": series,
        "summary": summary,
    }
