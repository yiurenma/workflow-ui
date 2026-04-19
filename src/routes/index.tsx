import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomeScreen,
});

const FEATURES = [
  { icon: "⬡", title: "Visual Canvas", desc: "Drag-and-drop workflow editor with nodes, rules (JSONPath), and actions. No code required for configuration.", color: "#0f62fe" },
  { icon: "⑂", title: "Conditional Logic", desc: "Branch on JSONPath expressions. Route messages based on payload content, account state, or custom rules.", color: "#D97706" },
  { icon: "↓", title: "HTTP Enrichment", desc: "Fetch external data and merge it into message payloads before dispatch.", color: "#3B82F6" },
  { icon: "💡", title: "AI Explain", desc: "Generate plain-language documentation for any workflow using GitHub Models or Anthropic.", color: "#7C3AED" },
  { icon: "🤖", title: "AI Generate", desc: "Describe a workflow in natural language and let AI scaffold the nodes.", color: "#059669" },
  { icon: "⊞", title: "Execution Records", desc: "Full visibility into every workflow run — searchable, filterable history for debugging and audit.", color: "#0891B2" },
];

function HomeScreen() {
  const navigate = useNavigate();

  return (
    <div style={{ overflowY: "auto", height: "100%", paddingBottom: 60 }}>
      {/* Hero */}
      <div
        style={{
          background: "#161616",
          color: "#fff",
          padding: "56px 48px 48px",
          borderBottom: "3px solid #0f62fe",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",
            backgroundSize: "32px 32px",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: 640, position: "relative" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(15,98,254,0.15)",
              border: "1px solid rgba(15,98,254,0.4)",
              padding: "4px 12px",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.32px",
              color: "#a6c8ff",
              marginBottom: 20,
              textTransform: "uppercase",
            }}
          >
            Workflow Studio
          </div>
          <h1
            style={{
              fontSize: 44,
              fontWeight: 300,
              lineHeight: 1.15,
              marginBottom: 20,
              letterSpacing: "-0.5px",
              margin: "0 0 20px",
            }}
          >
            Design, test &amp; deploy
            <br />
            <span style={{ color: "#0f62fe", fontWeight: 400 }}>message enrichment</span> workflows
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#a8a8a8",
              lineHeight: 1.7,
              marginBottom: 36,
              maxWidth: 500,
            }}
          >
            Visual orchestration for integration engineers. Build conditional logic flows, enrich
            transaction data, and route messages — no deploy cycle needed.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => navigate({ to: "/workflows" })}
              style={{
                height: 44,
                padding: "0 24px",
                fontSize: 14,
                background: "#0f62fe",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 400,
                letterSpacing: "0.16px",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#0353e9")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#0f62fe")}
            >
              Go to Applications →
            </button>
            <button
              onClick={() => navigate({ to: "/records" })}
              style={{
                height: 44,
                padding: "0 24px",
                fontSize: 14,
                background: "transparent",
                color: "#c6c6c6",
                border: "1px solid #393939",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 400,
                letterSpacing: "0.16px",
                transition: "background 0.12s, border-color 0.12s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#262626";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#525252";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#393939";
              }}
            >
              View Records
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: "40px 48px", maxWidth: 1100 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.32px",
            color: "#525252",
            marginBottom: 20,
          }}
        >
          Key capabilities
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 1,
            background: "#e0e0e0",
            border: "1px solid #e0e0e0",
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{ background: "#fff", padding: "20px 24px", transition: "background 0.1s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#f4f4f4")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#fff")}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: `${f.color}14`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  marginBottom: 12,
                  borderLeft: `3px solid ${f.color}`,
                }}
              >
                {f.icon}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#161616", marginBottom: 6 }}>
                {f.title}
              </div>
              <div style={{ fontSize: 12, color: "#525252", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
