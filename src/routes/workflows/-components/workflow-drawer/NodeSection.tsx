import React from "react";

type NodeSectionProps = {
  title: string;
  children: React.ReactNode;
  variant?: "default" | "inset";
};

/**
 * Shared panel wrapper for the three-panel node editor layout.
 * variant="inset" applies a shaded card background (used for the Action panel).
 */
const NodeSection: React.FC<NodeSectionProps> = ({ title, children, variant = "default" }) => (
  <div
    className={
      variant === "inset"
        ? "mb-4 border border-zinc-100 rounded-lg p-3 bg-zinc-50"
        : "mb-4"
    }
  >
    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">
      {title}
    </p>
    {children}
  </div>
);

export default NodeSection;
