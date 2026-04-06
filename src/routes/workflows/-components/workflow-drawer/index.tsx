import React from "react";
import { Drawer, Typography, Empty } from "antd";
import { Node } from "@xyflow/react";
import { Plugin } from "@/types/plugins";
import HttpCallForm from "./forms/HttpCallForm";
import LogicForm from "./forms/LogicForm";
import { type PluginFormData } from "@/routes/workflows/-components/worflow-canvas/hooks/useWorkflowForm";
const { Title } = Typography;

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
        <Title level={4}>
          {selectedNode
            ? `Configure: ${selectedNode.data?.label || "Unnamed Node"}`
            : "Node Configuration"}
        </Title>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={400}
      className="pb-20"
    >
      {renderForm()}
    </Drawer>
  );
};

export default WorkflowDrawer;
