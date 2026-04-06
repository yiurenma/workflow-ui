import React from "react";
import { Typography } from "antd";

export type EditorSectionKind = "description" | "rules" | "action";

const kindClassName: Record<EditorSectionKind, string> = {
  description:
    "rounded-lg border border-slate-200/90 bg-white p-3 mb-3 shadow-[0_2px_10px_rgba(15,23,42,0.07),0_1px_2px_rgba(15,23,42,0.05)]",
  rules:
    "rounded-lg border border-sky-200/70 bg-sky-50/50 p-3 mb-3 shadow-[0_2px_12px_rgba(14,165,233,0.14),0_1px_3px_rgba(14,165,233,0.1)]",
  action:
    "rounded-lg border border-amber-200/75 bg-amber-50/40 p-3 mb-0 shadow-[0_2px_12px_rgba(217,119,6,0.15),0_1px_3px_rgba(217,119,6,0.1)]",
};

type EditorSectionProps = {
  kind: EditorSectionKind;
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

const EditorSection: React.FC<EditorSectionProps> = ({
  kind,
  title,
  subtitle,
  children,
  className = "",
}) => (
  <div className={`${kindClassName[kind]} ${className}`.trim()}>
    <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-0.5">
      {title}
    </p>
    {subtitle ? (
      <Typography.Text type="secondary" className="text-xs block mb-2">
        {subtitle}
      </Typography.Text>
    ) : null}
    {children}
  </div>
);

export default EditorSection;
