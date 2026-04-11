import { IfElsePluginProps } from "@/types/plugins";
import { Position, Handle, NodeProps } from "@xyflow/react";

const ACCENT = "#D97706";

export const IfElsePlugin: React.FC<NodeProps<IfElsePluginProps>> = ({
  data,
  selected,
}) => {
  return (
    <div
      className="relative flex flex-col w-52 rounded-xl bg-white overflow-hidden border transition-all duration-150"
      style={{
        borderColor: selected ? "#A5A5F0" : "var(--ql-border)",
        boxShadow: selected
          ? "0 0 0 2px #5B5BD6, 0 2px 8px rgba(91,91,214,0.15)"
          : "var(--ql-shadow-sm)",
      }}
    >
      {/* Top accent strip */}
      <div className="h-[3px] w-full shrink-0" style={{ backgroundColor: ACCENT }} />

      <Handle id="target-handle" type="target" position={Position.Left} className="handle-style" />

      {/* Body */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 min-w-0">
        <span
          className="flex items-center justify-center w-[22px] h-[22px] rounded shrink-0 text-[13px]"
          style={{ backgroundColor: `${ACCENT}14`, color: ACCENT }}
        >
          {data.icon}
        </span>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[11px] font-semibold leading-tight tracking-tight" style={{ color: "var(--ql-text-primary)" }}>
            Condition
          </span>
          <span className="text-[10px] truncate leading-tight mt-0.5" style={{ color: "var(--ql-text-muted)" }}>
            {data.label || "Unconfigured"}
          </span>
        </div>
      </div>

      <Handle id="source-handle" type="source" position={Position.Right} className="handle-style" />
    </div>
  );
};
