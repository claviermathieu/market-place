import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AddAppModal({ onClose, onAdded }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister() {
    if (!repoUrl.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/apps/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: repoUrl.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Registration failed");
      }
      const app = await res.json();
      onAdded(app);
      onClose();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(6,8,11,.7)",
        backdropFilter: "blur(4px)",
        animation: "fadeup 0.2s ease both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#16191f",
          border: "1px solid #2a313c",
          borderRadius: 16,
          padding: 26,
          boxShadow: "0 24px 70px rgba(0,0,0,.5)",
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              padding: "34px 0",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "3px solid #262c35",
                borderTopColor: "#4f8cff",
              }}
              className="animate-spin-custom"
            />
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#f1f3f6" }}>
                Cloning repo…
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "#8a909c" }}>
                Validating manifest.json and function.py
              </p>
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#f4f6f9",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Add App
                </h2>
                <p style={{ margin: "5px 0 0", fontSize: 13, color: "#8a909c" }}>
                  Register a model from a GitHub repository.
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 30,
                  height: 30,
                  border: "none",
                  borderRadius: 8,
                  background: "#21262e",
                  color: "#9aa0ab",
                  fontSize: 16,
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <label
              style={{
                display: "block",
                fontSize: 12.5,
                fontWeight: 500,
                color: "#c4c9d2",
                marginBottom: 8,
              }}
            >
              GitHub repo URL
            </label>
            <input
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/your-org/model-repo"
              style={{
                width: "100%",
                padding: "11px 13px",
                background: "#0e1116",
                border: `1px solid ${error ? "#f87171" : "#2a313c"}`,
                borderRadius: 9,
                color: "#e6e8ec",
                fontFamily: "inherit",
                fontSize: 13.5,
                outline: "none",
              }}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            />
            {error && (
              <p style={{ margin: "7px 0 0", fontSize: 12, color: "#f87171" }}>{error}</p>
            )}
            <p style={{ margin: "9px 0 0", fontSize: 12, color: "#6b727e", lineHeight: 1.5 }}>
              Repo must contain a{" "}
              <span style={{ color: "#9aa0ab", fontFamily: "ui-monospace,monospace" }}>
                manifest.json
              </span>{" "}
              and a{" "}
              <span style={{ color: "#9aa0ab", fontFamily: "ui-monospace,monospace" }}>
                function.py
              </span>
              .
            </p>
            <button
              onClick={handleRegister}
              style={{
                marginTop: 22,
                width: "100%",
                padding: 11,
                border: "none",
                borderRadius: 9,
                background: "#4f8cff",
                color: "#06141f",
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(79,140,255,.24)",
              }}
            >
              Register App
            </button>
          </>
        )}
      </div>
    </div>
  );
}
