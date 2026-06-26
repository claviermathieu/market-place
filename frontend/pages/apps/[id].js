import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Navbar from "../../components/Navbar";
import JobForm from "../../components/JobForm";
import ResultPanel from "../../components/ResultPanel";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const WS = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export default function AppPage() {
  const router = useRouter();
  const { id } = router.query;

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobStatus, setJobStatus] = useState("IDLE");
  const [result, setResult] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/apps/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("App not found");
        return r.json();
      })
      .then((data) => {
        setApp(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  async function handleRun(inputs) {
    setJobStatus("PENDING");
    setResult(null);

    try {
      const res = await fetch(`${API}/apps/${id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs }),
      });
      if (!res.ok) throw new Error("Failed to start run");
      const { run_id } = await res.json();
      openWebSocket(run_id);
    } catch {
      setJobStatus("FAILED");
    }
  }

  function openWebSocket(runId) {
    if (wsRef.current) wsRef.current.close();
    const ws = new WebSocket(`${WS}/ws/runs/${runId}`);
    wsRef.current = ws;

    ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      setJobStatus(data.status);
      if (data.result) setResult(data.result);
      if (data.status === "SUCCESS" || data.status === "FAILED") {
        ws.close();
      }
    };

    ws.onerror = () => {
      setJobStatus("FAILED");
    };
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0b0d10" }}>
        <Navbar />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: 120,
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
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div style={{ minHeight: "100vh", background: "#0b0d10" }}>
        <Navbar />
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "38px 24px" }}>
          <p style={{ color: "#f87171" }}>App not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0b0d10" }}>
      <Navbar />
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 24px 90px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            marginBottom: 22,
            fontSize: 13,
          }}
        >
          <span
            onClick={() => router.push("/")}
            style={{ color: "#8a909c", cursor: "pointer" }}
          >
            Marketplace
          </span>
          <span style={{ color: "#454c57" }}>/</span>
          <span style={{ color: "#e6e8ec", fontWeight: 500 }}>{app.name}</span>
        </div>

        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          <JobForm app={app} onRun={handleRun} jobStatus={jobStatus} />
          <ResultPanel jobStatus={jobStatus} result={result} />
        </div>
      </div>
    </div>
  );
}
