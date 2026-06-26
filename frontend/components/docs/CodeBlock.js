import { useState } from 'react'

export default function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const text = typeof children === 'string' ? children : String(children ?? '')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ position: 'relative', margin: '16px 0 24px' }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 16px',
          background: '#14171c',
          border: '1px solid #1b2027',
          borderBottom: 'none',
          borderRadius: '10px 10px 0 0',
        }}
      >
        <span
          style={{
            fontSize: 11, fontWeight: 700, color: '#454c57',
            textTransform: 'uppercase', letterSpacing: '0.07em',
          }}
        >
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          style={{
            background: 'none',
            border: '1px solid #2f3947',
            borderRadius: 5,
            color: copied ? '#34d399' : '#6b727e',
            cursor: 'pointer',
            fontSize: 11.5,
            padding: '3px 10px',
            fontFamily: 'inherit',
            transition: 'color 0.15s, border-color 0.15s',
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: '18px 22px',
          background: '#0e1117',
          border: '1px solid #1b2027',
          borderRadius: '0 0 10px 10px',
          overflowX: 'auto',
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
          fontSize: 13,
          lineHeight: 1.65,
          color: '#abb2bf',
        }}
      >
        <code>{children}</code>
      </pre>
    </div>
  )
}
