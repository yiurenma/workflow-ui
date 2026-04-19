import React from "react";

type NodeSectionProps = {
  title: string;
  children: React.ReactNode;
  variant?: "default" | "inset";
  subtitle?: string;
  headingTooltip?: string;
};

const NodeSection: React.FC<NodeSectionProps> = ({
  title,
  children,
  variant = "default",
  subtitle,
}) => {
  const isInset = variant === "inset";
  return (
    <div style={{ marginBottom: 10, border: "1px solid #e0e0e0", overflow: "hidden" }}>
      {/* Section header with colored left bar */}
      <div
        style={{
          padding: "8px 12px",
          background: isInset ? "#f4f4f4" : "#fafafa",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 3,
            alignSelf: "stretch",
            minHeight: 28,
            background: isInset ? "#8d8d8d" : "#0f62fe",
            flexShrink: 0,
            marginTop: 1,
          }}
        />
        <div style={{ paddingTop: 1, flex: 1 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.4px",
              color: isInset ? "#525252" : "#161616",
            }}
          >
            {title}
          </span>
          {subtitle && (
            <div style={{ fontSize: 11, color: "#525252", marginTop: 2, lineHeight: 1.4 }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {/* Section body */}
      <div style={{ padding: 12, background: isInset ? "#f9f9f9" : "#fff" }}>
        {children}
      </div>
    </div>
  );
};

export default NodeSection;
