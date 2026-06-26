import asyncio
import numpy as np


async def run(inputs: dict) -> dict:
    await asyncio.sleep(5 + np.random.uniform(0, 3))

    age = int(inputs.get("age", 45))
    shock = float(inputs.get("shock_rate", 10)) / 100.0

    ages = np.arange(age, 101)
    qx = np.minimum(0.99, 0.00009 * np.exp(0.091 * ages) * (1 + shock))

    survival = np.ones(len(ages))
    for i in range(1, len(ages)):
        survival[i] = survival[i - 1] * (1 - qx[i - 1])

    series = [
        {"x": int(a), "y": round(float(s) * 100, 2)}
        for a, s in zip(ages, survival)
    ]

    mask = np.array([True if (a == age or a % 5 == 0) else False for a in ages])
    table_rows = [
        {
            "age": int(a),
            "qx": f"{float(q)*100:.2f}%",
            "survival": f"{float(s)*100:.1f}%",
        }
        for a, q, s in zip(ages[mask], qx[mask], survival[mask])
    ]

    summary = {
        "initial_age": age,
        "shock_applied": f"{shock*100:.1f}%",
        "life_expectancy": round(float(np.sum(survival)), 1),
        "survival_at_65": (
            f"{float(survival[np.searchsorted(ages, 65)]) * 100:.1f}%"
            if age <= 65
            else "N/A"
        ),
    }

    return {
        "columns": ["Age", "Mortality qₓ", "Survival"],
        "table": table_rows,
        "series": series,
        "summary": summary,
    }
