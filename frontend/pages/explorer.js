import { useState, useEffect, useCallback, useRef } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import JsonTree from '../components/JsonTree'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const PER_PAGE = 50

function formatCell(value) {
  if (value === null || value === undefined) {
    return <span style={{ color: '#3a4150', fontStyle: 'italic', fontSize: 11.5 }}>NULL</span>
  }
  if (typeof value === 'object') {
    return <JsonTree value={value} />
  }
  const str = String(value)
  // Detect ISO timestamps
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
    const d = new Date(str)
    const mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]
    const pad = n => String(n).padStart(2, '0')
    return (
      <span style={{ color: '#8a909c', fontVariantNumeric: 'tabular-nums', fontSize: 12 }}>
        {mo} {d.getDate()}, {d.getFullYear()} {pad(d.getHours())}:{pad(d.getMinutes())}:{pad(d.getSeconds())}
      </span>
    )
  }
  return <span style={{ color: '#c8cdd4' }}>{str}</span>
}

function SchemaCard({ schema }) {
  if (!schema.length) return null
  return (
    <div style={{ border: '1px solid #232932', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{
        padding: '11px 16px',
        background: '#1a1e24',
        borderBottom: '1px solid #232932',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#454c57', textTransform: 'uppercase' }}>
          Schema Inspector
        </span>
        <span style={{ fontSize: 11, color: '#3a4150' }}>({schema.length} columns)</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr>
              {['Column', 'Type', 'Nullable', 'PK'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '9px 14px',
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: '#5b626d', background: '#14171c', borderBottom: '1px solid #1c2128',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schema.map((col, i) => (
              <tr key={col.name} style={{ background: i % 2 ? 'rgba(255,255,255,.018)' : 'transparent' }}>
                <td style={{ padding: '8px 14px', borderBottom: '1px solid #1c2128' }}>
                  <span style={{ color: '#4f8cff', fontFamily: 'monospace', fontSize: 12 }}>{col.name}</span>
                  {col.primary_key && (
                    <span style={{
                      marginLeft: 6, fontSize: 9.5, padding: '1px 5px', borderRadius: 4,
                      background: 'rgba(245,158,11,.12)', color: '#f59e0b', fontWeight: 700,
                    }}>PK</span>
                  )}
                </td>
                <td style={{ padding: '8px 14px', borderBottom: '1px solid #1c2128' }}>
                  <span style={{ color: '#8a909c', fontFamily: 'monospace', fontSize: 12 }}>{col.type}</span>
                </td>
                <td style={{ padding: '8px 14px', borderBottom: '1px solid #1c2128' }}>
                  <span style={{ color: col.nullable ? '#34d399' : '#5b626d', fontSize: 12 }}>
                    {col.nullable ? 'YES' : 'NO'}
                  </span>
                </td>
                <td style={{ padding: '8px 14px', borderBottom: '1px solid #1c2128' }}>
                  {col.primary_key ? (
                    <span style={{ color: '#f59e0b', fontSize: 13 }}>✓</span>
                  ) : (
                    <span style={{ color: '#2a2f38', fontSize: 13 }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DataTable({ columns, rows, schema, sortConfig, onSort }) {
  const jsonbCols = new Set(
    (schema || []).filter(c => c.type === 'jsonb' || c.type === 'json').map(c => c.name)
  )

  const sorted = sortConfig.col
    ? [...rows].sort((a, b) => {
        const av = a[sortConfig.col]
        const bv = b[sortConfig.col]
        if (av === null || av === undefined) return 1
        if (bv === null || bv === undefined) return -1
        if (typeof av === 'string') {
          return sortConfig.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
        }
        return sortConfig.dir === 'asc' ? (av > bv ? 1 : -1) : (bv > av ? 1 : -1)
      })
    : rows

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead>
          <tr>
            {columns.map(col => {
              const active = sortConfig.col === col
              return (
                <th
                  key={col}
                  onClick={() => onSort(col)}
                  style={{
                    textAlign: 'left', padding: '9px 14px',
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: active ? '#4f8cff' : '#5b626d',
                    background: '#14171c', borderBottom: '1px solid #1c2128',
                    cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
                  }}
                >
                  {col}
                  {active && <span style={{ marginLeft: 4, fontSize: 9 }}>{sortConfig.dir === 'asc' ? '▲' : '▼'}</span>}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '32px 14px', textAlign: 'center', color: '#3a4150', fontSize: 13 }}>
                No rows found
              </td>
            </tr>
          ) : (
            sorted.map((row, i) => (
              <tr key={i} style={{ background: i % 2 ? 'rgba(255,255,255,.018)' : 'transparent' }}>
                {columns.map(col => {
                  const v = row[col]
                  const isJsonb = jsonbCols.has(col) || (v !== null && typeof v === 'object')
                  return (
                    <td key={col} style={{
                      padding: '9px 14px',
                      borderBottom: '1px solid #1c2128',
                      verticalAlign: 'top',
                      maxWidth: isJsonb ? 240 : 320,
                    }}>
                      {formatCell(v)}
                    </td>
                  )
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function Pagination({ page, total, perPage, onPage }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  if (totalPages <= 1 && total <= perPage) return null
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', borderTop: '1px solid #1c2128',
      background: '#14171c',
    }}>
      <button
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        style={{
          padding: '5px 12px', border: '1px solid #2a2f38', borderRadius: 7,
          background: 'transparent', color: page <= 1 ? '#2a2f38' : '#9aa0ab',
          fontFamily: 'inherit', fontSize: 12, cursor: page <= 1 ? 'default' : 'pointer',
        }}
      >
        ← Prev
      </button>
      <span style={{ fontSize: 12, color: '#5b626d', flex: 1, textAlign: 'center' }}>
        Page <strong style={{ color: '#9aa0ab' }}>{page}</strong> of {totalPages}
        <span style={{ marginLeft: 8, color: '#3a4150' }}>({total.toLocaleString()} rows)</span>
      </span>
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
        style={{
          padding: '5px 12px', border: '1px solid #2a2f38', borderRadius: 7,
          background: 'transparent', color: page >= totalPages ? '#2a2f38' : '#9aa0ab',
          fontFamily: 'inherit', fontSize: 12, cursor: page >= totalPages ? 'default' : 'pointer',
        }}
      >
        Next →
      </button>
    </div>
  )
}

export default function ExplorerPage() {
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState(null)
  const [schema, setSchema] = useState([])
  const [browseData, setBrowseData] = useState({ columns: [], rows: [], total: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [sql, setSql] = useState('')
  const [queryResult, setQueryResult] = useState(null)
  const [queryError, setQueryError] = useState(null)
  const [queryLoading, setQueryLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState({ col: null, dir: 'asc' })
  const [displayMode, setDisplayMode] = useState('browse')
  const historyRef = useRef(null)

  useEffect(() => {
    fetch(`${API}/explorer/tables`)
      .then(r => r.json())
      .then(d => setTables(d.tables || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    function onClickOutside(e) {
      if (historyRef.current && !historyRef.current.contains(e.target)) {
        setHistoryOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const loadPage = useCallback(async (tableName, pg) => {
    setLoading(true)
    try {
      const offset = (pg - 1) * PER_PAGE
      const res = await fetch(`${API}/explorer/tables/${tableName}/rows?limit=${PER_PAGE}&offset=${offset}`)
      const d = await res.json()
      setBrowseData({ columns: d.columns || [], rows: d.rows || [], total: d.total || 0 })
      setPage(pg)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  const selectTable = useCallback(async (tableName) => {
    setSelectedTable(tableName)
    setQueryResult(null)
    setQueryError(null)
    setDisplayMode('browse')
    setSortConfig({ col: null, dir: 'asc' })
    setSql(`SELECT * FROM ${tableName} LIMIT 50`)
    setLoading(true)
    try {
      const [schemaRes, rowsRes] = await Promise.all([
        fetch(`${API}/explorer/tables/${tableName}/schema`).then(r => r.json()),
        fetch(`${API}/explorer/tables/${tableName}/rows?limit=${PER_PAGE}&offset=0`).then(r => r.json()),
      ])
      setSchema(schemaRes.columns || [])
      setBrowseData({ columns: rowsRes.columns || [], rows: rowsRes.rows || [], total: rowsRes.total || 0 })
      setPage(1)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  const runQuery = useCallback(async () => {
    const trimmed = sql.trim()
    if (!trimmed) return
    setQueryLoading(true)
    setQueryError(null)
    setQueryResult(null)
    setHistory(prev => [trimmed, ...prev.filter(q => q !== trimmed)].slice(0, 10))

    try {
      const res = await fetch(`${API}/explorer/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: trimmed }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.detail || 'Query failed')
      setQueryResult(d)
      setDisplayMode('query')
      setSortConfig({ col: null, dir: 'asc' })
    } catch (e) {
      setQueryError(e.message)
    } finally {
      setQueryLoading(false)
    }
  }, [sql])

  const handleSort = (col) => {
    setSortConfig(prev =>
      prev.col === col
        ? { col, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { col, dir: 'asc' }
    )
  }

  const displayColumns = displayMode === 'query' ? (queryResult?.columns || []) : browseData.columns
  const displayRows = displayMode === 'query' ? (queryResult?.rows || []) : browseData.rows

  return (
    <>
      <Head><title>Explorer — MCLAVIER</title></Head>
      <div style={{ minHeight: '100vh', background: '#0b0d10', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 54px)' }}>

          {/* Sidebar */}
          <div style={{
            width: 200, flexShrink: 0,
            borderRight: '1px solid #1b2027',
            display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
          }}>
            <div style={{
              padding: '14px 16px 8px',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
              color: '#454c57', textTransform: 'uppercase',
              borderBottom: '1px solid #1b2027',
            }}>
              Tables
            </div>
            {tables.length === 0 ? (
              <div style={{ padding: '12px 16px', fontSize: 12.5, color: '#3a4150' }}>
                Loading…
              </div>
            ) : (
              tables.map(t => (
                <div
                  key={t}
                  onClick={() => selectTable(t)}
                  style={{
                    padding: '9px 16px',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontFamily: 'monospace',
                    color: selectedTable === t ? '#4f8cff' : '#8a909c',
                    background: selectedTable === t ? 'rgba(79,140,255,.08)' : 'transparent',
                    borderLeft: `2px solid ${selectedTable === t ? '#4f8cff' : 'transparent'}`,
                    transition: 'color 0.1s, background 0.1s',
                  }}
                  onMouseEnter={e => {
                    if (selectedTable !== t) e.currentTarget.style.background = 'rgba(255,255,255,.03)'
                  }}
                  onMouseLeave={e => {
                    if (selectedTable !== t) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {t}
                </div>
              ))
            )}
          </div>

          {/* Main panel */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

            {!selectedTable ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#3a4150', gap: 12 }}>
                <div style={{ fontSize: 32 }}>⬡</div>
                <p style={{ margin: 0, fontSize: 14, color: '#454c57' }}>Select a table to start exploring</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#f1f3f6', fontFamily: 'monospace' }}>
                    {selectedTable}
                  </span>
                  {displayMode === 'browse' && browseData.total > 0 && (
                    <span style={{ fontSize: 12, color: '#454c57', background: '#1b1f26', padding: '2px 8px', borderRadius: 6, border: '1px solid #232932' }}>
                      {browseData.total.toLocaleString()} rows
                    </span>
                  )}
                  {displayMode === 'query' && queryResult && (
                    <span style={{ fontSize: 12, color: '#34d399', background: 'rgba(52,211,153,.08)', padding: '2px 8px', borderRadius: 6, border: '1px solid #0f3d28' }}>
                      {queryResult.count} rows returned
                    </span>
                  )}
                  {loading && (
                    <span style={{ fontSize: 12, color: '#454c57' }}>Loading…</span>
                  )}
                </div>

                {/* Schema */}
                <SchemaCard schema={schema} />

                {/* Data table */}
                {!loading && displayColumns.length > 0 && (
                  <div style={{ border: '1px solid #232932', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{
                      padding: '11px 16px',
                      background: '#1a1e24',
                      borderBottom: '1px solid #232932',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#454c57', textTransform: 'uppercase' }}>
                        {displayMode === 'query' ? 'Query Result' : 'Data'}
                      </span>
                      {displayMode === 'query' && (
                        <button
                          onClick={() => setDisplayMode('browse')}
                          style={{
                            marginLeft: 'auto', fontSize: 11, padding: '2px 8px',
                            border: '1px solid #2a2f38', borderRadius: 5,
                            background: 'transparent', color: '#5b626d',
                            cursor: 'pointer', fontFamily: 'inherit',
                          }}
                        >
                          ← Back to table
                        </button>
                      )}
                    </div>
                    <DataTable
                      columns={displayColumns}
                      rows={displayRows}
                      schema={schema}
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                    {displayMode === 'browse' && (
                      <Pagination
                        page={page}
                        total={browseData.total}
                        perPage={PER_PAGE}
                        onPage={pg => loadPage(selectedTable, pg)}
                      />
                    )}
                  </div>
                )}

                {/* SQL Editor */}
                <div style={{ border: '1px solid #232932', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{
                    padding: '11px 16px',
                    background: '#1a1e24',
                    borderBottom: '1px solid #232932',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: '#454c57', textTransform: 'uppercase' }}>
                      SQL Editor
                    </span>
                    <span style={{ fontSize: 11, color: '#2a2f38', marginLeft: 'auto' }}>Ctrl+Enter to run</span>

                    {/* History dropdown */}
                    {history.length > 0 && (
                      <div style={{ position: 'relative' }} ref={historyRef}>
                        <button
                          onClick={() => setHistoryOpen(o => !o)}
                          style={{
                            padding: '3px 9px', border: '1px solid #2a2f38', borderRadius: 6,
                            background: historyOpen ? '#1b1f26' : 'transparent',
                            color: '#5b626d', fontFamily: 'inherit', fontSize: 11,
                            cursor: 'pointer',
                          }}
                        >
                          History ▾
                        </button>
                        {historyOpen && (
                          <div style={{
                            position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                            width: 340, background: '#14171c',
                            border: '1px solid #232932', borderRadius: 9,
                            zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,.5)',
                            overflow: 'hidden',
                          }}>
                            {history.map((q, i) => (
                              <div
                                key={i}
                                onClick={() => { setSql(q); setHistoryOpen(false) }}
                                style={{
                                  padding: '9px 14px',
                                  borderBottom: i < history.length - 1 ? '1px solid #1c2128' : 'none',
                                  cursor: 'pointer',
                                  fontSize: 11.5, color: '#8a909c',
                                  fontFamily: 'monospace',
                                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.04)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                {q}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <textarea
                    value={sql}
                    onChange={e => setSql(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault()
                        runQuery()
                      }
                    }}
                    spellCheck={false}
                    style={{
                      width: '100%',
                      minHeight: 100,
                      padding: '14px 16px',
                      background: '#0e1117',
                      border: 'none',
                      color: '#c8cdd4',
                      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace",
                      fontSize: 13,
                      lineHeight: 1.65,
                      resize: 'vertical',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />

                  <div style={{
                    padding: '10px 14px',
                    background: '#0e1117',
                    borderTop: '1px solid #1c2128',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <button
                      onClick={runQuery}
                      disabled={queryLoading || !sql.trim()}
                      style={{
                        padding: '7px 18px',
                        background: queryLoading || !sql.trim() ? '#1b2027' : '#4f8cff',
                        border: 'none', borderRadius: 8,
                        color: queryLoading || !sql.trim() ? '#3a4150' : '#fff',
                        fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                        cursor: queryLoading || !sql.trim() ? 'default' : 'pointer',
                        transition: 'background 0.15s',
                      }}
                    >
                      {queryLoading ? 'Running…' : 'Run Query'}
                    </button>
                    <span style={{ fontSize: 11, color: '#2a2f38' }}>SELECT only · max 500 rows</span>
                  </div>

                  {queryError && (
                    <div style={{
                      padding: '12px 16px',
                      background: 'rgba(248,113,113,.08)',
                      borderTop: '1px solid rgba(248,113,113,.2)',
                      color: '#f87171', fontSize: 12.5,
                      fontFamily: 'monospace',
                    }}>
                      {queryError}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
