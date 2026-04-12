import React, { useState, useRef, useCallback, useEffect } from "react";
import { Drawer, Empty, Button, Space } from "antd";
import { Node } from "@xyflow/react";
import { Plugin } from "@/types/plugins";
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
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [editingData, setEditingData] = useState<PluginFormData | null>(null);
  const resizeState = useRef({ active: false, startX: 0, startWidth: DEFAULT_WIDTH });

  // Reset to view mode when drawer opens with a new node
  useEffect(() => {
    if (open && selectedNode) {
      setMode('view');
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
        const dx = s.startX - ev.clientX; // drag left → positive dx → wider
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

  const handleEdit = () => {
    setMode('edit');
  };

  const handleDone = () => {
    // Save changes if any
    if (editingData && selectedNode) {
      onFormChange?.(selectedNode.id, editingData);
    }
    setMode('view');
    setEditingData(null);
  };

  const handleCancel = () => {
    // Discard changes
    setMode('view');
    setEditingData(null);
  };

  const handleFormChange = (formData: PluginFormData) => {
    setEditingData(formData);
  };

  const renderContent = () => {
    if (!selectedNode) {
      return <Empty description="Please select a node" />;
    }

    if (mode === 'view') {
      return <NodeView selectedNode={selectedNode} />;
    }

    // Edit mode - render form
    const nodeType = selectedNode.type as Plugin;
    const onValuesChange = handleFormChange;

    switch (nodeType) {
      case Plugin.CONSUMER:
      case Plugin.CONSUMER_WITHOUT_ERROR:
      case Plugin.MESSAGE:
        return <HttpCallForm selectedNode={selectedNode} onValuesChange={onValuesChange} />;
      case Plugin.IF_ELSE:
      case Plugin.FUNCTION:
      case Plugin.FUNCTION_V3:
        return <LogicForm selectedNode={selectedNode} onValuesChange={onValuesChange} />;
      default:
        return (
          <Empty description={`Configuration for ${nodeType} nodes is not supported yet`} />
        );
    }
  };

  const drawerTitle = (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[10px] font-semibold uppercase" style={{ color: "#525252", letterSpacing: "0.32px" }}>
          Node Configuration
        </span>
        <span className="text-sm font-semibold leading-tight truncate" style={{ color: "#161616" }}>
          {selectedNode ? String(selectedNode.data?.label || "Unnamed Node") : "Select a node"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {mode === 'view' ? (
          <Button
            type="primary"
            size="small"
            onClick={handleEdit}
            style={{
              background: "#0f62fe",
              borderColor: "#0f62fe",
              borderRadius: 0,
              minWidth: 60,
              minHeight: 32,
            }}
          >
            Edit
          </Button>
        ) : (
          <Space size="small">
            <Button
              size="small"
              onClick={handleCancel}
              style={{
                borderRadius: 0,
                minWidth: 60,
                minHeight: 32,
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={handleDone}
              style={{
                background: "#0f62fe",
                borderColor: "#0f62fe",
                borderRadius: 0,
                minWidth: 60,
                minHeight: 32,
              }}
            >
              Done
            </Button>
          </Space>
        )}
        <button
          onClick={onClose}
          aria-label="Close"
          className="ant-drawer-close"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            color: "#525252",
            fontSize: 16,
            lineHeight: 1,
            flexShrink: 0,
            minWidth: 44,
            minHeight: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );

  /* ── Mobile: bottom sheet, adaptive height, scrollable body ── */
  if (isMobile) {
    return (
      <Drawer
        title={drawerTitle}
        placement="bottom"
        height="auto"
        onClose={onClose}
        open={open}
        mask={false}
        maskClosable={true}
        keyboard={false}
        closable={false}
        aria-label="Node Configuration"
        styles={{
          wrapper: {
            minHeight: "40dvh",
            maxHeight: "70dvh",
            boxShadow: "0 -2px 6px rgba(0,0,0,0.3)",
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            overflow: "hidden",
          },
          content: {
            display: "flex",
            flexDirection: "column",
            minHeight: "40dvh",
            maxHeight: "70dvh",
          },
          header: {
            borderBottom: "1px solid #c6c6c6",
            padding: "12px 16px",
            flexShrink: 0,
            background: "#f4f4f4",
          },
          body: {
            flex: "1 1 0",
            minHeight: 0,
            overflowY: "auto",
            padding: "16px",
            paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
            background: "#ffffff",
          },
        }}
      >
        {renderContent()}
      </Drawer>
    );
  }

  /* ── Desktop: right drawer, draggable left edge to resize ── */
  return (
    <Drawer
      title={drawerTitle}
      placement="right"
      onClose={onClose}
      open={open}
      width={drawerWidth}
      closable={false}
      maskClosable={true}
      keyboard={true}
      aria-label="Node Configuration"
      styles={{
        header: { borderBottom: "1px solid #c6c6c6", padding: "12px 16px", background: "#f4f4f4" },
        body: { padding: "16px", position: "relative", overflowY: "auto", background: "#ffffff" },
      }}
    >
      {/* Drag handle — left edge of drawer body */}
      <div
        onPointerDown={onResizePointerDown}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          cursor: "ew-resize",
          zIndex: 10,
          background: "transparent",
          transition: "background 0.15s",
          userSelect: "none",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLDivElement).style.background =
            "rgba(15,98,254,0.12)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLDivElement).style.background = "transparent")
        }
        title="Drag to resize panel"
      />
      {renderContent()}
    </Drawer>
  );
};

export default WorkflowDrawer;
