import { useState } from 'react'

function JsonValue({ value }) {
  if (value === null) return <span style={{ color: '#5b626d', fontStyle: 'italic' }}>null</span>
  if (typeof value === 'boolean') return <span style={{ color: '#f59e0b' }}>{String(value)}</span>
  if (typeof value === 'number') return <span style={{ color: '#f59e0b' }}>{value}</span>
  if (typeof value === 'string') return <span style={{ color: '#34d399' }}>"{value}"</span>
  if (typeof value === 'object') return <JsonTree value={value} />
  return <span style={{ color: '#c8cdd4' }}>{String(value)}</span>
}

export default function JsonTree({ value }) {
  const [open, setOpen] = useState(false)

  if (value === null || typeof value !== 'object') {
    return <JsonValue value={value} />
  }

  const isArray = Array.isArray(value)
  const entries = isArray ? value.map((v, i) => [i, v]) : Object.entries(value)
  const openBracket = isArray ? '[' : '{'
  const closeBracket = isArray ? ']' : '}'
  const preview = isArray
    ? `[${value.length} item${value.length !== 1 ? 's' : ''}]`
    : `{${Object.keys(value).slice(0, 2).join(', ')}${Object.keys(value).length > 2 ? ' …' : ''}}`

  if (!open) {
    return (
      <span
        onClick={(e) => { e.stopPropagation(); setOpen(true) }}
        style={{
          color: '#4f8cff',
          cursor: 'pointer',
          fontSize: 11.5,
          fontFamily: 'monospace',
          padding: '1px 5px',
          borderRadius: 4,
          background: 'rgba(79,140,255,.1)',
          userSelect: 'none',
        }}
        title="Click to expand"
      >
        {preview}
      </span>
    )
  }

  return (
    <span style={{ fontFamily: 'monospace', fontSize: 11.5, lineHeight: 1.6 }}>
      <span
        onClick={(e) => { e.stopPropagation(); setOpen(false) }}
        style={{ color: '#6b727e', cursor: 'pointer', userSelect: 'none' }}
        title="Click to collapse"
      >
        {openBracket}
      </span>
      <span style={{ paddingLeft: 10, display: 'inline-block' }}>
        {entries.map(([k, v], i) => (
          <span key={k} style={{ display: 'block' }}>
            <span style={{ color: isArray ? '#f59e0b' : '#4f8cff' }}>
              {isArray ? k : `"${k}"`}
            </span>
            <span style={{ color: '#454c57' }}>: </span>
            <JsonValue value={v} />
            {i < entries.length - 1 && <span style={{ color: '#454c57' }}>,</span>}
          </span>
        ))}
      </span>
      <span style={{ color: '#6b727e' }}>{closeBracket}</span>
    </span>
  )
}
