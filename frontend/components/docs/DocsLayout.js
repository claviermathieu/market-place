import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import Navbar from '../Navbar'

const NAV_SECTIONS = [
  {
    heading: null,
    items: [
      { href: '/docs', label: 'Overview' },
      { href: '/docs/architecture', label: 'Architecture' },
      { href: '/docs/app-contract', label: 'App Contract' },
      { href: '/docs/add-an-app', label: 'Add an App' },
      { href: '/docs/api-reference', label: 'API Reference' },
      { href: '/docs/async-deep-dive', label: 'Async Deep Dive' },
    ],
  },
  {
    heading: 'Learning',
    items: [
      { href: '/docs/build-log', label: 'Build Logs' },
      { href: '/docs/build-log/mortality-simulator', label: 'Mortality Simulator', indent: true },
      { href: '/docs/build-log/portfolio-pricer', label: 'Portfolio Pricer', indent: true },
      { href: '/docs/ai-guide', label: 'AI Guide' },
      { href: '/docs/ai-guide/mental-model', label: 'Mental Model', indent: true },
      { href: '/docs/ai-guide/prompt-patterns', label: 'Prompt Patterns', indent: true },
      { href: '/docs/ai-guide/contract-first', label: 'Contract First', indent: true },
      { href: '/docs/ai-guide/iteration-playbook', label: 'Iteration Playbook', indent: true },
      { href: '/docs/ai-guide/actuary-to-builder', label: 'Actuary to Builder', indent: true },
      { href: '/docs/roadmap', label: 'App Roadmap' },
    ],
  },
]

const ALL_ITEMS = NAV_SECTIONS.flatMap((s) => s.items)

const STYLES = `
/* highlight.js atom-one-dark token colors */
.hljs { color: #abb2bf; background: transparent; }
.hljs-comment, .hljs-quote { color: #5c6370; font-style: italic; }
.hljs-doctag, .hljs-keyword, .hljs-formula { color: #c678dd; }
.hljs-section, .hljs-name, .hljs-selector-tag,
.hljs-deletion, .hljs-subst { color: #e06c75; }
.hljs-literal { color: #56b6c2; }
.hljs-string, .hljs-regexp, .hljs-addition,
.hljs-attribute, .hljs-meta .hljs-string { color: #98c379; }
.hljs-attr, .hljs-variable, .hljs-template-variable,
.hljs-type, .hljs-selector-class, .hljs-selector-attr,
.hljs-selector-pseudo, .hljs-number { color: #d19a66; }
.hljs-symbol, .hljs-bullet, .hljs-link,
.hljs-meta, .hljs-selector-id, .hljs-title { color: #61aeee; }
.hljs-built_in, .hljs-title.class_, .hljs-class .hljs-title { color: #e6c07b; }
.hljs-emphasis { font-style: italic; }
.hljs-strong { font-weight: bold; }
.hljs-link { text-decoration: underline; }

/* Docs prose styles */
.docs-prose { font-size: 15px; line-height: 1.7; }
.docs-prose h1 {
  color: #f4f6f9; font-size: 1.95rem; font-weight: 700;
  margin: 0 0 20px; letter-spacing: -0.035em;
}
.docs-prose h2 {
  color: #f1f3f6; font-size: 1.2rem; font-weight: 600;
  margin: 44px 0 14px; letter-spacing: -0.02em;
  padding-top: 28px; border-top: 1px solid #1b2027;
}
.docs-prose h3 {
  color: #e6e8ec; font-size: 1.025rem; font-weight: 600;
  margin: 28px 0 10px;
}
.docs-prose h4 {
  color: #6b727e; font-size: 0.85rem; font-weight: 700;
  margin: 20px 0 8px; text-transform: uppercase; letter-spacing: 0.06em;
}
.docs-prose p { color: #9aa0ab; line-height: 1.78; margin: 0 0 16px; }
.docs-prose a { color: #4f8cff; text-decoration: none; }
.docs-prose a:hover { text-decoration: underline; }
.docs-prose ul, .docs-prose ol {
  color: #9aa0ab; padding-left: 22px; margin: 0 0 18px;
}
.docs-prose li { margin: 6px 0; line-height: 1.72; }
.docs-prose li > p { margin: 0; }
.docs-prose code {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  background: #1b1f26; color: #e2e6ec;
  padding: 2px 7px; border-radius: 4px; font-size: 0.875em;
}
.docs-prose pre {
  background: #0e1117; border: 1px solid #1b2027;
  border-radius: 10px; padding: 18px 22px;
  overflow-x: auto; margin: 16px 0 24px;
}
.docs-prose pre code {
  background: none; padding: 0; color: inherit;
  font-size: 0.855em; line-height: 1.65;
}
.docs-prose blockquote {
  border-left: 3px solid #4f8cff; padding: 2px 16px;
  color: #8a909c; margin: 20px 0;
  background: rgba(79,140,255,.04); border-radius: 0 6px 6px 0;
}
.docs-prose hr { border: none; border-top: 1px solid #1b2027; margin: 36px 0; }
.docs-prose strong { color: #e6e8ec; font-weight: 600; }
.docs-prose table {
  width: 100%; border-collapse: collapse; margin: 20px 0 28px;
  font-size: 14px;
}
.docs-prose th {
  background: #14171c; color: #d7dbe2;
  padding: 10px 14px; text-align: left;
  font-weight: 600; font-size: 13px; border: 1px solid #232932;
}
.docs-prose td {
  padding: 10px 14px; color: #8a909c;
  border: 1px solid #1b2027; vertical-align: top;
}
.docs-prose tr:nth-child(even) td { background: rgba(255,255,255,.015); }
`

