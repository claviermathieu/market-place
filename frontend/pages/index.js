import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import AppCard from "../components/AppCard";
import AddAppModal from "../components/AddAppModal";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Quadrant accent colors (inline styles — no Tailwind)
const Q = {
  tools:     { accent: "#3B82F6", bg: "rgba(59,130,246,.035)"  },
  platform:  { accent: "#14B8A6", bg: "rgba(20,184,166,.035)"  },
  knowledge: { accent: "#A855F7", bg: "rgba(168,85,247,.035)"  },
  workspace: { accent: "#F59E0B", bg: "rgba(245,158,11,.035)"  },
};

// ─── Sub-components ────────────────────────────────────────────────

function Quadrant({ color, bg, label, children }) {
  return (
    <div
      style={{
        padding: "22px 22px 22px 20px",
        background: bg,
        borderTop: "1px solid #232932",
        borderRight: "1px solid #232932",
        borderBottom: "1px solid #232932",
        borderLeft: `3px solid ${color}`,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        minHeight: 280,
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderTopColor = "#2a3040";
        e.currentTarget.style.borderRightColor = "#2a3040";
        e.currentTarget.style.borderBottomColor = "#2a3040";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderTopColor = "#232932";
        e.currentTarget.style.borderRightColor = "#232932";
        e.currentTarget.style.borderBottomColor = "#232932";
      }}
    >
      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em", color, textTransform: "uppercase", opacity: 0.75, marginBottom: 18 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function QLink({ href, children, external }) {
  const style = {
    display: "block",
    padding: "5px 0",
    fontSize: 13.5,
    color: "#8a909c",
    textDecoration: "none",
    cursor: "pointer",
    transition: "color 0.12s",
  };
  const hover = (e, enter) => (e.currentTarget.style.color = enter ? "#d7dbe2" : "#8a909c");

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" style={style}
        onMouseEnter={(e) => hover(e, true)} onMouseLeave={(e) => hover(e, false)}>
        → {children}
      </a>
    );
  }
  return (
    <Link href={href} style={style}
      onMouseEnter={(e) => hover(e, true)} onMouseLeave={(e) => hover(e, false)}>
      → {children}
    </Link>
  );
}

function StatCell({ label, value, suffix = "" }) {
  return (
    <div>
      <div style={{ fontSize: 21, fontWeight: 700, color: "#f1f3f6", letterSpacing: "-0.025em", fontVariantNumeric: "tabular-nums" }}>
        {value === null ? "—" : `${value}${suffix}`}
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#3a4150", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 3 }}>
        {label}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: "1px solid #1b2027", margin: "14px 0" }} />;
}

// ─── Main page ─────────────────────────────────────────────────────

