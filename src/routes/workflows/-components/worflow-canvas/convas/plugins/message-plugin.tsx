import { MessagePluginProps } from "@/types/plugins";
import { Position, Handle, NodeProps } from "@xyflow/react";

const ACCENT = "#7C3AED";

export const MessagePlugin: React.FC<NodeProps<MessagePluginProps>> = ({ data, selected }) => (
  <div
    className="flow-node"
    style={{
      position: "relative", display: "flex", flexDirection: "column",
      width: 208, background: "#fff", overflow: "hidden",
      border: `1px solid ${selected ? "#0f62fe" : "#e0e0e0"}`,
      boxShadow: selected ? "0 0 0 2px rgba(15,98,254,0.3)" : "0 1px 4px rgba(0,0,0,0.08)",
    }}
  >
    <div style={{ height: 3, background: ACCENT, flexShrink: 0 }} />
    <Handle id="target-handle" type="target" position={Position.Left} className="handle-style" />
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", minWidth: 0 }}>
      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 4, flexShrink: 0, fontSize: 13, background: `${ACCENT}22`, color: ACCENT }}>
        {data.icon}
      </span>
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.25, color: "#161616" }}>Dispatch</span>
        <span style={{ fontSize: 10, lineHeight: 1.25, marginTop: 2, color: "#525252", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {data.label || "Unconfigured"}
        </span>
      </div>
    </div>
    <Handle id="source-handle" type="source" position={Position.Right} className="handle-style" />
  </div>
);
