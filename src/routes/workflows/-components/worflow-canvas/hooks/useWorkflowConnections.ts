import { Connection, Edge, useReactFlow, addEdge } from "@xyflow/react";
import { useCallback } from "react";
import { message } from "antd";

type UseWorkflowConnectionsProps = {
    setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
};

type UseWorkflowConnectionsReturn = {
    onConnect: (connection: Connection) => void;
};

/**
 * Hook to manage workflow node connections
 * Handles connection validation and creation
 */
export const useWorkflowConnections = ({ setEdges }: UseWorkflowConnectionsProps): UseWorkflowConnectionsReturn => {
    const { getNode, getEdges } = useReactFlow();

    const onConnect = useCallback(
        (connection: Connection) => {
            // Validation 1: Check if source and target are the same node
            if (connection.source === connection.target) {
                message.error("Cannot connect a node to itself");
                return;
            }

            // Get source and target nodes
            const sourceNode = getNode(connection.source as string);
            const targetNode = getNode(connection.target as string);

            if (!sourceNode || !targetNode) {
                return;
            }

            // Validation 3: Check for correct handle types
            if (
                (connection.sourceHandle?.includes("source") &&
                    connection.targetHandle?.includes("source")) ||
                (connection.sourceHandle?.includes("target") &&
                    connection.targetHandle?.includes("target"))
            ) {
                message.error("Invalid connection: Must connect from output to input");
                return;
            }

            // Validation 4: Check if the target handle already has a connection
            const edges = getEdges();
            const targetHandleHasConnection = edges.some(
                edge =>
                    edge.target === connection.target &&
                    edge.targetHandle === connection.targetHandle
            );

            if (targetHandleHasConnection) {
                message.error("This input already has a connection. Remove it first before creating a new one.");
                return;
            }

            // If all validations pass, add the edge
            setEdges((eds) => addEdge(connection, eds));
        },
        [getNode, getEdges, setEdges]
    );

    return {
        onConnect,
    };
}; 