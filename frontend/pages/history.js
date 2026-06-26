import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const STATUS_BADGE = {
  PENDING: { color: "#fbbf24", bg: "rgba(251,191,36,.14)" },
  RUNNING: { color: "#fbbf24", bg: "rgba(251,191,36,.14)" },
  SUCCESS: { color: "#34d399", bg: "rgba(52,211,153,.14)" },
  FAILED: { color: "#f87171", bg: "rgba(248,113,113,.14)" },
};

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
  const pad = (n) => String(n).padStart(2, "0");
  return `${mo} ${d.getDate()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDuration(started, finished) {
  if (!finished) return "—";
  const s = (new Date(finished) - new Date(started)) / 1000;
  return `${s.toFixed(1)}s`;
}

export default function History() {
  const router = useRouter();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/runs`)
      .then((r) => r.json())
      .then((data) => {
        setRuns(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0b0d10" }}>
      <Navbar />
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "38px 24px 90px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: 25,
            fontWeight: 600,
            letterSpacing: "-0.025em",
            color: "#f4f6f9",
          }}
        >
          History
        </h1>
        <p style={{ margin: "7px 0 26px", fontSize: 14, color: "#8a909c" }}>
          A log of every job run across your apps.
        </p>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "3px solid #262c35",
                borderTopColor: "#4f8cff",
              }}
              className="animate-spin-custom"
            />
          </div>
        ) : (
          <div
            style={{
              overflow: "hidden",
              border: "1px solid #232932",
              borderRadius: 14,
              background: "#14171c",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr>
                  {["App", "Status", "Started at", "Duration", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "13px 18px",
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        color: "#7a818d",
                        background: "#1a1e24",
                        borderBottom: "1px solid #232932",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {runs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: "40px 18px",
                        textAlign: "center",
                        color: "#5b626d",
                        fontSize: 13.5,
                      }}
                    >
                      No runs yet. Launch an app to get started.
                    </td>
                  </tr>
                ) : (
                  runs.map((run, i) => {
                    const badge = STATUS_BADGE[run.status] || STATUS_BADGE.PENDING;
                    return (
                      <tr
                        key={run.run_id}
                        style={{ background: i % 2 ? "rgba(255,255,255,.018)" : "transparent" }}
                      >
                        <td
                          style={{
                            padding: "13px 18px",
                            color: "#eceef2",
                            fontWeight: 500,
                            borderBottom: "1px solid #1c2128",
                          }}
                        >
                          {run.app_name}
                        </td>
                        <td
                          style={{ padding: "13px 18px", borderBottom: "1px solid #1c2128" }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "3px 10px",
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 600,
                              letterSpacing: "0.03em",
                              color: badge.color,
                              background: badge.bg,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: badge.color,
                              }}
                            />
                            {run.status}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "13px 18px",
                            color: "#9aa0ab",
                            borderBottom: "1px solid #1c2128",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {formatDate(run.started_at)}
                        </td>
                        <td
                          style={{
                            padding: "13px 18px",
                            color: "#9aa0ab",
                            borderBottom: "1px solid #1c2128",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {formatDuration(run.started_at, run.finished_at)}
                        </td>
                        <td
                          style={{
                            padding: "13px 18px",
                            textAlign: "right",
                            borderBottom: "1px solid #1c2128",
                          }}
                        >
                          <button
                            onClick={() => router.push(`/apps/${run.app_id || ""}`)}
                            style={{
                              padding: "6px 13px",
                              border: "1px solid #2f3947",
                              borderRadius: 8,
                              background: "transparent",
                              color: "#c4c9d2",
                              fontFamily: "inherit",
                              fontSize: 12.5,
                              fontWeight: 500,
                              cursor: "pointer",
                              transition: "border-color 0.15s, color 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "#4f8cff";
                              e.currentTarget.style.color = "#4f8cff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "#2f3947";
                              e.currentTarget.style.color = "#c4c9d2";
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
