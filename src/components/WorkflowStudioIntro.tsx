import React from "react";

const TILES = [
  { title: "Canvas",     desc: "Visual flow editor",   color: "#0f62fe" },
  { title: "Conditions", desc: "JSONPath branching",   color: "#D97706" },
  { title: "Records",    desc: "Execution history",    color: "#0891B2" },
  { title: "AI Tools",   desc: "Explain & Generate",   color: "#7C3AED" },
];

export const WorkflowStudioIntro: React.FC = () => (
  <div style={{ paddingBottom: 24, marginBottom: 28, borderBottom: "1px solid #e8e8e8" }}>
    <h1 style={{ fontSize: 26, fontWeight: 300, color: "#161616", letterSpacing: "-0.3px", marginBottom: 8 }}>
      Workflow Studio
    </h1>
    <p style={{ fontSize: 14, color: "#525252", lineHeight: 1.6, maxWidth: 680, letterSpacing: "0.16px", marginBottom: 16 }}>
      Configurable message enrichment, conditional logic, and multi-channel delivery — without writing custom backend code.
    </p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, border: "1px solid #e0e0e0", background: "#e0e0e0", overflow: "hidden" }}>
      {TILES.map(({ title, desc, color }) => (
        <div key={title} style={{ background: "#fff", padding: "10px 14px", borderLeft: `2px solid ${color}` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#161616", marginBottom: 2 }}>{title}</div>
          <div style={{ fontSize: 11, color: "#525252" }}>{desc}</div>
        </div>
      ))}
    </div>
  </div>
);