export default function Marketplace() {
  const [apps, setApps]         = useState([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [stats, setStats]       = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 860);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    fetch(`${API}/apps`)
      .then((r) => r.json())
      .then((data) => { setApps(data); setAppsLoading(false); })
      .catch(() => setAppsLoading(false));

    fetch(`${API}/monitor/stats`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  function handleAppAdded(app) {
    setApps((prev) => [...prev, { ...app, isNew: true }]);
  }

  const visibleApps = apps.slice(0, 4);
  const extraApps   = apps.length - 4;

  return (
    <div style={{ minHeight: "100vh", background: "#0b0d10", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Hero strip */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontSize: 17 }}>⚡</span>
            <h1 style={{ margin: 0, fontSize: 19, fontWeight: 600, color: "#f4f6f9", letterSpacing: "-0.025em" }}>
              Actuarial Marketplace
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#4a5260" }}>
            Your personal computation platform — built with Claude
          </p>
        </div>

        {/* 4-quadrant grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 16,
        }}>

          {/* ── TOOLS ─────────────────────────────────────────── */}
          <Quadrant color={Q.tools.accent} bg={Q.tools.bg} label="🧮  Tools — Actuarial Models">
            {appsLoading ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", border: "2px solid #1b2027", borderTopColor: Q.tools.accent }} className="animate-spin-custom" />
              </div>
            ) : apps.length === 0 ? (
              <p style={{ color: "#3a4150", fontSize: 13.5, margin: 0 }}>No apps yet. Add one below.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12, flex: 1 }}>
                {visibleApps.map((app) => (
                  <AppCard key={app.id} app={app} />
                ))}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, gap: 12 }}>
              <button
                onClick={() => setModalOpen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 15px",
                  border: `1px solid ${Q.tools.accent}33`,
                  borderRadius: 8,
                  background: `${Q.tools.accent}0d`,
                  color: Q.tools.accent,
                  fontFamily: "inherit",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.13s, border-color 0.13s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = `${Q.tools.accent}1a`)}
                onMouseLeave={(e) => (e.currentTarget.style.background = `${Q.tools.accent}0d`)}
              >
                + Add App
              </button>
              {extraApps > 0 && (
                <span style={{ fontSize: 12.5, color: "#454c57" }}>
                  +{extraApps} more apps
                </span>
              )}
            </div>
          </Quadrant>

          {/* ── PLATFORM ──────────────────────────────────────── */}
          <Quadrant color={Q.platform.accent} bg={Q.platform.bg} label="📊  Platform — Compute Stats">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px", marginBottom: 4 }}>
              <StatCell label="Total runs"    value={stats?.total_runs           ?? null} />
              <StatCell label="Success rate"  value={stats?.success_rate         ?? null} suffix="%" />
              <StatCell label="Avg duration"  value={stats?.avg_duration_seconds ?? null} suffix="s" />
              <StatCell label="Runs today"    value={stats?.runs_today           ?? null} />
            </div>

            <Divider />

            <div style={{ display: "flex", flexDirection: "column" }}>
              <QLink href="/monitor">Monitor dashboard</QLink>
              <QLink href="/history">Run history</QLink>
              {stats?.per_app?.map((a) => (
                <div key={a.app_name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0" }}>
                  <span style={{ fontSize: 13, color: "#6b727e" }}>{a.app_name}</span>
                  <span style={{ fontSize: 12, color: "#3a4150", fontVariantNumeric: "tabular-nums" }}>
                    {a.total} runs · {a.success_rate}% ok
                  </span>
                </div>
              ))}
            </div>
          </Quadrant>

          {/* ── KNOWLEDGE ─────────────────────────────────────── */}
          <Quadrant color={Q.knowledge.accent} bg={Q.knowledge.bg} label="📚  Knowledge — Docs & Guides">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 20px" }}>
              <QLink href="/docs/architecture">Architecture</QLink>
              <QLink href="/docs/app-contract">App Contract</QLink>
              <QLink href="/docs/build-log">Build Logs</QLink>
              <QLink href="/docs/ai-guide">AI Guide</QLink>
              <QLink href="/docs/ai-guide/prompt-patterns">Prompt Patterns</QLink>
              <QLink href="/docs/ai-guide/mental-model">Mental Model</QLink>
              <QLink href="/docs/claude-workflow/prompt-library">Prompt Library</QLink>
              <QLink href="/docs/claude-workflow/decisions">ADR Log</QLink>
            </div>

            <Divider />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12.5, color: "#3a4150" }}>Full documentation</span>
              <QLink href="/docs">Browse all →</QLink>
            </div>
          </Quadrant>

          {/* ── WORKSPACE ─────────────────────────────────────── */}
          <Quadrant color={Q.workspace.accent} bg={Q.workspace.bg} label="🛠  Workspace — Developer Tools">
            <QLink href="/explorer">Data Explorer</QLink>
            <QLink href="/explorer">SQL Editor</QLink>
            <QLink href="/docs/claude-workflow">Claude Workflow</QLink>
            <QLink href="/docs/claude-workflow/domain-glossary">Domain Glossary</QLink>

            <Divider />

            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#3a4150", textTransform: "uppercase", marginBottom: 8 }}>
              Project
            </div>
            <QLink href="https://github.com/claviermathieu/market-place/tree/main/.claude" external>
              .claude folder
            </QLink>
            <QLink href="https://github.com/claviermathieu/market-place" external>
              README on GitHub
            </QLink>

            <Divider />

            <div style={{ marginTop: "auto" }}>
              <div style={{ fontSize: 11.5, color: "#3a4150", lineHeight: 1.6 }}>
                Stack: Next.js 14 · FastAPI · PostgreSQL 16 · Docker
              </div>
            </div>
          </Quadrant>

        </div>
      </div>

      {modalOpen && (
        <AddAppModal onClose={() => setModalOpen(false)} onAdded={handleAppAdded} />
      )}
    </div>
  );
}