function SidebarContent({ pathname }) {
  return (
    <nav style={{ padding: '20px 0 32px' }}>
      {NAV_SECTIONS.map((section, si) => (
        <div key={si}>
          {section.heading && (
            <div
              style={{
                padding: '16px 18px 6px',
                fontSize: 10, fontWeight: 700,
                letterSpacing: '0.1em', color: '#2f3947',
                textTransform: 'uppercase',
                borderTop: si > 0 ? '1px solid #151a21' : 'none',
                marginTop: si > 0 ? 8 : 0,
              }}
            >
              {section.heading}
            </div>
          )}
          {!section.heading && (
            <div
              style={{
                padding: '0 18px 8px',
                fontSize: 10, fontWeight: 700,
                letterSpacing: '0.09em', color: '#3a4150',
                textTransform: 'uppercase',
              }}
            >
              Documentation
            </div>
          )}
          {section.items.map((item) => {
            const active = pathname === item.href
            const parentActive = !active && item.indent && pathname.startsWith(item.href.split('/').slice(0, -1).join('/'))
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'block',
                  padding: item.indent ? '5px 18px 5px 30px' : '7px 18px',
                  fontSize: item.indent ? 12.5 : 13.5,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#4f8cff' : item.indent ? '#6b727e' : '#8a909c',
                  background: active ? 'rgba(79,140,255,.08)' : 'transparent',
                  borderRight: active ? '2px solid #4f8cff' : '2px solid transparent',
                  textDecoration: 'none',
                  transition: 'color 0.12s, background 0.12s',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

export default function DocsLayout({ children, title }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 800)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
  }, [router.pathname])

  const currentIndex = ALL_ITEMS.findIndex((n) => n.href === router.pathname)
  const prev = currentIndex > 0 ? ALL_ITEMS[currentIndex - 1] : null
  const next = currentIndex < ALL_ITEMS.length - 1 ? ALL_ITEMS[currentIndex + 1] : null

  return (
    <div style={{ minHeight: '100vh', background: '#0b0d10', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Head>
        <title>{title ? `${title} — MCLAVIER Docs` : 'MCLAVIER Docs'}</title>
        <style>{STYLES}</style>
      </Head>

      <Navbar />

      <div style={{ display: 'flex', position: 'relative', maxWidth: 1280, margin: '0 auto' }}>
        {/* Desktop sidebar */}
        {!isMobile && (
          <aside
            style={{
              width: 238,
              flexShrink: 0,
              position: 'sticky',
              top: 52,
              height: 'calc(100vh - 52px)',
              overflowY: 'auto',
              background: '#0d1014',
              borderRight: '1px solid #1b2027',
            }}
          >
            <SidebarContent pathname={router.pathname} />
          </aside>
        )}

        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <>
            <div
              onClick={() => setSidebarOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', zIndex: 30 }}
            />
            <aside
              style={{
                position: 'fixed', top: 0, left: 0, bottom: 0,
                width: 265, zIndex: 31,
                background: '#0d1014', borderRight: '1px solid #1b2027',
                boxShadow: '6px 0 32px rgba(0,0,0,.5)', overflowY: 'auto',
              }}
            >
              <div
                style={{
                  padding: '14px 18px', display: 'flex',
                  alignItems: 'center', justifyContent: 'space-between',
                  borderBottom: '1px solid #1b2027',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: '#f3f5f8' }}>Docs</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#8a909c', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: 0 }}
                >
                  ×
                </button>
              </div>
              <SidebarContent pathname={router.pathname} />
            </aside>
          </>
        )}

        {/* Main content */}
        <main
          style={{
            flex: 1, minWidth: 0,
            padding: isMobile ? '28px 20px 80px' : '40px 56px 80px',
            maxWidth: 820,
          }}
        >
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36, fontSize: 13 }}>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  background: 'none', border: '1px solid #2f3947', borderRadius: 6,
                  color: '#8a909c', cursor: 'pointer', padding: '4px 9px',
                  fontSize: 16, marginRight: 6, fontFamily: 'inherit',
                }}
              >
                ☰
              </button>
            )}
            <Link href="/docs" style={{ color: '#6b727e', textDecoration: 'none' }}>Docs</Link>
            {title && (
              <>
                <span style={{ color: '#2f3947' }}>/</span>
                <span style={{ color: '#d7dbe2', fontWeight: 500 }}>{title}</span>
              </>
            )}
          </div>

          {/* Content */}
          <div className="docs-prose">{children}</div>

          {/* Previous / Next */}
          {(prev || next) && (
            <div
              style={{
                display: 'flex', justifyContent: 'space-between',
                gap: 16, marginTop: 64, paddingTop: 32,
                borderTop: '1px solid #1b2027',
              }}
            >
              {prev ? (
                <Link
                  href={prev.href}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 3,
                    padding: '14px 20px', background: '#14171c',
                    border: '1px solid #232932', borderRadius: 10,
                    textDecoration: 'none', flex: 1, maxWidth: '48%',
                  }}
                >
                  <span style={{ fontSize: 10.5, color: '#454c57', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                    ← Previous
                  </span>
                  <span style={{ fontSize: 14, color: '#d7dbe2', fontWeight: 500 }}>{prev.label}</span>
                </Link>
              ) : <div />}
              {next ? (
                <Link
                  href={next.href}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 3,
                    padding: '14px 20px', background: '#14171c',
                    border: '1px solid #232932', borderRadius: 10,
                    textDecoration: 'none', flex: 1, maxWidth: '48%', textAlign: 'right',
                  }}
                >
                  <span style={{ fontSize: 10.5, color: '#454c57', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                    Next →
                  </span>
                  <span style={{ fontSize: 14, color: '#d7dbe2', fontWeight: 500 }}>{next.label}</span>
                </Link>
              ) : <div />}
            </div>
          )}

          {/* Edit on GitHub */}
          <div style={{ marginTop: 40, paddingTop: 20 }}>
            <a
              href="https://github.com/claviermathieu/market-place/tree/main/frontend/pages/docs"
              target="_blank"
              rel="noreferrer"
              style={{
                color: '#3a4150', fontSize: 12.5, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 7,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Edit this page on GitHub
            </a>
          </div>
        </main>
      </div>
    </div>
  )
}
