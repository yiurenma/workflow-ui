import React from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
  ConnectionMode,
  MarkerType,
  Node,
  Edge,
} from "@xyflow/react";
import { Plugin } from "@/types/plugins";
import { FunctionPlugin } from "./convas/plugins/function-plugin";
import type { WorkFlow } from "@/api/types";
import WorkflowDrawer from "../workflow-drawer";
import { IfElsePlugin } from "./convas/plugins/iflese-plugin";
import { ButtonEdge } from "./convas/edge";
import { useWorkflowState } from "./hooks/useWorkflowState";
import { useWorkflowConnections } from "./hooks/useWorkflowConnections";
import { useWorkflowDragDrop } from "./hooks/useWorkflowDragDrop";
import { useWorkflowForm } from "./hooks/useWorkflowForm";
import { ConsumerPlugin } from "./convas/plugins/consumer-plugin";
import { MessagePlugin } from "./convas/plugins/message-plugin";
import { ConsumerWithoutErrorPlugin } from "./convas/plugins/consumer-without-error-plugin";
import { FunctionV3Plugin } from "./convas/plugins/function-v3-plugin";
import { useIsMobile } from "@/hooks/useIsMobile";
import { MobileAddNodeSheet } from "./MobileAddNodeSheet";

// Node type mapping
const nodeTypes: NodeTypes = {
  [Plugin.FUNCTION]: FunctionPlugin,
  [Plugin.IF_ELSE]: IfElsePlugin,
  [Plugin.MESSAGE]: MessagePlugin,
  [Plugin.CONSUMER]: ConsumerPlugin,
  [Plugin.CONSUMER_WITHOUT_ERROR]: ConsumerWithoutErrorPlugin,
  [Plugin.FUNCTION_V3]: FunctionV3Plugin,
} as const;

// Edge type mapping
const edgeTypes: EdgeTypes = {
  buttonEdge: ButtonEdge,
};

// Default edge options
const defaultEdgeOptions = {
  animated: false,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "#94A3B8",
  },
  type: "buttonEdge",
  style: {
    strokeWidth: 1.5,
    stroke: "#94A3B8",
  },
  zIndex: 1001,
};

export type WorkflowEditorProps = {
  applicationName: string;
  workFlow?: WorkFlow | null;
  onWorkflowChange?: (nodes: Node[], edges: Edge[]) => void;
};

/**
 * WorkflowEditor Component
 * A visual editor for creating and editing workflows using React Flow
 */
const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  applicationName,
  workFlow,
  onWorkflowChange,
}) => {
  const isMobile = useIsMobile();

  // Initialize workflow state
  const { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange } =
    useWorkflowState({ applicationName, workFlow, onWorkflowChange });

  // Initialize connection handlers
  const { onConnect } = useWorkflowConnections({ setEdges });

  // Initialize drag and drop handlers
  const { onDragOver, onDrop } = useWorkflowDragDrop({ setNodes });

  // Initialize form handlers
  const {
    selectedNode,
    drawerOpen,
    onNodeClick,
    onDrawerClose,
    onNodeFormChange,
  } = useWorkflowForm({ setNodes });

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={defaultEdgeOptions}
        deleteKeyCode={["Delete", "Backspace"]}
        panOnDrag={true}
        minZoom={0.3}
      >
        <Controls />
        {!isMobile && <MiniMap />}
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#CBD5E1"
          className="bg-zinc-50"
        />
        {isMobile && <MobileAddNodeSheet setNodes={setNodes} />}
      </ReactFlow>
      <WorkflowDrawer
        open={drawerOpen}
        onClose={onDrawerClose}
        selectedNode={selectedNode}
        onFormChange={onNodeFormChange}
      />
    </>
  );
};

export default WorkflowEditor;
