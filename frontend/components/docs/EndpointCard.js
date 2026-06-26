import CodeBlock from './CodeBlock'

const METHOD_STYLE = {
  GET:       { bg: 'rgba(52,211,153,.12)',  color: '#34d399', border: 'rgba(52,211,153,.3)'  },
  POST:      { bg: 'rgba(79,140,255,.12)',  color: '#4f8cff', border: 'rgba(79,140,255,.3)'  },
  PUT:       { bg: 'rgba(245,158,11,.12)',  color: '#f59e0b', border: 'rgba(245,158,11,.3)'  },
  PATCH:     { bg: 'rgba(245,158,11,.12)',  color: '#f59e0b', border: 'rgba(245,158,11,.3)'  },
  DELETE:    { bg: 'rgba(248,113,113,.12)', color: '#f87171', border: 'rgba(248,113,113,.3)' },
  WEBSOCKET: { bg: 'rgba(167,139,250,.12)', color: '#a78bfa', border: 'rgba(167,139,250,.3)' },
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 11, fontWeight: 700, color: '#454c57',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  )
}

export default function EndpointCard({ method, path, description, requestBody, responseBody, curlExample }) {
  const m = METHOD_STYLE[method] ?? METHOD_STYLE.GET

  return (
    <div
      style={{
        border: '1px solid #232932', borderRadius: 12,
        overflow: 'hidden', margin: '28px 0',
        background: '#0e1117',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 20px',
          background: '#14171c', borderBottom: '1px solid #1b2027',
          display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            padding: '3px 11px', borderRadius: 6,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
            background: m.bg, color: m.color, border: `1px solid ${m.border}`,
            flexShrink: 0,
          }}
        >
          {method}
        </span>
        <code
          style={{
            fontSize: 14, fontWeight: 600, color: '#e6e8ec',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            letterSpacing: '-0.01em',
          }}
        >
          {path}
        </code>
        {description && (
          <span style={{ fontSize: 13, color: '#6b727e', marginLeft: 'auto' }}>
            {description}
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '20px 20px 4px' }}>
        {requestBody && (
          <div style={{ marginBottom: 4 }}>
            <SectionLabel>Request Body</SectionLabel>
            <CodeBlock language="json">{requestBody}</CodeBlock>
          </div>
        )}
        {responseBody && (
          <div style={{ marginBottom: 4 }}>
            <SectionLabel>Response</SectionLabel>
            <CodeBlock language="json">{responseBody}</CodeBlock>
          </div>
        )}
        {curlExample && (
          <div style={{ marginBottom: 4 }}>
            <SectionLabel>Example</SectionLabel>
            <CodeBlock language="bash">{curlExample}</CodeBlock>
          </div>
        )}
      </div>
    </div>
  )
}
