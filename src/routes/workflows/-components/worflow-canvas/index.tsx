import React, { useCallback, useEffect } from "react";
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
  useReactFlow,
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

const X_COLUMN = 300;
const Y_STEP = 120;

/** Sort nodes top-to-bottom, reassign y positions in equal increments. */
function straightenNodes(nodes: Node[]): Node[] {
  const sorted = [...nodes].sort((a, b) => a.position.y - b.position.y);
  return sorted.map((node, i) => ({
    ...node,
    position: { x: X_COLUMN, y: i * Y_STEP },
  }));
}

/** Registers the straighten action into the provided ref so the parent can call it. */
function StraightenRegistrar({
  setNodes,
  straightenRef,
}: {
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  straightenRef: React.MutableRefObject<(() => void) | null>;
}) {
  const { fitView } = useReactFlow();
  useEffect(() => {
    straightenRef.current = () => {
      setNodes((prev) => straightenNodes(prev));
      setTimeout(() => fitView({ duration: 300 }), 50);
    };
    return () => { straightenRef.current = null; };
  }, [setNodes, fitView, straightenRef]);
  return null;
}

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

// Default edge options — warm gray tones to match the quiet luxury palette
const defaultEdgeOptions = {
  animated: false,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "#C4BEB9",
  },
  type: "buttonEdge",
  style: {
    strokeWidth: 1.5,
    stroke: "#C4BEB9",
  },
  zIndex: 1001,
};

export type WorkflowEditorProps = {
  applicationName: string;
  workFlow?: WorkFlow | null;
  onWorkflowChange?: (nodes: Node[], edges: Edge[]) => void;
  straightenRef?: React.MutableRefObject<(() => void) | null>;
};

/**
 * WorkflowEditor Component
 * A visual editor for creating and editing workflows using React Flow
 */
const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  applicationName,
  workFlow,
  onWorkflowChange,
  straightenRef,
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
          color="#D8D3CE"
          style={{ background: "#F8F7F5" }}
        />
        {straightenRef && <StraightenRegistrar setNodes={setNodes} straightenRef={straightenRef} />}
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
