import Head from 'next/head'
import Link from 'next/link'
import Navbar from '../../components/Navbar'

const SECTIONS = [
  {
    href: '/docs/architecture',
    title: 'Architecture',
    description:
      'Full stack diagram, layer-by-layer breakdown, and the end-to-end data flow from button click to WebSocket result.',
    readTime: '5 min read',
    icon: '⬡',
  },
  {
    href: '/docs/app-contract',
    title: 'App Contract',
    description:
      'Complete manifest.json and function.py specification with all supported field types, validation rules, and a worked example.',
    readTime: '8 min read',
    icon: '◈',
  },
  {
    href: '/docs/add-an-app',
    title: 'Add an App',
    description:
      'Step-by-step tutorial: create a repo, write the manifest and function, register via the marketplace UI, run it, and fix common errors.',
    readTime: '6 min read',
    icon: '⊕',
  },
  {
    href: '/docs/api-reference',
    title: 'API Reference',
    description:
      'All REST endpoints and the WebSocket protocol with request/response schemas, status codes, and curl examples.',
    readTime: '10 min read',
    icon: '⊞',
  },
  {
    href: '/docs/async-deep-dive',
    title: 'Async Deep Dive',
    description:
      'How asyncio, BackgroundTasks, WebSocket polling, dynamic importlib loading, and asyncpg sessions fit together under the hood.',
    readTime: '12 min read',
    icon: '⟳',
  },
]

const QUICK_REF = [
  ['API base URL', 'http://localhost:8000'],
  ['WebSocket base URL', 'ws://localhost:8000'],
  ['Frontend URL', 'http://localhost:3000'],
  ['Database', 'PostgreSQL via asyncpg'],
]

export default function DocsIndex() {
  return (
    <div style={{ minHeight: '100vh', background: '#0b0d10', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Head>
        <title>MCLAVIER Docs</title>
      </Head>
      <Navbar />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 24px 90px' }}>
        {/* Hero */}
        <div style={{ marginBottom: 52 }}>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '4px 13px',
              background: 'rgba(79,140,255,.1)',
              border: '1px solid rgba(79,140,255,.25)',
              borderRadius: 999,
              fontSize: 11.5, fontWeight: 700,
              color: '#4f8cff', letterSpacing: '0.06em',
              marginBottom: 20,
            }}
          >
            DOCUMENTATION
          </div>
          <h1
            style={{
              margin: '0 0 14px',
              fontSize: 34, fontWeight: 700,
              letterSpacing: '-0.04em', color: '#f4f6f9',
            }}
          >
            MCLAVIER Marketplace Docs
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: '#8a909c', lineHeight: 1.65, maxWidth: 540 }}>
            Everything you need to understand, extend, and deploy actuarial models on the marketplace.
          </p>
        </div>

        {/* Section cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: 16,
            marginBottom: 52,
          }}
        >
          {SECTIONS.map((section) => (
            <Link key={section.href} href={section.href} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  padding: '22px 24px',
                  background: '#14171c',
                  border: '1px solid #232932',
                  borderRadius: 13,
                  display: 'flex', flexDirection: 'column', gap: 12,
                  height: '100%',
                  transition: 'border-color 0.15s, transform 0.12s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#33404f'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#232932'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 22, color: '#4f8cff', opacity: 0.65 }}>{section.icon}</span>
                  <span style={{ fontSize: 11, color: '#3a4150', fontWeight: 500 }}>{section.readTime}</span>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 15.5, fontWeight: 600,
                      color: '#f1f3f6', marginBottom: 7,
                      letterSpacing: '-0.015em',
                    }}
                  >
                    {section.title}
                  </div>
                  <div style={{ fontSize: 13.5, color: '#8a909c', lineHeight: 1.6 }}>
                    {section.description}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#4f8cff', marginTop: 'auto' }}>
                  Read more →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick reference */}
        <div
          style={{
            padding: '26px 30px',
            background: '#14171c',
            border: '1px solid #232932',
            borderRadius: 13,
          }}
        >
          <h2
            style={{
              margin: '0 0 18px',
              fontSize: 15, fontWeight: 600,
              color: '#f1f3f6', letterSpacing: '-0.01em',
            }}
          >
            Quick Reference
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 18 }}>
            {QUICK_REF.map(([label, value]) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: 10.5, fontWeight: 700,
                    color: '#3a4150', textTransform: 'uppercase',
                    letterSpacing: '0.08em', marginBottom: 5,
                  }}
                >
                  {label}
                </div>
                <code
                  style={{
                    fontSize: 12.5, color: '#9aa0ab',
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  }}
                >
                  {value}
                </code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
