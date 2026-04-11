import React, { useState, useRef, useCallback } from "react";
import { Drawer, Empty } from "antd";
import { Node } from "@xyflow/react";
import { Plugin } from "@/types/plugins";
import HttpCallForm from "./forms/HttpCallForm";
import LogicForm from "./forms/LogicForm";
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
  const resizeState = useRef({ active: false, startX: 0, startWidth: DEFAULT_WIDTH });

  const onResizePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
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

  const renderForm = () => {
    if (!selectedNode) {
      return <Empty description="Please select a node" />;
    }

    const nodeType = selectedNode.type as Plugin;
    const onValuesChange = (formData: PluginFormData) =>
      onFormChange?.(selectedNode.id, formData);

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
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest">
        Node Configuration
      </span>
      <span className="text-sm font-semibold text-zinc-900 leading-tight">
        {selectedNode ? String(selectedNode.data?.label || "Unnamed Node") : "Select a node"}
      </span>
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
        aria-label="Node Configuration"
        styles={{
          wrapper: {
            maxHeight: "70dvh",
            boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            overflow: "hidden",
          },
          content: {
            display: "flex",
            flexDirection: "column",
            maxHeight: "70dvh",
          },
          header: {
            borderBottom: "1px solid #E4E4E7",
            padding: "12px 16px",
            flexShrink: 0,
          },
          body: {
            flex: "1 1 0",
            minHeight: 0,
            overflowY: "auto",
            padding: "16px",
            paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
          },
        }}
      >
        {renderForm()}
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
      aria-label="Node Configuration"
      styles={{
        header: { borderBottom: "1px solid #E4E4E7", padding: "12px 16px" },
        body: { padding: "16px", position: "relative", overflowY: "auto" },
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
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLDivElement).style.background =
            "rgba(99,102,241,0.15)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLDivElement).style.background = "transparent")
        }
        title="Drag to resize panel"
      />
      {renderForm()}
    </Drawer>
  );
};

export default WorkflowDrawer;
