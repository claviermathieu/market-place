import { useState, useMemo } from 'react'
import DocsLayout from '../../../components/docs/DocsLayout'

const GLOSSARY = [
  {
    category: 'Mortality Modeling',
    slug: 'mortality',
    terms: [
      {
        term: 'qₓ',
        full: 'Annual mortality rate',
        definition: 'Probability of death between exact age x and x+1. In the Gompertz model: qₓ = min(0.99, A × exp(B × x)) where A=0.00009 and B=0.091.',
        code: 'qx = np.minimum(0.99, 0.00009 * np.exp(0.091 * ages))',
      },
      {
        term: 'S(x, t)',
        full: 'Survival function',
        definition: 'Probability of surviving from age x to age x+t. Computed as the cumulative product of (1−qₓ₊ₛ) for s=0 to t−1.',
        code: 'survival = np.cumprod(1 - qx)',
      },
      {
        term: 'e̊ₓ',
        full: 'Curtate life expectancy',
        definition: 'Expected remaining lifetime at current age. Sum of survival probabilities from t=1 onward: Σ S(x, t) for t=1 to max_age−x.',
        code: 'life_expectancy = float(np.sum(survival[1:]))',
      },
      {
        term: 'lₓ',
        full: 'Life table survivors',
        definition: 'Number of survivors to exact age x from a radix of 100,000. Derived from qₓ as lₓ₊₁ = lₓ × (1 − qₓ).',
      },
      {
        term: 'Mortality shock',
        full: 'Solvency II mortality stress',
        definition: 'Stressed mortality rate under Solvency II SCR Life module: qₓ_stressed = qₓ × (1 + shock_rate/100). Tests whether reserves are adequate if actual mortality exceeds best estimate.',
        code: 'qx_stressed = qx * (1 + shock_rate / 100)',
      },
      {
        term: 'Gompertz slope (B)',
        full: 'Makeham-Gompertz B parameter',
        definition: 'Rate at which mortality increases with age. Value B=0.091 means mortality doubles roughly every 7.6 years (ln(2)/0.091). Calibrated to UK population data.',
      },
    ],
  },
  {
    category: 'Portfolio Pricer',
    slug: 'pricer',
    terms: [
      {
        term: 'GBM',
        full: 'Geometric Brownian Motion',
        definition: 'Stochastic process used to model asset prices: S(t) = S(0) × exp((μ − σ²/2)t + σW(t)). Ensures prices remain positive and exhibit log-normal returns.',
      },
      {
        term: 'μ (mu)',
        full: 'Expected annual return',
        definition: 'Drift parameter of the GBM model. A value of 0.07 means 7% expected annual return before volatility correction. Applied as monthly drift: (mu − 0.5 × sigma²) × dt where dt=1/12.',
        code: 'drift = (mu - 0.5 * sigma**2) * (1/12)',
      },
      {
        term: 'σ (sigma)',
        full: 'Annual volatility',
        definition: 'Standard deviation of log-returns, annualized. A value of 0.20 means 20% annualized volatility. Monthly diffusion: sigma × sqrt(dt) × Z where Z~N(0,1).',
        code: 'diffusion = sigma * np.sqrt(1/12) * rng.standard_normal((n_assets, periods))',
      },
      {
        term: 'Equal weighting',
        full: 'Portfolio construction method',
        definition: 'Each of the n_assets assets represents 1/n_assets of the portfolio. Portfolio value P(t) = (1/n_assets) × Σ Sᵢ(t). Starting value is the average of random initial prices, not normalized to 100.',
      },
    ],
  },
  {
    category: 'Solvency II',
    slug: 'solvency',
    terms: [
      {
        term: 'SCR',
        full: 'Solvency Capital Requirement',
        definition: 'Amount of capital required to withstand a 1-in-200 year shock (99.5th percentile VaR over one year). The key regulatory capital requirement under Solvency II.',
      },
      {
        term: 'BEL',
        full: 'Best Estimate Liability',
        definition: 'Expected present value of future cash flows (premiums, claims, expenses) using best-estimate assumptions — no prudence margin. The central component of the technical provisions.',
      },
      {
        term: 'RM',
        full: 'Risk Margin',
        definition: 'Cost of capital charge for non-hedgeable risks. Calculated as the cost of holding SCR for the runoff of the portfolio, at 6% cost of capital rate.',
      },
      {
        term: 'ORSA',
        full: 'Own Risk and Solvency Assessment',
        definition: 'Annual self-assessment of capital needs, risk profile, and solvency position under own stress scenarios. Required by Solvency II Article 45. Not the same as the standard formula SCR.',
      },
      {
        term: 'MCR',
        full: 'Minimum Capital Requirement',
        definition: 'Hard floor below which the regulator withdraws authorization. Calculated as a percentage of technical provisions and premiums, floored at 25% of SCR and capped at 45% of SCR.',
      },
      {
        term: 'QIS',
        full: 'Quantitative Impact Study',
        definition: 'Calibration exercises run by EIOPA to assess the impact of proposed Solvency II parameters. QIS5 (2010) was the last major study before the Directive came into force in 2016.',
      },
    ],
  },
  {
    category: 'IFRS 17',
    slug: 'ifrs17',
    terms: [
      {
        term: 'CSM',
        full: 'Contractual Service Margin',
        definition: 'The unearned profit in an insurance contract at inception. Released to the P&L over the coverage period as insurance service is provided. Cannot be negative at initial recognition (day-1 loss recognized immediately).',
      },
      {
        term: 'GMM',
        full: 'General Measurement Model',
        definition: 'The main IFRS 17 measurement model, also called the Building Block Approach (BBA). Liability = BEL + RM + CSM. Required for most long-term insurance contracts.',
      },
      {
        term: 'PAA',
        full: 'Premium Allocation Approach',
        definition: 'Simplified model for short-duration contracts (coverage period ≤12 months, or where results approximate GMM). Similar to current IFRS 4 unearned premium reserve approach.',
      },
      {
        term: 'VFA',
        full: 'Variable Fee Approach',
        definition: 'Modification of GMM for contracts where the entity participates in returns from underlying assets (e.g. unit-linked, with-profits). CSM adjusts for changes in the entity\'s share of fair value returns.',
      },
      {
        term: 'RA',
        full: 'Risk Adjustment',
        definition: 'Compensation required for bearing uncertainty in the amount and timing of non-financial risk. IFRS 17 does not prescribe a calculation method — common approaches include CoC method (like Solvency II RM) and VaR/CTE.',
      },
    ],
  },
]

