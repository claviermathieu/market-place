import { useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ResultPanel({ jobStatus, result, runId }) {
  const chartRef = useRef(null);
  const showEmpty   = jobStatus === "IDLE";
  const showSpinner = jobStatus === "PENDING" || jobStatus === "RUNNING";
  const showResults = jobStatus === "SUCCESS" && result;
  const showFailed  = jobStatus === "FAILED";

  function downloadCsv() {
    window.open(`${API}/runs/${runId}/export/csv`, "_blank");
  }

  function downloadPdf() {
    window.open(`${API}/runs/${runId}/export/pdf`, "_blank");
  }

  async function downloadPng() {
    if (!chartRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(chartRef.current, {
      backgroundColor: "#101318",
      scale: 2,
    });
    const link = document.createElement("a");
    link.download = `chart-run-${runId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div
      style={{
        flex: "2 1 440px",
        minWidth: 300,
        background: "#14171c",
        border: "1px solid #232932",
        borderRadius: 14,
        padding: 22,
        minHeight: 440,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
        <h3
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            color: "#7a818d",
            flex: 1,
          }}
        >
          Results
        </h3>

        {showResults && runId && (
          <div style={{ display: "flex", gap: 6 }}>
            {[
              ["↓ CSV", downloadCsv],
              ["↓ PDF", downloadPdf],
              ["↓ PNG", downloadPng],
            ].map(([label, fn]) => (
              <button
                key={label}
                onClick={fn}
                style={{
                  padding: "4px 11px",
                  border: "1px solid #2f3947",
                  borderRadius: 7,
                  background: "transparent",
                  color: "#8a909c",
                  fontFamily: "inherit",
                  fontSize: 12,
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
                  e.currentTarget.style.color = "#8a909c";
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {showEmpty && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            color: "#5b626d",
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              border: "1.5px dashed #2f3744",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              color: "#3f4754",
            }}
          >
            ∿
          </div>
          <p style={{ margin: 0, fontSize: 13.5 }}>
            Adjust the inputs and run to generate results.
          </p>
        </div>
      )}

      {showSpinner && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
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
          <p
            style={{ margin: 0, fontSize: 13.5, color: "#9aa0ab" }}
            className="animate-pulse-custom"
          >
            Running simulation…
          </p>
        </div>
      )}

      {showFailed && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
          }}
        >
          <p style={{ margin: 0, fontSize: 13.5, color: "#f87171" }}>
            Simulation failed. Please try again.
          </p>
        </div>
      )}

      {showResults && (
        <div className="animate-fadeup">
          <div
            ref={chartRef}
            style={{
              border: "1px solid #232932",
              borderRadius: 11,
              padding: "8px 8px 4px",
              background: "#101318",
              marginBottom: 18,
            }}
          >
            <ResultChart series={result.series} />
          </div>

          {result.summary && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 16,
              }}
            >
              {Object.entries(result.summary).map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    padding: "8px 14px",
                    background: "#1a1e24",
                    border: "1px solid #232932",
                    borderRadius: 9,
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: "#6b727e", textTransform: "capitalize" }}>
                    {k.replace(/_/g, " ")}
                  </span>
                  <span
                    style={{
                      display: "block",
                      color: "#e6e8ec",
                      fontWeight: 600,
                      fontSize: 13,
                      marginTop: 2,
                    }}
                  >
                    {String(v)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              overflow: "hidden",
              border: "1px solid #232932",
              borderRadius: 11,
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {result.columns.map((c) => (
                    <th
                      key={c}
                      style={{
                        textAlign: "left",
                        padding: "10px 14px",
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        color: "#7a818d",
                        background: "#1a1e24",
                        borderBottom: "1px solid #232932",
                      }}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.table.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((cell, j) => (
                      <td
                        key={j}
                        style={{
                          padding: "9px 14px",
                          color: "#c4c9d2",
                          borderBottom: "1px solid #1c2128",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultChart({ series }) {
  if (!series || series.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="colorAccent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f8cff" stopOpacity={0.28} />
            <stop offset="95%" stopColor="#4f8cff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="x"
          tick={{ fill: "#6b7280", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#6b7280", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          contentStyle={{
            background: "#1a1e24",
            border: "1px solid #232932",
            borderRadius: 8,
            color: "#e6e8ec",
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="y"
          stroke="#4f8cff"
          strokeWidth={2.5}
          fill="url(#colorAccent)"
          dot={false}
          activeDot={{ r: 4, fill: "#4f8cff", stroke: "#101318", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
