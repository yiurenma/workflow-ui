import React, { useState, useRef, useCallback, useEffect } from "react";
import { Node } from "@xyflow/react";
import { Plugin, PluginMetadataMap } from "@/types/plugins";
import HttpCallForm from "./forms/HttpCallForm";
import LogicForm from "./forms/LogicForm";
import NodeView from "./NodeView";
import { type PluginFormData } from "@/routes/workflows/-components/worflow-canvas/hooks/useWorkflowForm";
import { useIsMobile } from "@/hooks/useIsMobile";

export type WorkflowDrawerProps = {
  open: boolean;
  onClose: () => void;
  selectedNode: Node | null;
  onFormChange?: (nodeId: string, formData: PluginFormData) => void;
};

const MIN_WIDTH = 320;
const MAX_WIDTH = 900;
const DEFAULT_WIDTH = 420;

const WorkflowDrawer: React.FC<WorkflowDrawerProps> = ({
  open,
  onClose,
  selectedNode,
  onFormChange,
}) => {
  const isMobile = useIsMobile();
  const [drawerWidth, setDrawerWidth] = useState(DEFAULT_WIDTH);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [editingData, setEditingData] = useState<PluginFormData | null>(null);
  const resizeState = useRef({ active: false, startX: 0, startWidth: DEFAULT_WIDTH });

  useEffect(() => {
    if (open && selectedNode) {
      setMode("view");
      setEditingData(null);
    }
  }, [open, selectedNode?.id]);

  const onResizePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const s = resizeState.current;
      s.active = true;
      s.startX = e.clientX;
      s.startWidth = drawerWidth;

      const onMove = (ev: PointerEvent) => {
        if (!s.active) return;
        const dx = s.startX - ev.clientX;
        setDrawerWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, s.startWidth + dx)));
      };
      const onUp = () => {
        s.active = false;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [drawerWidth]
  );

  const handleEdit = () => setMode("edit");

  const handleDone = () => {
    if (editingData && selectedNode) {
      onFormChange?.(selectedNode.id, editingData);
    }
    setMode("view");
    setEditingData(null);
  };

  const handleCancel = () => {
    setMode("view");
    setEditingData(null);
  };

  const handleFormChange = (formData: PluginFormData) => {
    setEditingData(formData);
  };

  const renderContent = () => {
    if (!selectedNode) {
      return (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#525252", fontSize: 13 }}>
          Please select a node
        </div>
      );
    }

    if (mode === "view") return <NodeView selectedNode={selectedNode} />;

    const nodeType = selectedNode.type as Plugin;
    switch (nodeType) {
      case Plugin.CONSUMER:
      case Plugin.CONSUMER_WITHOUT_ERROR:
      case Plugin.MESSAGE:
        return <HttpCallForm selectedNode={selectedNode} onValuesChange={handleFormChange} />;
      case Plugin.IF_ELSE:
      case Plugin.FUNCTION:
      case Plugin.FUNCTION_V3:
        return <LogicForm selectedNode={selectedNode} onValuesChange={handleFormChange} />;
      default:
        return (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#525252", fontSize: 13 }}>
            Configuration for {nodeType} nodes is not supported yet
          </div>
        );
    }
  };

  const nodeType = selectedNode?.type as Plugin | undefined;
  const meta = nodeType ? PluginMetadataMap[nodeType] : undefined;
  const accent = meta?.color ?? "#525252";

  const drawerHeader = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.32px", color: "#525252", marginBottom: 2 }}>Node Configuration</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#161616", display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
          {selectedNode && (
            <span style={{ width: 10, height: 10, background: accent, display: "inline-block", flexShrink: 0 }} />
          )}
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selectedNode ? String(selectedNode.data?.label || "Unnamed Node") : "Select a node"}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
        {mode === "view" ? (
          <button className="btn btn-primary btn-sm" onClick={handleEdit} style={{ minWidth: 60 }}>Edit</button>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm" onClick={handleCancel} style={{ minWidth: 60 }}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={handleDone} style={{ minWidth: 60 }}>Done</button>
          </>
        )}
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#525252", fontSize: 16, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );

  if (!open) return null;

  /* Mobile: bottom sheet */
  if (isMobile) {
    return (
      <>
        <div
          style={{ position: "fixed", inset: 0, zIndex: 900 }}
          onClick={onClose}
        />
        <div
          style={{
            position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 901,
            background: "#fff", borderTop: "1px solid #c6c6c6",
            boxShadow: "0 -2px 6px rgba(0,0,0,0.3)",
            minHeight: "40dvh", maxHeight: "70dvh",
            display: "flex", flexDirection: "column",
          }}
          className="fade-in"
        >
          <div className="drawer-header">{drawerHeader}</div>
          <div className="drawer-body">{renderContent()}</div>
        </div>
      </>
    );
  }

  /* Desktop: right drawer with drag-to-resize */
  return (
    <>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 900 }}
        onClick={onClose}
      />
      <div
        className="drawer-panel fade-in"
        style={{ width: drawerWidth }}
      >
        {/* Drag handle */}
        <div
          onPointerDown={onResizePointerDown}
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 6,
            cursor: "ew-resize", zIndex: 10, background: "transparent",
            transition: "background 0.15s", userSelect: "none",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "rgba(15,98,254,0.12)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
          title="Drag to resize panel"
        />
        <div className="drawer-header">{drawerHeader}</div>
        <div className="drawer-body">{renderContent()}</div>
      </div>
    </>
  );
};

export default WorkflowDrawer;
