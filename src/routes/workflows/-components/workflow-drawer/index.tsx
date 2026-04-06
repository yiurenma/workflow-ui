import React from "react";
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

const WorkflowDrawer: React.FC<WorkflowDrawerProps> = ({
  open,
  onClose,
  selectedNode,
  onFormChange,
}) => {
  const isMobile = useIsMobile();
  // Render form based on node type
  const renderForm = () => {
    if (!selectedNode) {
      return <Empty description="Please select a node" />;
    }

    const nodeType = selectedNode.type as Plugin;
    const onValuesChange = (formData: PluginFormData) => onFormChange?.(selectedNode.id, formData);

    switch (nodeType) {
      // Group 1 — HTTP-call nodes
      case Plugin.CONSUMER:
      case Plugin.CONSUMER_WITHOUT_ERROR:
      case Plugin.MESSAGE:
        return <HttpCallForm selectedNode={selectedNode} onValuesChange={onValuesChange} />;

      // Group 2 — Logic nodes
      case Plugin.IF_ELSE:
      case Plugin.FUNCTION:
      case Plugin.FUNCTION_V3:
        return <LogicForm selectedNode={selectedNode} onValuesChange={onValuesChange} />;

      default:
        return (
          <Empty
            description={`Configuration for ${nodeType} nodes is not supported yet`}
          />
        );
    }
  };

  return (
    <Drawer
      title={
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">
            Node Configuration
          </span>
          <span className="text-sm font-semibold text-zinc-900 leading-tight">
            {selectedNode
              ? (String(selectedNode.data?.label || "Unnamed Node"))
              : "Select a node"}
          </span>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={isMobile ? "100%" : 420}
      className="pb-20"
      styles={{
        header: {
          borderBottom: "1px solid #E4E4E7",
          padding: "12px 16px",
        },
        body: {
          padding: "16px",
        },
      }}
    >
      {renderForm()}
    </Drawer>
  );
};

export default WorkflowDrawer;
