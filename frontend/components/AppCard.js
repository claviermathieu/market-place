import { useRouter } from "next/router";

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AppCard({ app }) {
  const router = useRouter();
  const inputs = app.input_schema || {};
  const fieldNames = Object.values(inputs).map((f) => f.label || "");

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 15,
        padding: 22,
        background: "#14171c",
        border: "1px solid #232932",
        borderRadius: 14,
        transition: "border-color 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#33404f")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#232932")}
    >
      {app.isNew && (
        <span
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            padding: "3px 9px",
            borderRadius: 999,
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.03em",
            color: "#4f8cff",
            background: "rgba(79,140,255,.14)",
            border: "1px solid rgba(79,140,255,.3)",
          }}
        >
          NEW
        </span>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 11,
            background: "rgba(79,140,255,.1)",
            color: "#4f8cff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: "-0.02em",
          }}
        >
          {getInitials(app.name)}
        </div>
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: "#f1f3f6",
              letterSpacing: "-0.01em",
            }}
          >
            {app.name}
          </h3>
          <span style={{ fontSize: 11.5, color: "#6b727e" }}>Actuarial model</span>
        </div>
      </div>

      <p style={{ margin: 0, flex: 1, fontSize: 13.5, lineHeight: 1.55, color: "#9aa0ab" }}>
        {app.description}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {fieldNames.map((fn) => (
          <span
            key={fn}
            style={{
              padding: "4px 9px",
              borderRadius: 7,
              fontSize: 11.5,
              color: "#8a909c",
              background: "#1b1f26",
              border: "1px solid #262c35",
            }}
          >
            {fn}
          </span>
        ))}
      </div>

      <button
        onClick={() => router.push(`/apps/${app.id}`)}
        style={{
          marginTop: 2,
          padding: "9px 14px",
          border: "1px solid #2f3947",
          borderRadius: 9,
          background: "transparent",
          color: "#d7dbe2",
          fontFamily: "inherit",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          transition: "border-color 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#4f8cff";
          e.currentTarget.style.color = "#4f8cff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#2f3947";
          e.currentTarget.style.color = "#d7dbe2";
        }}
      >
        Launch →
      </button>
    </div>
  );
}
