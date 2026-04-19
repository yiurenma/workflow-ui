import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ToastProvider } from "@/contexts/ToastContext";

// ─── Carbon nav active-underline + mobile tab bar ─────────────────
const NAV_ITEMS = [
  { to: "/", label: "Home", icon: "⌂" },
  { to: "/workflows", label: "Applications", icon: "☰" },
  { to: "/records", label: "Records", icon: "⊞" },
] as const;

function NavBar() {
  const { location } = useRouterState();
  const path = location.pathname;

  const isActive = (to: string) =>
    to === "/" ? path === "/" : path.startsWith(to);

  return (
    <header
      style={{
        height: 48,
        background: "#161616",
        borderBottom: "1px solid #393939",
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        zIndex: 100,
        position: "relative",
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 16px",
          borderRight: "1px solid #393939",
          height: "100%",
        }}
      >
        <span style={{ fontSize: 15, color: "#fff" }}>⬡</span>
        <span
          className="hide-mobile"
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#fff",
            letterSpacing: "0.16px",
            whiteSpace: "nowrap",
          }}
        >
          Workflow Studio
        </span>
      </div>

      {/* Nav items — desktop */}
      {NAV_ITEMS.map((n) => (
        <Link
          key={n.to}
          to={n.to}
          className={`nav-item ${isActive(n.to) ? "active" : ""}`}
          style={{ fontFamily: "inherit" }}
        >
          <span className="hide-mobile">{n.label}</span>
          <span className="show-mobile-only" style={{ fontSize: 16 }}>{n.icon}</span>
        </Link>
      ))}

      {/* Avatar */}
      <div style={{ marginLeft: "auto", padding: "0 12px" }}>
        <div
          style={{
            width: 28,
            height: 28,
            background: "#393939",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            color: "#c6c6c6",
          }}
        >
          WS
        </div>
      </div>
    </header>
  );
}

function MobileTabBar() {
  const { location } = useRouterState();
  const path = location.pathname;
  const isActive = (to: string) =>
    to === "/" ? path === "/" : path.startsWith(to);

  return (
    <nav className="mobile-tab-bar show-mobile-only">
      {NAV_ITEMS.map((n) => (
        <Link
          key={n.to}
          to={n.to}
          className={`mobile-tab ${isActive(n.to) ? "active" : ""}`}
        >
          <span style={{ fontSize: 20 }}>{n.icon}</span>
          <span>{n.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export const Route = createRootRoute({
  component: () => (
    <ToastProvider>
      <div style={{ display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden" }}>
        <NavBar />
        <main style={{ flex: 1, overflow: "hidden" }}>
          <Outlet />
        </main>
        <MobileTabBar />
      </div>
    </ToastProvider>
  ),
});
