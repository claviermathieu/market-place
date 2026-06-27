import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Navbar from "../components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function formatDay(dayStr) {
  const d = new Date(dayStr + "T00:00:00");
  const mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
  return `${mo} ${d.getDate()}`;
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
  return `${mo} ${d.getDate()}, ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

function formatElapsed(startedAt) {
  const s = Math.floor((Date.now() - new Date(startedAt)) / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function useCountUp(target, duration = 900, decimals = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === null || target === undefined) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(parseFloat((progress * target).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(step);
      else setVal(target);
    };
    requestAnimationFrame(step);
  }, [target, duration, decimals]);
  return val;
}

function StatCard({ label, value, suffix = "", decimals = 0, accent = false }) {
  const animated = useCountUp(value ?? 0, 900, decimals);
  return (
    <div
      style={{
        flex: "1 1 160px",
        padding: "20px 22px",
        background: "#14171c",
        border: `1px solid ${accent ? "#243555" : "#232932"}`,
        borderRadius: 14,
        background: accent ? "rgba(79,140,255,.05)" : "#14171c",
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#454c57", textTransform: "uppercase", marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent ? "#4f8cff" : "#f1f3f6", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
        {animated}{suffix}
      </div>
    </div>
  );
}

export default function MonitorPage() {
  const [stats, setStats]       = useState(null);
  const [history, setHistory]   = useState([]);
  const [liveJobs, setLiveJobs] = useState([]);
  const [tick, setTick]         = useState(0);

  const loadStats = useCallback(() => {
    fetch(`${API}/monitor/stats`).then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  const loadHistory = useCallback(() => {
    fetch(`${API}/monitor/history`).then(r => r.json()).then(d => {
      const raw = d.history || [];
      // Fill missing days with 0
      setHistory(raw.map(r => ({ ...r, day: formatDay(r.day), count: r.count })));
    }).catch(() => {});
  }, []);

  const loadLive = useCallback(() => {
    fetch(`${API}/monitor/live`).then(r => r.json()).then(d => setLiveJobs(d.live || [])).catch(() => {});
  }, []);

  // Initial load
  useEffect(() => {
    loadStats();
    loadHistory();
    loadLive();
  }, []);

  // Live jobs poll every 3s
  useEffect(() => {
    const interval = setInterval(loadLive, 3000);
    return () => clearInterval(interval);
  }, []);

  // Tick every second for elapsed time display
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head><title>Monitor — MCLAVIER</title></Head>
      <div style={{ minHeight: "100vh", background: "#0b0d10" }}>
        <Navbar />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>

          {/* Page title */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: "#f4f6f9", letterSpacing: "-0.02em" }}>
              Monitor
            </h1>
            <p style={{ margin: "5px 0 0", fontSize: 13.5, color: "#6b727e" }}>
              Real-time overview of all job runs across the marketplace.
            </p>
          </div>

          {/* Stat cards */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
            <StatCard label="Total Runs"    value={stats?.total_runs}           decimals={0} />
            <StatCard label="Success Rate"  value={stats?.success_rate}         decimals={1} suffix="%" accent />
            <StatCard label="Avg Duration"  value={stats?.avg_duration_seconds} decimals={1} suffix="s" />
            <StatCard label="Runs Today"    value={stats?.runs_today}           decimals={0} />
          </div>

          {/* Charts row */}
          <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            {/* Area chart */}
            <div style={{ flex: "3 1 400px", background: "#14171c", border: "1px solid #232932", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#454c57", textTransform: "uppercase", marginBottom: 16 }}>
                Runs per Day — Last 30 Days
              </div>
              {history.length === 0 ? (
                <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "#3a4150", fontSize: 13 }}>
                  No data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={history} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="monGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#4f8cff" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#4f8cff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fill: "#5b626d", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: "#5b626d", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: "#1a1e24", border: "1px solid #232932", borderRadius: 8, color: "#e6e8ec", fontSize: 12 }}
                      labelStyle={{ color: "#9aa0ab" }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#4f8cff" strokeWidth={2} fill="url(#monGrad)" dot={false} activeDot={{ r: 4, fill: "#4f8cff" }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Live jobs */}
            <div style={{ flex: "1 1 240px", background: "#14171c", border: "1px solid #232932", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#454c57", textTransform: "uppercase" }}>
                  Live Jobs
                </div>
                {liveJobs.length > 0 && (
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 0 2px rgba(245,158,11,.25)", flexShrink: 0 }} />
                )}
              </div>

              {liveJobs.length === 0 ? (
                <div style={{ paddingTop: 24, textAlign: "center", color: "#3a4150", fontSize: 13 }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>✓</div>
                  All quiet
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {liveJobs.map(job => (
                    <div key={job.run_id} style={{ padding: "10px 12px", background: "#1a1e24", border: "1px solid #262c35", borderRadius: 9 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#4f8cff" }}>#{job.run_id}</span>
                        <span style={{ fontSize: 11, color: "#f59e0b", fontVariantNumeric: "tabular-nums" }}>
                          {formatElapsed(job.started_at)}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#8a909c" }}>{job.app_name}</div>
                      <div style={{ marginTop: 5 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
                          padding: "2px 7px", borderRadius: 999,
                          color: job.status === "RUNNING" ? "#f59e0b" : "#6b727e",
                          background: job.status === "RUNNING" ? "rgba(245,158,11,.1)" : "rgba(107,114,126,.1)",
                        }}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Per-app breakdown */}
          {stats?.per_app && stats.per_app.length > 0 && (
            <div style={{ border: "1px solid #232932", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", background: "#1a1e24", borderBottom: "1px solid #232932" }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#454c57", textTransform: "uppercase" }}>
                  Per-App Breakdown
                </span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                <thead>
                  <tr>
                    {["App", "Total", "Success Rate", "Avg Duration", "Last Run"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "11px 20px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#5b626d", background: "#14171c", borderBottom: "1px solid #1c2128" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.per_app.map((app, i) => (
                    <tr key={app.app_name} style={{ background: i % 2 ? "rgba(255,255,255,.018)" : "transparent" }}>
                      <td style={{ padding: "12px 20px", color: "#e6e8ec", fontWeight: 500, borderBottom: "1px solid #1c2128" }}>{app.app_name}</td>
                      <td style={{ padding: "12px 20px", color: "#9aa0ab", borderBottom: "1px solid #1c2128", fontVariantNumeric: "tabular-nums" }}>{app.total}</td>
                      <td style={{ padding: "12px 20px", borderBottom: "1px solid #1c2128" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ height: 4, width: 80, background: "#1b1f26", borderRadius: 9, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${app.success_rate}%`, background: app.success_rate > 90 ? "#34d399" : app.success_rate > 70 ? "#f59e0b" : "#f87171", borderRadius: 9 }} />
                          </div>
                          <span style={{ color: app.success_rate > 90 ? "#34d399" : app.success_rate > 70 ? "#f59e0b" : "#f87171", fontVariantNumeric: "tabular-nums", fontSize: 13 }}>
                            {app.success_rate}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 20px", color: "#9aa0ab", borderBottom: "1px solid #1c2128", fontVariantNumeric: "tabular-nums" }}>
                        {app.avg_duration > 0 ? `${app.avg_duration}s` : "—"}
                      </td>
                      <td style={{ padding: "12px 20px", color: "#6b727e", borderBottom: "1px solid #1c2128", fontSize: 13 }}>
                        {formatDate(app.last_run)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
