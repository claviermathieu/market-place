import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import AppCard from "../components/AppCard";
import AddAppModal from "../components/AddAppModal";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Marketplace() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetch(`${API}/apps`)
      .then((r) => r.json())
      .then((data) => {
        setApps(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleAppAdded(app) {
    setApps((prev) => [...prev, { ...app, isNew: true }]);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0b0d10" }}>
      <Navbar />
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "38px 24px 90px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 30,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 25,
                fontWeight: 600,
                letterSpacing: "-0.025em",
                color: "#f4f6f9",
              }}
            >
              Marketplace
            </h1>
            <p style={{ margin: "7px 0 0", fontSize: 14, color: "#8a909c" }}>
              Launch and manage your actuarial models.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 18px",
              border: "none",
              borderRadius: 9,
              background: "#4f8cff",
              color: "#06141f",
              fontFamily: "inherit",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(79,140,255,.28)",
            }}
          >
            + Add App
          </button>
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              paddingTop: 80,
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
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
              gap: 18,
            }}
          >
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <AddAppModal onClose={() => setModalOpen(false)} onAdded={handleAppAdded} />
      )}
    </div>
  );
}
