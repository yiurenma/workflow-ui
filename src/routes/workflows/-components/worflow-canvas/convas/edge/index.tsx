import { CloseOutlined } from "@ant-design/icons";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useReactFlow,
} from "@xyflow/react";
import { useMemo } from "react";

export const ButtonEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}) => {
  const { setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const selectedStyle = useMemo(() => {
    return selected ? { strokeWidth: 2, stroke: "#4F46E5" } : {};
  }, [selected]);

  // Handle edge delete button click
  const onEdgeDelete = (event: React.MouseEvent) => {
    // Stop propagation to prevent edge selection
    event.stopPropagation();

    // Remove the edge from the graph
    setEdges((edges) => edges.filter((edge) => edge.id !== id));

    console.log("Edge deleted:", id);
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{ ...style, ...selectedStyle }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 10,
            pointerEvents: "all",
            zIndex: 1001,
          }}
          className="nodrag nopan opacity-0 hover:opacity-100 transition-opacity duration-300"
        >
          <button
            className="cursor-pointer rounded-full bg-zinc-500 hover:bg-zinc-700 p-0.5 flex items-center justify-center w-4 h-4 shadow-sm transition-colors duration-150"
            type="button"
            onClick={onEdgeDelete}
            title="Delete connection"
          >
            <CloseOutlined className="text-white text-[8px]" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
