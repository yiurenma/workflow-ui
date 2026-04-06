import { FunctionPluginProps } from "@/types/plugins";
import { Position, Handle, NodeProps } from "@xyflow/react";

export const FunctionPlugin: React.FC<NodeProps<FunctionPluginProps>> = ({
  data,
  selected,
}) => {
  return (
    <div
      className={`
        relative flex items-stretch w-56 rounded-xl bg-white overflow-hidden
        border shadow-sm transition-all
        ${selected ? "border-blue-500 shadow-md ring-1 ring-blue-500/30" : "border-gray-200"}
      `}
    >
      <div className="w-1 shrink-0 bg-green-500 rounded-l-xl" />
      <Handle id="target-handle" type="target" position={Position.Left} className="handle-style" />
      <div className="flex flex-col gap-1 px-3 py-2 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-green-100 text-green-600 text-sm shrink-0">
            {data.icon}
          </span>
          <span className="text-xs font-semibold text-green-600 leading-none">Function V2</span>
        </div>
        <div className="text-xs text-gray-500 truncate leading-tight">
          {data.label || "Click to configure"}
        </div>
      </div>
      <Handle id="source-handle" type="source" position={Position.Right} className="handle-style" />
    </div>
  );
};