function TermCard({ term, definition, full, code, highlight }) {
  const [expanded, setExpanded] = useState(false)
  const termMatch = highlight && term.toLowerCase().includes(highlight.toLowerCase())
  const defMatch = highlight && definition.toLowerCase().includes(highlight.toLowerCase())

  return (
    <div
      style={{
        padding: '14px 18px',
        background: '#14171c',
        border: '1px solid #232932',
        borderRadius: 10,
        cursor: code ? 'pointer' : 'default',
      }}
      onClick={() => code && setExpanded(e => !e)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ minWidth: 110 }}>
          <span style={{ fontSize: 15.5, fontWeight: 700, color: '#4f8cff', fontFamily: "'JetBrains Mono', monospace" }}>
            {term}
          </span>
          {full && (
            <div style={{ fontSize: 10.5, color: '#454c57', marginTop: 3, fontWeight: 600, letterSpacing: '0.03em', lineHeight: 1.3 }}>
              {full}
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 13.5, color: '#9aa0ab', lineHeight: 1.7 }}>{definition}</p>
          {code && (
            <>
              {expanded ? (
                <pre style={{
                  margin: '10px 0 0',
                  padding: '10px 14px',
                  background: '#0e1117',
                  border: '1px solid #1b2027',
                  borderRadius: 8,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: 12.5,
                  color: '#abb2bf',
                  overflowX: 'auto',
                  lineHeight: 1.6,
                }}>
                  <code>{code}</code>
                </pre>
              ) : (
                <div style={{ marginTop: 8, fontSize: 11.5, color: '#3a4150' }}>
                  ↓ implementation
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DomainGlossaryPage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return GLOSSARY.map(cat => ({
      ...cat,
      terms: cat.terms.filter(t =>
        !q ||
        t.term.toLowerCase().includes(q) ||
        (t.full || '').toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q)
      ),
    })).filter(cat => (!activeCategory || cat.slug === activeCategory) && cat.terms.length > 0)
  }, [query, activeCategory])

  const totalShown = filtered.reduce((n, c) => n + c.terms.length, 0)
  const totalAll = GLOSSARY.reduce((n, c) => n + c.terms.length, 0)

  return (
    <DocsLayout title="Domain Glossary">
      <h1>Domain Glossary</h1>

      <p>
        Actuarial terms, formulas, and implementation notes used across the marketplace.
        Terms with a Python snippet show how the concept is implemented in code — click to expand.
      </p>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 220px', position: 'relative' }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Filter terms..."
            style={{
              width: '100%',
              padding: '9px 14px 9px 36px',
              background: '#14171c',
              border: '1px solid #232932',
              borderRadius: 8,
              color: '#e6e8ec',
              fontSize: 13.5,
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#454c57', fontSize: 15, pointerEvents: 'none' }}>
            ⌕
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveCategory(null)}
            style={{
              padding: '6px 13px',
              borderRadius: 999,
              border: '1px solid',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              borderColor: !activeCategory ? '#4f8cff' : '#232932',
              background: !activeCategory ? 'rgba(79,140,255,.1)' : 'transparent',
              color: !activeCategory ? '#4f8cff' : '#6b727e',
            }}
          >
            All
          </button>
          {GLOSSARY.map(cat => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(c => c === cat.slug ? null : cat.slug)}
              style={{
                padding: '6px 13px',
                borderRadius: 999,
                border: '1px solid',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                borderColor: activeCategory === cat.slug ? '#4f8cff' : '#232932',
                background: activeCategory === cat.slug ? 'rgba(79,140,255,.1)' : 'transparent',
                color: activeCategory === cat.slug ? '#4f8cff' : '#6b727e',
              }}
            >
              {cat.category}
            </button>
          ))}
        </div>

        <span style={{ fontSize: 12, color: '#3a4150', whiteSpace: 'nowrap' }}>
          {totalShown} / {totalAll} terms
        </span>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#3a4150', fontSize: 14 }}>
          No terms match "{query}"
        </div>
      ) : (
        filtered.map(cat => (
          <div key={cat.slug} style={{ marginBottom: 40 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
              color: '#454c57', textTransform: 'uppercase',
              borderBottom: '1px solid #1b2027',
              paddingBottom: 8, marginBottom: 14,
            }}>
              {cat.category}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {cat.terms.map(t => (
                <TermCard key={t.term} highlight={query} {...t} />
              ))}
            </div>
          </div>
        ))
      )}
    </DocsLayout>
  )
}
