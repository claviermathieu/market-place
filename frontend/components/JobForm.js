import { useState } from "react";

const STATUS_BADGE = {
  IDLE: { label: "IDLE", color: "#8a909c", bg: "rgba(138,144,156,.14)" },
  PENDING: { label: "PENDING", color: "#fbbf24", bg: "rgba(251,191,36,.14)" },
  RUNNING: { label: "RUNNING", color: "#fbbf24", bg: "rgba(251,191,36,.14)" },
  SUCCESS: { label: "SUCCESS", color: "#34d399", bg: "rgba(52,211,153,.14)" },
  FAILED: { label: "FAILED", color: "#f87171", bg: "rgba(248,113,113,.14)" },
};

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function JobForm({ app, onRun, jobStatus }) {
  const inputs = app.input_schema || {};
  const fields = Object.entries(inputs);

  const initial = {};
  fields.forEach(([key, f]) => {
    initial[key] = f.default ?? f.min ?? 0;
  });

  const [values, setValues] = useState(initial);
  const badge = STATUS_BADGE[jobStatus] || STATUS_BADGE.IDLE;
  const isRunning = jobStatus === "PENDING" || jobStatus === "RUNNING";

  function formatDisplay(key, f) {
    const v = values[key] ?? f.default ?? 0;
    return `${v}${f.unit || ""}`;
  }

  return (
    <div
      style={{
        flex: "1 1 310px",
        minWidth: 280,
        alignSelf: "flex-start",
        background: "#14171c",
        border: "1px solid #232932",
        borderRadius: 14,
        padding: 22,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              background: "rgba(79,140,255,.1)",
              color: "#4f8cff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {getInitials(app.name)}
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: "#f1f3f6",
              letterSpacing: "-0.01em",
            }}
          >
            {app.name}
          </h2>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: 999,
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.04em",
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
          {badge.label}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {fields.map(([key, f]) => (
          <div key={key}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 11,
              }}
            >
              <label style={{ fontSize: 13, fontWeight: 500, color: "#c4c9d2" }}>
                {f.label}
              </label>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#4f8cff",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatDisplay(key, f)}
              </span>
            </div>
            <input
              type="range"
              min={f.min ?? 0}
              max={f.max ?? 100}
              step={f.step ?? 1}
              value={values[key] ?? f.default ?? 0}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [key]: parseFloat(e.target.value) }))
              }
            />
          </div>
        ))}
      </div>

      <button
        onClick={() => !isRunning && onRun(values)}
        disabled={isRunning}
        style={{
          marginTop: 24,
          width: "100%",
          padding: 11,
          border: "none",
          borderRadius: 9,
          background: isRunning ? "#2a313c" : "#4f8cff",
          color: isRunning ? "#6b727e" : "#06141f",
          fontFamily: "inherit",
          fontSize: 14,
          fontWeight: 600,
          cursor: isRunning ? "not-allowed" : "pointer",
          boxShadow: isRunning ? "none" : "0 4px 16px rgba(79,140,255,.24)",
          transition: "background 0.15s",
        }}
      >
        {isRunning ? "Running…" : "Run simulation"}
      </button>
    </div>
  );
}
