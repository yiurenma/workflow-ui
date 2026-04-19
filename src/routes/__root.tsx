import { createRootRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ConfigProvider } from "antd";

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
          className="hidden sm:inline"
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
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0 14px",
            height: "100%",
            fontSize: 13,
            color: isActive(n.to) ? "#fff" : "#c6c6c6",
            cursor: "pointer",
            whiteSpace: "nowrap",
            borderBottom: isActive(n.to) ? "2px solid #0f62fe" : "2px solid transparent",
            textDecoration: "none",
            transition: "color 0.1s, background 0.1s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#262626";
            (e.currentTarget as HTMLElement).style.color = "#f4f4f4";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = isActive(n.to) ? "#fff" : "#c6c6c6";
          }}
        >
          <span className="hidden sm:inline">{n.label}</span>
          <span className="sm:hidden" style={{ fontSize: 16 }}>{n.icon}</span>
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
    <nav
      className="sm:hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#161616",
        height: 60,
        display: "flex",
        borderTop: "1px solid #393939",
        zIndex: 200,
      }}
    >
      {NAV_ITEMS.map((n) => (
        <Link
          key={n.to}
          to={n.to}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            color: isActive(n.to) ? "#0f62fe" : "#8d8d8d",
            fontSize: 10,
            textDecoration: "none",
            transition: "color 0.1s",
          }}
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
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#0f62fe",
          colorPrimaryHover: "#0353e9",
          borderRadius: 0,
          fontFamily: '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif',
          colorBgContainer: "#ffffff",
          colorBorder: "#c6c6c6",
          colorBorderSecondary: "#e0e0e0",
          colorText: "#161616",
          colorTextSecondary: "#525252",
          colorBgLayout: "#ffffff",
          colorError: "#da1e28",
          colorSuccess: "#24a148",
          colorWarning: "#f1c21b",
        },
        components: {
          Button: { borderRadius: 0, fontWeight: 400, controlHeight: 40 },
          Table: { headerBg: "#f4f4f4", rowHoverBg: "#f4f4f4", borderColor: "#e0e0e0" },
          Modal: { borderRadiusLG: 0 },
          Drawer: { borderRadiusLG: 0 },
          Input: {
            borderRadius: 0,
            colorBgContainer: "#f4f4f4",
            activeBorderColor: "#0f62fe",
            hoverBorderColor: "#0f62fe",
          },
          Tag: { borderRadius: 24 },
          Select: { borderRadius: 0 },
        },
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden" }}>
        <NavBar />
        <main style={{ flex: 1, overflow: "hidden" }}>
          <Outlet />
        </main>
        <MobileTabBar />
      </div>
    </ConfigProvider>
  ),
});
