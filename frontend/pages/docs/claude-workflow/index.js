import Link from 'next/link'
import DocsLayout from '../../../components/docs/DocsLayout'

const CARDS = [
  {
    href: '/docs/claude-workflow/prompt-library',
    title: 'Prompt Library',
    description:
      '7 reusable prompt templates — project context, new features, new apps, debugging, refactoring, code review, and testing. Copy and fill in the brackets.',
    icon: '◧',
    meta: '7 templates',
  },
  {
    href: '/docs/claude-workflow/decisions',
    title: 'Architecture Decisions',
    description:
      '5 ADRs documenting why we chose async FastAPI, JSONB storage, WebSocket polling, MDX docs, and importlib dispatch — with the exact gotchas we hit.',
    icon: '◈',
    meta: '5 ADRs',
  },
  {
    href: '/docs/claude-workflow/domain-glossary',
    title: 'Domain Glossary',
    description:
      'Actuarial terms, formulas, and validation benchmarks: Gompertz mortality, GBM pricing, Solvency II, IFRS 17. Filterable by keyword.',
    icon: '⊟',
    meta: 'Filterable',
  },
]

export default function ClaudeWorkflowIndex() {
  return (
    <DocsLayout title="How We Work with Claude">
      <h1>How We Work with Claude</h1>

      <p>
        This section documents the AI-assisted development workflow behind the marketplace —
        not as a retrospective, but as a live system. Every template, decision, and
        domain reference is used in active Claude Code sessions.
      </p>

      <p>
        The files in <code>.claude/</code> at the project root are loaded automatically
        by Claude Code at the start of each session. <code>CLAUDE.md</code> sets the
        hard constraints; the prompts and ADRs fill in the context.
      </p>

      <h2>The three-layer system</h2>

      <p>
        Each Claude session draws from three layers of context:
      </p>

      <ol>
        <li>
          <strong>CLAUDE.md</strong> — the law. Rules that must never be broken:
          async-only routes, inline styles, Pydantic v2 syntax, no Tailwind classes.
        </li>
        <li>
          <strong>Prompt templates</strong> — the procedure. Structured task specs that
          constrain scope, list files to read, and define what "done" looks like.
        </li>
        <li>
          <strong>ADRs</strong> — the memory. Why we made the decisions we made, so
          Claude doesn't re-litigate settled questions or repeat past mistakes.
        </li>
      </ol>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, margin: '32px 0 8px' }}>
        {CARDS.map(card => (
          <Link key={card.href} href={card.href} style={{ textDecoration: 'none' }}>
            <div
              style={{
                padding: '20px 22px',
                background: '#14171c',
                border: '1px solid #232932',
                borderRadius: 12,
                display: 'flex', flexDirection: 'column', gap: 10,
                transition: 'border-color 0.13s, transform 0.12s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#33404f'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#232932'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 20, color: '#4f8cff', opacity: 0.7 }}>{card.icon}</span>
                <span style={{ fontSize: 10.5, color: '#3a4150', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{card.meta}</span>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#f1f3f6', marginBottom: 6, letterSpacing: '-0.01em' }}>{card.title}</div>
                <div style={{ fontSize: 13, color: '#8a909c', lineHeight: 1.6 }}>{card.description}</div>
              </div>
              <div style={{ fontSize: 12.5, color: '#4f8cff', marginTop: 'auto' }}>Read more →</div>
            </div>
          </Link>
        ))}
      </div>
    </DocsLayout>
  )
}
