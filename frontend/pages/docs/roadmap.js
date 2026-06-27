import { useState, useEffect } from 'react'
import Head from 'next/head'
import DocsLayout from '../../components/docs/DocsLayout'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const TIERS = [
  {
    tier: 1,
    label: 'Tier 1 — Fundamentals',
    description: 'Self-contained computations. No external calls, no shared state. Build these first.',
    color: '#34d399',
    apps: [
      {
        id: 'lapse-stress',
        name: 'Lapse Rate Stress Tester',
        description:
          'Apply BaFin / EIOPA lapse stress (Type 1 additive or Type 2 multiplicative) to a policy block and project in-force movement over the duration of the portfolio.',
        concept: 'Core contract-first pattern. Introduces min/max capping, running products, and dual-scenario comparison.',
        complexity: 'Low',
        manifest: {
          name: 'Lapse Rate Stress Tester',
          description: 'Apply BaFin / EIOPA lapse stress and project in-force movement.',
          inputs: {
            base_lapse_rate: { type: 'number', label: 'Base annual lapse rate', min: 0, max: 50, step: 0.5, default: 8, unit: '%' },
            stress_factor: { type: 'number', label: 'Stress multiplier (150 = +50%)', min: 50, max: 300, step: 10, default: 150, unit: '%' },
            duration: { type: 'number', label: 'Projection duration', min: 1, max: 40, step: 1, default: 15, unit: ' yrs' },
          },
        },
      },
      {
        id: 'scr-market',
        name: 'SCR Market Risk (Simplified)',
        description:
          'Estimate the Solvency Capital Requirement for equity and interest rate risk using the Solvency II standard formula shocks: equity -39% (Type 1), interest rate ±relative shock by maturity.',
        concept: 'Introduces aggregation via correlation matrix (simple version: SQRT(SCR_eq² + SCR_ir² + 2·ρ·SCR_eq·SCR_ir)).',
        complexity: 'Medium',
        manifest: {
          name: 'SCR Market Risk (Simplified)',
          description: 'Estimate equity and interest rate SCR under Solvency II standard formula.',
          inputs: {
            equity_value: { type: 'number', label: 'Equity portfolio', min: 0, max: 10000, step: 10, default: 500, unit: ' M€' },
            bond_value: { type: 'number', label: 'Bond portfolio', min: 0, max: 50000, step: 100, default: 2000, unit: ' M€' },
            duration: { type: 'number', label: 'Bond portfolio duration', min: 0, max: 30, step: 0.5, default: 8, unit: ' yrs' },
          },
        },
      },
      {
        id: 'yield-bootstrap',
        name: 'Yield Curve Bootstrapper',
        description:
          'Bootstrap a zero-coupon yield curve from par swap rates using sequential discounting. Essential for Solvency II technical provisions, IFRS 17 discount rates, and pension liability valuation.',
        concept: 'Introduces scipy.interpolate for curve interpolation between bootstrapped maturities.',
        complexity: 'Medium',
        manifest: {
          name: 'Yield Curve Bootstrapper',
          description: 'Bootstrap par yield curve to zero rates using sequential discounting.',
          inputs: {
            short_rate: { type: 'number', label: '6M par rate', min: -5, max: 20, step: 0.1, default: 3.5, unit: '%' },
            medium_rate: { type: 'number', label: '5Y par rate', min: -5, max: 20, step: 0.1, default: 4.0, unit: '%' },
            long_rate: { type: 'number', label: '30Y par rate', min: -5, max: 20, step: 0.1, default: 4.8, unit: '%' },
          },
        },
      },
    ],
  },
  {
    tier: 2,
    label: 'Tier 2 — External Data',
    description: 'Introduces async HTTP calls inside function.py. Models become live rather than static.',
    color: '#f59e0b',
    apps: [
      {
        id: 'eiopa-rfr',
        name: 'EIOPA Risk-Free Rate Fetcher',
        description:
          'Fetch and visualise the EIOPA monthly risk-free rate curve for Solvency II technical provisions. Supports EUR, GBP, and CHF with and without the Volatility Adjustment.',
        concept: 'Introduces httpx.AsyncClient for async HTTP inside function.py. The function becomes a live data connector.',
        complexity: 'Medium',
        manifest: {
          name: 'EIOPA Risk-Free Rate Fetcher',
          description: 'Fetch and visualise the EIOPA monthly risk-free rate curve.',
          inputs: {
            currency: { type: 'number', label: 'Currency (0=EUR, 1=GBP, 2=CHF)', min: 0, max: 2, step: 1, default: 0, unit: '' },
            with_va: { type: 'number', label: 'Volatility Adjustment (0=No, 1=Yes)', min: 0, max: 1, step: 1, default: 1, unit: '' },
          },
        },
      },
      {
        id: 'benchmark',
        name: 'Benchmark Comparator',
        description:
          'Compare internal model SCR assumptions against published EIOPA or industry benchmarks. Flag deviations beyond a configurable tolerance band.',
        concept: 'Introduces multi-source data fusion: fetching two datasets and computing a relative comparison.',
        complexity: 'High',
        manifest: {
          name: 'Benchmark Comparator',
          description: 'Compare internal assumptions against published benchmarks.',
          inputs: {
            internal_mortality: { type: 'number', label: 'Internal qₓ at age 65', min: 0, max: 5, step: 0.01, default: 0.8, unit: '%' },
            tolerance: { type: 'number', label: 'Tolerance band', min: 0, max: 50, step: 5, default: 15, unit: '%' },
          },
        },
      },
    ],
  },
  {
    tier: 3,
    label: 'Tier 3 — Collaborative Features',
    description: 'Introduces authentication, sharing, and export. This is the production-grade platform.',
    color: '#a78bfa',
    apps: [
      {
        id: 'permalink',
        name: 'Run Sharing via Permalink',
        description:
          'GET /runs/{id} already exists. Add a "Copy link" button to the results panel. Anyone with the URL sees the exact inputs and outputs — not a screenshot, the live result.',
        concept: 'Frontend-only change. No backend work required. Demonstrates that GET /runs/{id} is already a shareable URL.',
        complexity: 'Low',
        manifest: null,
      },
      {
        id: 'pdf-export',
        name: 'PDF Export of Results',
        description:
          'Add a print-optimised CSS stylesheet and a "Download PDF" button that calls window.print(). The result is a professional, branded one-pager with the inputs, chart, and table.',
        concept: 'Introduces @media print CSS and browser-native PDF generation. No server-side rendering required.',
        complexity: 'Low',
        manifest: null,
      },
      {
        id: 'jwt-auth',
        name: 'Multi-User with JWT Authentication',
        description:
          'Add a login flow, JWT tokens issued by FastAPI, and user-scoped run history. Each actuary sees only their own runs. The admin can see all.',
        concept: 'Introduces FastAPI security (OAuth2PasswordBearer), bcrypt password hashing, and JWT token validation middleware.',
        complexity: 'High',
        manifest: null,
      },
    ],
  },
]

