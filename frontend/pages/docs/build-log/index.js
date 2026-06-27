import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import DocsLayout from '../../../components/docs/DocsLayout'

const LOGS = [
  {
    href: '/docs/build-log/mortality-simulator',
    title: 'Mortality Simulator',
    subtitle: 'Gompertz survival curves under Solvency II mortality shock',
    tags: ['Life insurance', 'Solvency II', 'numpy'],
    prompts: 3,
    iterations: 2,
    difficulty: 'Beginner',
    diffColor: '#34d399',
  },
  {
    href: '/docs/build-log/portfolio-pricer',
    title: 'Portfolio Pricer',
    subtitle: 'GBM simulation of diversified portfolios across volatility regimes',
    tags: ['Asset management', 'IFRS 17', 'Monte Carlo'],
    prompts: 4,
    iterations: 3,
    difficulty: 'Intermediate',
    diffColor: '#f59e0b',
  },
]

export default function BuildLogIndex() {
  return (
    <DocsLayout title="Build Logs">
      <h1>Build Logs</h1>

      <p>
        For every app in the marketplace, this section documents how it was built with AI — the exact
        prompts, the iterations, what the AI got right, and where domain knowledge was essential.
        These logs are a practical knowledge base on effective human–AI collaboration for actuarial tooling.
      </p>

      <p>
        The goal is not to celebrate the AI. The goal is to show where <strong>your actuarial expertise</strong> was
        the irreplaceable ingredient — and where the AI saved you days of implementation work.
      </p>

      <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {LOGS.map((log) => (
          <Link key={log.href} href={log.href} style={{ textDecoration: 'none' }}>
            <div
              style={{
                padding: '22px 24px',
                background: '#14171c',
                border: '1px solid #232932',
                borderRadius: 12,
                transition: 'border-color 0.15s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#33404f')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#232932')}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 15.5, fontWeight: 600, color: '#f1f3f6', letterSpacing: '-0.01em' }}>
                      {log.title}
                    </span>
                    <span
                      style={{
                        fontSize: 10.5, fontWeight: 700, padding: '2px 8px',
                        borderRadius: 999, color: log.diffColor,
                        background: `${log.diffColor}18`,
                        border: `1px solid ${log.diffColor}30`,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {log.difficulty}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 12px', fontSize: 13.5, color: '#8a909c' }}>
                    {log.subtitle}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {log.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: 11.5, padding: '3px 9px',
                          background: '#1b1f26', border: '1px solid #262c35',
                          borderRadius: 6, color: '#6b727e',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
                  {[['Prompts', log.prompts], ['Iterations', log.iterations]].map(([label, val]) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#4f8cff' }}>{val}</div>
                      <div style={{ fontSize: 11, color: '#454c57', fontWeight: 600, letterSpacing: '0.04em' }}>{label.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div
        style={{
          marginTop: 40, padding: '18px 20px',
          background: 'rgba(79,140,255,.06)', border: '1px solid #243555',
          borderRadius: 10,
        }}
      >
        <p style={{ margin: 0, fontSize: 13.5, color: '#8a909c', lineHeight: 1.65 }}>
          <strong style={{ color: '#4f8cff' }}>Adding an app?</strong> When you register a new app
          via the marketplace, the modal generates a pre-filled build log template you can copy
          directly into <code style={{ fontFamily: 'monospace', background: '#1b1f26', padding: '1px 5px', borderRadius: 3, fontSize: 11.5 }}>
            docs/build-log/&#x3C;your-app&#x3E;.mdx
          </code>.
        </p>
      </div>
    </DocsLayout>
  )
}
