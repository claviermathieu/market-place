import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function generateBuildLogTemplate(app) {
  const slug = app.function_name
  const inputKeys = Object.keys(app.input_schema || {})
  const manifestJson = JSON.stringify(
    { name: app.name, description: app.description, inputs: app.input_schema },
    null,
    2
  )
  const today = new Date().toISOString().split("T")[0]

  return `import DocsLayout from '../../../components/docs/DocsLayout'
import Callout from '../../../components/docs/Callout'
import CodeBlock from '../../../components/docs/CodeBlock'

export default function Layout({ children }) {
  return <DocsLayout title="${app.name} — Build Log">{children}</DocsLayout>
}

# ${app.name} — Build Log

**Registered:** ${today}
**Repo:** ${app.repo_url || "_local_"}

## Business Context

> _Describe what actuarial problem this model solves and why it matters._

## Contract

### manifest.json

\`\`\`json
${manifestJson}
\`\`\`

### Function signature

\`\`\`python
async def run(inputs: dict) -> dict:
    # inputs keys: ${inputKeys.join(", ")}
    ...
\`\`\`

## Prompt Sequence

### Prompt 1 — Initial

> _Paste the first prompt you gave to the AI here._

### Iteration 1 — What was wrong

> _Describe the issue with the first output and how you fixed it._

### Final prompt

> _Paste the prompt that produced working code._

## What Worked

-

## What Didn't

-

## Annotated Code

\`\`\`python
# function.py — paste and annotate your implementation here
async def run(inputs: dict) -> dict:
    pass
\`\`\`
`
}

export default function AddAppModal({ onClose, onAdded }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(null);
  const [copied, setCopied] = useState(false);

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
      setRegistered(app);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  function handleCopyTemplate() {
    if (!registered) return;
    navigator.clipboard.writeText(generateBuildLogTemplate(registered)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div
      onClick={registered ? undefined : onClose}
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
          maxWidth: registered ? 560 : 440,
          background: "#16191f",
          border: "1px solid #2a313c",
          borderRadius: 16,
          padding: 26,
          boxShadow: "0 24px 70px rgba(0,0,0,.5)",
        }}
      >
        {/* Loading state */}
        {loading && (
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
        )}

        {/* Success state */}
        {!loading && registered && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18, color: "#34d399" }}>✓</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#f4f6f9", letterSpacing: "-0.01em" }}>
                    {registered.name} registered
                  </h2>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "#8a909c" }}>
                    Now visible in the marketplace
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 30, height: 30, border: "none", borderRadius: 8,
                  background: "#21262e", color: "#9aa0ab", fontSize: 16, cursor: "pointer", lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                padding: "14px 16px",
                background: "rgba(79,140,255,.06)",
                border: "1px solid #243555",
                borderRadius: 10,
                marginBottom: 16,
              }}
            >
              <p style={{ margin: "0 0 6px", fontSize: 12.5, fontWeight: 600, color: "#4f8cff" }}>
                Next step — create a Build Log
              </p>
              <p style={{ margin: 0, fontSize: 12.5, color: "#8a909c", lineHeight: 1.55 }}>
                Copy the template below and save it as{" "}
                <code style={{ fontFamily: "ui-monospace,monospace", background: "#1b1f26", padding: "1px 5px", borderRadius: 3, fontSize: 11.5 }}>
                  frontend/pages/docs/build-log/{registered.function_name}.mdx
                </code>
              </p>
            </div>

            <div style={{ position: "relative" }}>
              <div
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "7px 12px",
                  background: "#14171c", border: "1px solid #1b2027",
                  borderBottom: "none", borderRadius: "8px 8px 0 0",
                }}
              >
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "#454c57", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  build-log/{registered.function_name}.mdx
                </span>
                <button
                  onClick={handleCopyTemplate}
                  style={{
                    background: "none", border: "1px solid #2f3947", borderRadius: 5,
                    color: copied ? "#34d399" : "#6b727e", cursor: "pointer",
                    fontSize: 11, padding: "2px 9px", fontFamily: "inherit", transition: "color 0.15s",
                  }}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: "12px 14px",
                  background: "#0e1117",
                  border: "1px solid #1b2027",
                  borderRadius: "0 0 8px 8px",
                  overflowX: "auto",
                  overflowY: "auto",
                  maxHeight: 220,
                  fontFamily: "'JetBrains Mono','Fira Code','Consolas',monospace",
                  fontSize: 11,
                  lineHeight: 1.55,
                  color: "#8a909c",
                  whiteSpace: "pre",
                }}
              >
                {generateBuildLogTemplate(registered)}
              </pre>
            </div>

            <button
              onClick={onClose}
              style={{
                marginTop: 18, width: "100%", padding: 10,
                border: "1px solid #2f3947", borderRadius: 9,
                background: "transparent", color: "#d7dbe2",
                fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
              }}
            >
              Close
            </button>
          </>
        )}

        {/* Default form state */}
        {!loading && !registered && (
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