function ComplexityBadge({ level }) {
  const colors = {
    Low: '#34d399',
    Medium: '#f59e0b',
    High: '#f87171',
  }
  const c = colors[level] || '#8a909c'
  return (
    <span
      style={{
        fontSize: 10.5, fontWeight: 700, padding: '2px 8px',
        borderRadius: 999, color: c,
        background: `${c}18`, border: `1px solid ${c}30`,
        letterSpacing: '0.04em',
      }}
    >
      {level}
    </span>
  )
}

function ManifestBlock({ manifest }) {
  const [open, setOpen] = useState(false)
  if (!manifest) return null
  return (
    <div style={{ marginTop: 12 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: 'none', border: 'none',
          color: '#454c57', cursor: 'pointer',
          fontSize: 12, fontWeight: 600,
          padding: 0, fontFamily: 'inherit',
          letterSpacing: '0.04em',
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        <span style={{ fontSize: 10 }}>{open ? '▼' : '▶'}</span>
        MANIFEST.JSON
      </button>
      {open && (
        <pre
          style={{
            marginTop: 8,
            padding: '14px 16px',
            background: '#0e1117',
            border: '1px solid #1b2027',
            borderRadius: 8,
            fontSize: 11.5,
            lineHeight: 1.6,
            color: '#8a909c',
            overflowX: 'auto',
          }}
        >
          {JSON.stringify(manifest, null, 2)}
        </pre>
      )}
    </div>
  )
}

export default function RoadmapPage() {
  const [liveApps, setLiveApps] = useState([])

  useEffect(() => {
    fetch(`${API}/apps`)
      .then((r) => r.json())
      .then(setLiveApps)
      .catch(() => {})
  }, [])

  const liveNames = new Set(liveApps.map((a) => a.name.toLowerCase()))

  return (
    <DocsLayout title="App Roadmap">
      <h1>App Roadmap</h1>

      <p>
        A structured plan for the actuarial tools to build, organised by complexity tier.
        Tier 1 tools use only what this stack already provides. Each subsequent tier introduces
        one new concept — external data, authentication, sharing — keeping each step manageable.
      </p>

      {liveApps.length > 0 && (
        <div
          style={{
            padding: '16px 20px',
            background: 'rgba(52,211,153,.06)',
            border: '1px solid #0f3d28',
            borderRadius: 10,
            marginBottom: 36,
          }}
        >
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#34d399' }}>
            Currently Live
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {liveApps.map((app) => (
              <a
                key={app.id}
                href={`/apps/${app.id}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '5px 12px',
                  background: '#14171c', border: '1px solid #232932',
                  borderRadius: 8, fontSize: 13, color: '#d7dbe2',
                  textDecoration: 'none',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', flexShrink: 0 }} />
                {app.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {TIERS.map((tier) => (
        <div key={tier.tier} style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
            <h2 style={{ margin: 0, borderTop: 'none', paddingTop: 0 }}>{tier.label}</h2>
          </div>
          <p style={{ margin: '0 0 20px', color: '#6b727e', fontSize: 14 }}>{tier.description}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {tier.apps.map((app) => {
              const isLive = liveNames.has(app.name.toLowerCase())
              return (
                <div
                  key={app.id}
                  style={{
                    padding: '20px 22px',
                    background: '#14171c',
                    border: `1px solid ${isLive ? '#0f3d28' : '#232932'}`,
                    borderRadius: 12,
                    position: 'relative',
                  }}
                >
                  {isLive && (
                    <span
                      style={{
                        position: 'absolute', top: 14, right: 16,
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: 11, fontWeight: 700,
                        color: '#34d399', letterSpacing: '0.06em',
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} />
                      LIVE
                    </span>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#f1f3f6', letterSpacing: '-0.01em' }}>
                      {app.name}
                    </span>
                    {app.complexity && <ComplexityBadge level={app.complexity} />}
                  </div>

                  <p style={{ margin: '0 0 10px', fontSize: 13.5, color: '#8a909c', lineHeight: 1.6 }}>
                    {app.description}
                  </p>

                  <div
                    style={{
                      padding: '9px 12px',
                      background: '#0e1117',
                      border: '1px solid #1b2027',
                      borderRadius: 7,
                      fontSize: 12.5, color: '#6b727e', lineHeight: 1.55,
                    }}
                  >
                    <strong style={{ color: '#454c57', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      New concept
                    </strong>{' '}
                    <span style={{ color: '#6b727e' }}>{app.concept}</span>
                  </div>

                  <ManifestBlock manifest={app.manifest} />
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </DocsLayout>
  )
}
