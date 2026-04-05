import { Node } from "@xyflow/react";
import { useCallback, useState } from "react";
import type { BackendPlugin, BackendWorkflowType } from "@/api/types/operation";
import type { HttpCallFormValues } from "@/routes/workflows/-components/workflow-drawer/forms/HttpCallForm";
import type { LogicFormValues } from "@/routes/workflows/-components/workflow-drawer/forms/LogicForm";

export type PluginFormData = HttpCallFormValues | LogicFormValues;

type UseWorkflowFormProps = {
    setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
};

type UseWorkflowFormReturn = {
    selectedNode: Node | null;
    drawerOpen: boolean;
    onNodeClick: (_: React.MouseEvent, node: Node) => void;
    onDrawerClose: () => void;
    onNodeFormChange: (nodeId: string, formData: PluginFormData) => void;
};

function formDataToBackendPlugin(
    prev: BackendPlugin | undefined,
    formData: PluginFormData
): BackendPlugin {
    const d = formData as Record<string, unknown>;

    const prevAction = (prev?.action ?? {}) as BackendWorkflowType;
    const updatedAction: BackendWorkflowType = {
        ...prevAction,
        ...(d.provider !== undefined ? { provider: d.provider as string } : {}),
        ...(d.type !== undefined ? { type: d.type as string } : {}),
        ...(d.remark !== undefined ? { remark: d.remark as string } : {}),
        ...(d.httpRequestMethod !== undefined ? { httpRequestMethod: d.httpRequestMethod as string } : {}),
        ...(d.httpRequestUrlWithQueryParameter !== undefined
            ? { httpRequestUrlWithQueryParameter: d.httpRequestUrlWithQueryParameter as string }
            : {}),
        ...(d.internalHttpRequestUrlWithQueryParameter !== undefined
            ? { internalHttpRequestUrlWithQueryParameter: d.internalHttpRequestUrlWithQueryParameter as string }
            : {}),
        ...(d.httpRequestHeaders !== undefined ? { httpRequestHeaders: d.httpRequestHeaders as string } : {}),
        ...(d.httpRequestBody !== undefined ? { httpRequestBody: d.httpRequestBody as string } : {}),
        ...(d.trackingNumberSchemaInHttpResponse !== undefined
            ? { trackingNumberSchemaInHttpResponse: d.trackingNumberSchemaInHttpResponse as string }
            : {}),
        ...(d.elseLogic !== undefined ? { elseLogic: d.elseLogic as string } : {}),
    };

    const ruleList = Array.isArray(d.ruleList)
        ? (d.ruleList as { key?: string; remark?: string }[])
        : prev?.ruleList;

    return {
        ...prev,
        description: d.description !== undefined ? (d.description as string) : prev?.description,
        ruleList: ruleList as BackendPlugin["ruleList"],
        action: updatedAction,
    };
}

export const useWorkflowForm = ({ setNodes }: UseWorkflowFormProps): UseWorkflowFormReturn => {
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
        setDrawerOpen(true);
    }, []);

    const onDrawerClose = useCallback(() => {
        setDrawerOpen(false);
    }, []);

    const onNodeFormChange = useCallback(
        (nodeId: string, formData: PluginFormData) => {
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === nodeId) {
                        const prevPlugin = node.data?.backendPlugin as BackendPlugin | undefined;
                        const updatedPlugin = formDataToBackendPlugin(prevPlugin, formData);
                        const d = formData as Record<string, unknown>;
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                label: d.description != null && d.description !== ""
                                    ? (d.description as string)
                                    : node.data.label,
                                backendPlugin: updatedPlugin,
                            },
                        };
                    }
                    return node;
                })
            );
        },
        [setNodes]
    );

    return {
        selectedNode,
        drawerOpen,
        onNodeClick,
        onDrawerClose,
        onNodeFormChange,
    };
};
