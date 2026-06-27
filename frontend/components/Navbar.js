import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Navbar() {
  const router = useRouter();
  const isMonitor = router.pathname.startsWith("/monitor");
  const isDocs = router.pathname.startsWith("/docs");
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    const poll = () => {
      fetch(`${API}/monitor/live`)
        .then((r) => r.json())
        .then((d) => setLiveCount((d.live || []).length))
        .catch(() => {});
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "12px 24px",
        background: "rgba(11,13,16,.88)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid #1b2027",
      }}
    >
      {/* Logo */}
      <div
        onClick={() => router.push("/")}
        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: "#4f8cff",
            color: "#06141f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          Σ
        </div>
        <span style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: "-0.01em", color: "#f3f5f8" }}>
          MCLAVIER
        </span>
      </div>

      {/* Center-right nav */}
      <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <NavItem label="Docs"    active={isDocs}    onClick={() => router.push("/docs")} />
        <NavItem label="Monitor" active={isMonitor} onClick={() => router.push("/monitor")} />

        {/* Live indicator */}
        <button
          onClick={() => router.push("/monitor")}
          title={liveCount > 0 ? `${liveCount} job(s) running` : "No active jobs"}
          style={{
            marginLeft: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 11px",
            border: "1px solid #232932",
            borderRadius: 999,
            background: "transparent",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 12,
            fontWeight: 500,
            color: liveCount > 0 ? "#34d399" : "#454c57",
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2f3947")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#232932")}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: liveCount > 0 ? "#34d399" : "#3a4150",
              boxShadow: liveCount > 0 ? "0 0 0 2px rgba(52,211,153,.22)" : "none",
              flexShrink: 0,
              transition: "background 0.3s, box-shadow 0.3s",
            }}
          />
          {liveCount > 0 ? `${liveCount} running` : "idle"}
        </button>
      </nav>
    </div>
  );
}

function NavItem({ label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "7px 12px",
        fontSize: 13.5,
        fontWeight: active ? 500 : 400,
        cursor: "pointer",
        color: active ? "#f1f3f6" : "#8a909c",
        borderBottom: active ? "2px solid #4f8cff" : "2px solid transparent",
        transition: "color 0.12s, border-color 0.12s",
        userSelect: "none",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "#c4c9d2"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "#8a909c"; }}
    >
      {label}
    </div>
  );
}
