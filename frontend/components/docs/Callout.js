const VARIANTS = {
  info: {
    bg: 'rgba(79,140,255,.07)',
    border: '#243555',
    icon: 'ℹ',
    iconColor: '#4f8cff',
    label: 'Note',
    labelColor: '#4f8cff',
  },
  warning: {
    bg: 'rgba(245,158,11,.07)',
    border: '#4a3510',
    icon: '⚠',
    iconColor: '#f59e0b',
    label: 'Warning',
    labelColor: '#fbbf24',
  },
  tip: {
    bg: 'rgba(16,185,129,.07)',
    border: '#0f3d28',
    icon: '✦',
    iconColor: '#10b981',
    label: 'Tip',
    labelColor: '#34d399',
  },
}

export default function Callout({ type = 'info', children }) {
  const v = VARIANTS[type] ?? VARIANTS.info

  return (
    <div
      style={{
        display: 'flex', gap: 14,
        padding: '14px 18px',
        background: v.bg,
        border: `1px solid ${v.border}`,
        borderRadius: 10,
        margin: '20px 0',
      }}
    >
      <span style={{ fontSize: 15, color: v.iconColor, flexShrink: 0, marginTop: 2 }}>
        {v.icon}
      </span>
      <div style={{ flex: 1 }}>
        <span
          style={{
            display: 'block', marginBottom: 5,
            fontSize: 12, fontWeight: 700,
            color: v.labelColor,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}
        >
          {v.label}
        </span>
        <div style={{ fontSize: 14, lineHeight: 1.7, color: '#9aa0ab' }}>{children}</div>
      </div>
    </div>
  )
}
