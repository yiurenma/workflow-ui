import React from "react";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

type NodeSectionProps = {
  title: string;
  children: React.ReactNode;
  variant?: "default" | "inset";
  subtitle?: string;
  headingTooltip?: string;
};

/**
 * Shared panel wrapper for the three-panel node editor layout.
 * variant="inset" applies a shaded card background (used for the Action panel).
 * subtitle: plain-English one-liner for business users.
 * headingTooltip: persisted field map for developers (shown on ⓘ icon hover).
 */
const NodeSection: React.FC<NodeSectionProps> = ({
  title,
  children,
  variant = "default",
  subtitle,
  headingTooltip,
}) => (
  <div
    className={
      variant === "inset"
        ? "mb-4 p-3"
        : "mb-4 p-3"
    }
    style={{
      background: variant === "inset" ? "#f4f4f4" : "#ffffff",
      border: "1px solid #e0e0e0",
      borderRadius: 0,
    }}
  >
    <div className="flex items-center gap-1 mb-1">
      <p className="text-[10px] font-semibold uppercase" style={{ color: "#525252", letterSpacing: "0.32px" }}>
        {title}
      </p>
      {headingTooltip && (
        <Tooltip title={headingTooltip} overlayClassName="carbon-tooltip">
          <InfoCircleOutlined className="text-[10px] cursor-help" style={{ color: "#8d8d8d" }} />
        </Tooltip>
      )}
    </div>
    {subtitle && (
      <p className="text-xs mb-3" style={{ color: "#525252", letterSpacing: "0.16px" }}>{subtitle}</p>
    )}
    {children}
  </div>
);

export default NodeSection;
