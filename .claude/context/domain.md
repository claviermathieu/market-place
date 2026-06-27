# Actuarial Domain Reference

This project is built by an actuary, for actuarial work. This file explains
the domain concepts behind the apps so that Claude can make accurate suggestions.

## Who uses this

Senior actuaries at Deloitte working on life insurance, reinsurance, and pension
valuations. Users understand Solvency II, IFRS 17, and standard mortality tables.
They do not need explanations of basic actuarial concepts.

## Mortality modeling

### Gompertz-Makeham model (used in Mortality Simulator)

The mortality rate (probability of death in year x to x+1) follows:

```
qₓ = min(0.99, A × exp(B × x))
```

Where:
- `A = 0.00009` — initial mortality (accident hump, early adult mortality)
- `B = 0.091` — Gompertz slope (rate of mortality increase with age)
- `x` — attained age (not age at entry, but current age in the projection)

The survival function (probability of surviving from age x to age x+t):

```
S(x, t) = Π(1 - qₓ₊ₛ) for s = 0 to t-1
```

Implemented as `np.cumprod(1 - qx)`.

### Solvency II mortality shock

Under Solvency II standard formula (SCR Life module), the mortality stress test
increases all mortality rates by a factor above the base case:

```
qₓ_stressed = qₓ × (1 + shock_rate/100)
```

The shock is applied before computing the survival curve. This tests whether
reserves are adequate if actual mortality exceeds best estimate.

### Life expectancy from qx table

Curtate expectation of life at current age:

```
e̊ₓ = Σ S(x, t) for t = 1 to max_age-x
```

Implemented as `float(np.sum(survival[1:]))` (sum from t=1, since survival at t=0 is 1.0).

Realistic ranges:
- Age 25 (no shock): life expectancy ~55 years → dies around age 80
- Age 45 (no shock): life expectancy ~28 years → dies around age 73
- Age 65 (no shock): life expectancy ~15 years → dies around age 80
- Age 65 (20% shock): life expectancy ~14 years → slight reduction

### Validation benchmarks

- At age 65 with 0% shock: survival at age 85 ≈ 30-35% (aligned with CMI 2022 UK tables)
- At age 45 with 0% shock: survival at age 75 ≈ 60-70%
- qₓ at age 100 should be very close to 1.0 (nearly certain death)

## Portfolio Pricer

### Geometric Brownian Motion (GBM)

Asset prices follow:

```
S(t) = S(0) × exp((μ - σ²/2)t + σW(t))
```

Where:
- `μ` — expected annual return
- `σ` — annual volatility
- `W(t)` — Wiener process (standard Brownian motion)

Discretized over monthly steps: `dt = 1/12`

```python
drift = (mu - 0.5 * sigma**2) * dt
diffusion = sigma * np.sqrt(dt) * Z  # Z ~ N(0,1)
monthly_returns = np.exp(drift + diffusion)  # shape: (n_assets, periods)
prices = S0 * np.cumprod(monthly_returns, axis=1)
```

### Portfolio construction

- Each asset is assigned a random initial price `S0 ~ Uniform(50, 200)`
- Equal weighting: each asset represents `1/n_assets` of the portfolio
- Portfolio value at time t: `P(t) = (1/n_assets) × Σ Sᵢ(t)`
- Starting portfolio value: `P(0) = (1/n_assets) × Σ S0ᵢ` (not normalized to 100)

### Output format

```python
{
    "series": [{"x": t_months, "y": portfolio_value}],  # monthly portfolio path
    "table": [{"month": t, "asset_N": price}],           # individual asset prices
    "summary": {
        "initial_value": ...,    # portfolio value at t=0
        "final_value": ...,      # portfolio value at t=36
        "total_return": ...,     # (final - initial) / initial × 100, in percent
    }
}
```

## Solvency II concepts (frequently referenced)

| Term | Meaning |
|------|---------|
| SCR | Solvency Capital Requirement — amount of capital required to withstand a 1-in-200 year shock |
| BEL | Best Estimate Liability — expected present value of future cash flows |
| RM | Risk Margin — cost of capital for non-hedgeable risks |
| ORSA | Own Risk and Solvency Assessment — annual self-assessment of capital needs |
| MCR | Minimum Capital Requirement — minimum below which regulator intervenes |
| QIS | Quantitative Impact Study — calibration exercises for the standard formula |
| qₓ | Probability of death between exact age x and x+1 |
| lₓ | Number of survivors to exact age x from a radix of 100,000 |

## IFRS 17 concepts (for future apps)

| Term | Meaning |
|------|---------|
| CSM | Contractual Service Margin — unearned profit, released over coverage period |
| GMM | General Measurement Model — main IFRS 17 model for most contracts |
| PAA | Premium Allocation Approach — simplified model for short-duration contracts |
| VFA | Variable Fee Approach — model for participating contracts |
| RA | Risk Adjustment — compensation required for bearing uncertainty |

## App naming conventions

Apps in this marketplace follow actuarial naming:
- Function names reference the underlying model, not the application: `mortality_simulator`, `gbm_pricer`
- NOT: `death_calculator`, `stock_simulator`
- Parameters use actuarial abbreviations where standard: `qx`, `lx`, `mu`, `sigma`, `dt`
- Units always stated explicitly: `shock_rate` (not `shock`), `n_periods` (not `periods`)
