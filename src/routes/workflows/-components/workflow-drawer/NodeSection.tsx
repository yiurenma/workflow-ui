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
        ? "mb-4 border border-zinc-200 rounded-lg p-3 bg-zinc-50 shadow-sm"
        : "mb-4 border border-zinc-200 rounded-lg p-3 bg-white shadow-sm"
    }
  >
    <div className="flex items-center gap-1 mb-1">
      <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
        {title}
      </p>
      {headingTooltip && (
        <Tooltip title={headingTooltip}>
          <InfoCircleOutlined className="text-[10px] text-zinc-300 cursor-help" />
        </Tooltip>
      )}
    </div>
    {subtitle && (
      <p className="text-xs text-zinc-400 mb-3">{subtitle}</p>
    )}
    {children}
  </div>
);

export default NodeSection;
