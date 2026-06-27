import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();
  const isMarket = router.pathname === "/";
  const isExplorer = router.pathname.startsWith("/explorer");
  const isDocs = router.pathname.startsWith("/docs");
  const isHistory = router.pathname === "/history";

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
        padding: "13px 24px",
        background: "rgba(11,13,16,.82)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid #1b2027",
      }}
    >
      <div
        onClick={() => router.push("/")}
        style={{ display: "flex", alignItems: "center", gap: 11, cursor: "pointer" }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "#4f8cff",
            color: "#06141f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: "-0.03em",
          }}
        >
          Σ
        </div>
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", color: "#f3f5f8" }}>
          MCLAVIER Tech
        </span>
      </div>

      <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <NavItem
          label="Marketplace"
          active={isMarket}
          onClick={() => router.push("/")}
        />
        <NavItem
          label="Explorer"
          active={isExplorer}
          onClick={() => router.push("/explorer")}
        />
        <NavItem
          label="Docs"
          active={isDocs}
          onClick={() => router.push("/docs")}
        />
        <NavItem
          label="History"
          active={isHistory}
          onClick={() => router.push("/history")}
        />
        <button
          style={{
            marginLeft: 8,
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "7px 15px",
            border: "1px solid #2f3947",
            borderRadius: 8,
            background: "transparent",
            color: "#d7dbe2",
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <span
            style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399" }}
          />
          Log in
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
        padding: "7px 13px",
        borderRadius: 8,
        fontSize: 13.5,
        fontWeight: 500,
        cursor: "pointer",
        color: active ? "#4f8cff" : "#9aa0ab",
      }}
    >
      {label}
    </div>
  );
}
