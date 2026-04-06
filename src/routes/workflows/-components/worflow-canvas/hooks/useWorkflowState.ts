import {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  OnNodesChange,
  OnEdgesChange,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import { useEffect, useCallback } from 'react';
import type { WorkFlow } from '@/api/types';
import { workFlowToNodesAndEdges } from '@/api/mappers/workFlowMapper';

type UseWorkflowStateProps = {
  workFlow?: WorkFlow | null;
  applicationName?: string;
  onWorkflowChange?: (nodes: Node[], edges: Edge[]) => void;
};

type UseWorkflowStateReturn = {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
};

export const useWorkflowState = ({
  workFlow,
  applicationName,
  onWorkflowChange,
}: UseWorkflowStateProps): UseWorkflowStateReturn => {
  const [nodes, setNodes] = useNodesState<Node>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds: Node[]) => applyNodeChanges(changes, nds) as Node[]);
    },
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds: Edge[]) => applyEdgeChanges(changes, eds) as Edge[]);
    },
    [setEdges]
  );

  useEffect(() => {
    if (workFlow != null) {
      const mapped = workFlowToNodesAndEdges(workFlow);
      setNodes(mapped.nodes);
      setEdges(mapped.edges);
    } else if (applicationName) {
      setNodes([]);
      setEdges([]);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [applicationName, workFlow, setNodes, setEdges]);

  useEffect(() => {
    if (onWorkflowChange && (nodes.length > 0 || edges.length > 0)) {
      onWorkflowChange(nodes, edges);
    }
  }, [nodes, edges, onWorkflowChange]);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
  };
};
