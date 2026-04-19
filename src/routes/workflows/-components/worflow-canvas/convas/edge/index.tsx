import React from "react";
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
    return selected ? { strokeWidth: 2, stroke: "#0f62fe" } : {};
  }, [selected]);

  const onEdgeDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
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
            opacity: 0,
            transition: "opacity 0.2s",
          }}
          className="nodrag nopan edge-delete-btn"
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "0"; }}
        >
          <button
            style={{
              cursor: "pointer",
              background: "#6f6f6f",
              border: "none",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 16,
              height: 16,
              color: "#fff",
              fontSize: 10,
              fontFamily: "inherit",
            }}
            type="button"
            onClick={onEdgeDelete}
            title="Delete connection"
          >
            ✕
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
