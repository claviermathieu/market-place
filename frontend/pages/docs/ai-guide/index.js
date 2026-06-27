import Link from 'next/link'
import DocsLayout from '../../../components/docs/DocsLayout'

const PAGES = [
  {
    href: '/docs/ai-guide/mental-model',
    title: 'Mental Model',
    description: 'How to think about AI as a coding partner. Why domain expertise is now the scarce resource.',
    readTime: '8 min',
    tag: 'Start here',
    tagColor: '#34d399',
  },
  {
    href: '/docs/ai-guide/prompt-patterns',
    title: 'Prompt Patterns',
    description: 'The 5 patterns that consistently produce correct actuarial code. With examples from real model builds.',
    readTime: '12 min',
    tag: 'Core',
    tagColor: '#4f8cff',
  },
  {
    href: '/docs/ai-guide/contract-first',
    title: 'Contract First',
    description: 'Why defining the interface before writing code reduces AI errors by ~70%. Templates included.',
    readTime: '10 min',
    tag: 'Core',
    tagColor: '#4f8cff',
  },
  {
    href: '/docs/ai-guide/iteration-playbook',
    title: 'Iteration Playbook',
    description: 'How to read AI-generated code, classify the error type, and direct the AI to fix it correctly.',
    readTime: '9 min',
    tag: 'Core',
    tagColor: '#4f8cff',
  },
  {
    href: '/docs/ai-guide/actuary-to-builder',
    title: 'Actuary to Builder',
    description: 'The full journey: from Excel model to deployed app. Concept mapping and a 6-month roadmap.',
    readTime: '15 min',
    tag: 'Advanced',
    tagColor: '#a78bfa',
  },
]

export default function AIGuideIndex() {
  return (
    <DocsLayout title="AI Guide">
      <h1>AI Interaction Guide</h1>

      <p>
        A practical, opinionated guide on how to build actuarial tools with AI. Written for a senior
        actuary — someone who knows what qₓ means and has never written a for-loop. The goal is not to
        teach you to code. The goal is to teach you to <strong>direct</strong> AI to code for you, correctly
        and reliably.
      </p>

      <p>
        This guide is built from real experience building the apps in this marketplace. Every pattern
        here has been tested against failure modes. Where something doesn't work, we say so.
      </p>

      <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {PAGES.map((page, i) => (
          <Link key={page.href} href={page.href} style={{ textDecoration: 'none' }}>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 20,
                padding: '18px 22px',
                background: '#14171c',
                border: '1px solid #232932',
                borderRadius: 12,
                transition: 'border-color 0.15s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#33404f')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#232932')}
            >
              <div
                style={{
                  width: 32, height: 32, flexShrink: 0,
                  borderRadius: 9, background: '#1b1f26',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#454c57',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#f1f3f6', letterSpacing: '-0.01em' }}>
                    {page.title}
                  </span>
                  <span
                    style={{
                      fontSize: 10.5, fontWeight: 700, padding: '2px 8px',
                      borderRadius: 999, color: page.tagColor,
                      background: `${page.tagColor}18`,
                      border: `1px solid ${page.tagColor}30`,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {page.tag}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#8a909c', lineHeight: 1.55 }}>
                  {page.description}
                </p>
              </div>
              <div style={{ flexShrink: 0, fontSize: 11, color: '#3a4150', fontWeight: 500 }}>
                {page.readTime}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </DocsLayout>
  )
}
