import { MessagePluginProps } from "@/types/plugins";
import { Position, Handle, NodeProps } from "@xyflow/react";

const ACCENT = "#7C3AED";

export const MessagePlugin: React.FC<NodeProps<MessagePluginProps>> = ({
  data,
  selected,
}) => {
  return (
    <div
      className={`
        relative flex flex-col w-52 rounded-lg bg-white overflow-hidden
        border transition-all duration-150
        ${selected
          ? "border-indigo-300 ring-2 ring-indigo-500 ring-offset-1 shadow-sm"
          : "border-zinc-200 shadow-sm hover:border-zinc-300 hover:shadow"
        }
      `}
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
          <span className="text-[11px] font-semibold text-zinc-800 leading-tight tracking-tight">
            Dispatch
          </span>
          <span className="text-[10px] text-zinc-400 truncate leading-tight mt-0.5">
            {data.label || "Unconfigured"}
          </span>
        </div>
      </div>

      <Handle id="source-handle" type="source" position={Position.Right} className="handle-style" />
    </div>
  );
};
