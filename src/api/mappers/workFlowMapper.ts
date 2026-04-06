import { Node, Edge } from '@xyflow/react';
import { Plugin, PluginMetadataMap } from '@/types/plugins';
import type {
  BackendPlugin,
  BackendWorkflowRule,
  BackendWorkflowType,
  WorkFlow,
} from '@/api/types/operation';


export function backendTypeToPlugin(t: string): Plugin {
  const u = (t || '').toUpperCase().replace(/-/g, '');
  if (u === 'CONSUMER') return Plugin.CONSUMER;
  if (u === 'CONSUMERWITHOUTERROR') return Plugin.CONSUMER_WITHOUT_ERROR;
  if (u === 'IFELSE') return Plugin.IF_ELSE;
  if (u === 'MESSAGE') return Plugin.MESSAGE;
  if (u === 'FUNCTION_V2' || u === 'FUNCTION') return Plugin.FUNCTION;
  if (u === 'FUNCTION_V3') return Plugin.FUNCTION_V3;
  return Plugin.FUNCTION;
}

export function pluginToBackendType(p: Plugin): string {
  switch (p) {
    case Plugin.CONSUMER:
      return 'CONSUMER';
    case Plugin.CONSUMER_WITHOUT_ERROR:
      return 'CONSUMERWITHOUTERROR';
    case Plugin.IF_ELSE:
      return 'IFELSE';
    case Plugin.MESSAGE:
      return 'MESSAGE';
    case Plugin.FUNCTION:
      return 'FUNCTION_V2';
    case Plugin.FUNCTION_V3:
      return 'FUNCTION_V3';
    default:
      return 'CONSUMER';
  }
}

function isEdgeLike(u: unknown): u is Record<string, string> {
  return (
    typeof u === 'object' &&
    u !== null &&
    'source' in u &&
    'target' in u &&
    typeof (u as { source: unknown }).source === 'string'
  );
}

export function workFlowToNodesAndEdges(workFlow: WorkFlow | null | undefined): {
  nodes: Node[];
  edges: Edge[];
} {
  if (!workFlow?.pluginList?.length) {
    return { nodes: [], edges: [] };
  }

  const nodes: Node[] = [];
  for (const p of workFlow.pluginList) {
    const ui = p.uiMap as Record<string, unknown> | undefined;
    if (!ui || typeof ui.id !== 'string') continue;
    const typeStr = String(ui.type ?? 'CONSUMER');
    const pluginType = backendTypeToPlugin(typeStr);
    const measured = ui.measured as { width?: number; height?: number } | undefined;
    nodes.push({
      id: ui.id as string,
      type: pluginType,
      position: (ui.position as { x: number; y: number }) || { x: 100, y: 100 },
      data: {
        label: (p.description as string) || typeStr,
        icon: PluginMetadataMap[pluginType]?.icon,
        backendPlugin: p,
      },
      ...(measured?.width != null && measured?.height != null
        ? { width: measured.width, height: measured.height }
        : {}),
    });
  }

  const edges: Edge[] = (workFlow.uiMapList || [])
    .filter(isEdgeLike)
    .map((raw, i) => ({
      ...(raw as unknown as Edge),
      id: (raw as { id?: string }).id || `edge-${i}`,
      type: (raw as { type?: string }).type || 'buttonEdge',
    }));

  return { nodes, edges };
}

function minimalRule(): BackendWorkflowRule {
  return { key: '', remark: '' };
}

function minimalAction(type: string): BackendWorkflowType {
  return {
    provider: 'SYSTEM',
    type,
    remark: '',
  };
}

function buildPluginForNewNode(node: Node, numericId: number): BackendPlugin {
  const typeStr = pluginToBackendType(node.type as Plugin);
  return {
    id: numericId,
    description: String(node.data?.label ?? typeStr),
    linkingIdOfRuleListAndAction: '',
    ruleList: [minimalRule()],
    action: minimalAction(typeStr),
    uiMap: {
      id: node.id,
      type: typeStr,
      position: node.position,
      measured: {
        width: (node.measured?.width as number) ?? (node as { width?: number }).width ?? 160,
        height: (node.measured?.height as number) ?? (node as { height?: number }).height ?? 38,
      },
    },
  };
}

export function mergeCanvasIntoWorkFlow(
  base: WorkFlow,
  nodes: Node[],
  edges: Edge[]
): WorkFlow {
  const cloned: WorkFlow = JSON.parse(
    JSON.stringify(base ?? { pluginList: [], uiMapList: [] })
  );
  const prevPlugins = [...(cloned.pluginList ?? [])];
  let maxId = Math.max(0, ...prevPlugins.map((p) => p.id ?? 0));

  const resultPlugins: BackendPlugin[] = [];

  for (const node of nodes) {
    if (node.id === 'start-node') continue;

    const existing = prevPlugins.find(
      (p) => (p.uiMap as { id?: string } | undefined)?.id === node.id
    );

    // Prefer node.data.backendPlugin (reflects drawer edits) over prevPlugins (server snapshot)
    const fromNodeData = node.data?.backendPlugin as BackendPlugin | undefined;
    const base = fromNodeData ?? existing;

    if (base) {
      const uiSource = fromNodeData
        ? ((typeof fromNodeData.uiMap === 'object' && fromNodeData.uiMap !== null ? fromNodeData.uiMap : {}) as object)
        : ((typeof existing!.uiMap === 'object' && existing!.uiMap !== null ? existing!.uiMap : {}) as object);
      const ui = {
        ...uiSource,
        id: node.id,
        position: node.position,
        measured: {
          width:
            (node.measured?.width as number) ??
            (node as { width?: number }).width ??
            160,
          height:
            (node.measured?.height as number) ??
            (node as { height?: number }).height ??
            38,
        },
      };
      resultPlugins.push({
        ...base,
        id: base.id ?? (maxId + 1),
        description: String(node.data?.label ?? base.description),
        uiMap: ui,
      });
    } else {
      maxId += 1;
      resultPlugins.push(buildPluginForNewNode(node, maxId));
    }
  }

  const uiMapList = edges
    .filter((e) => e.source !== 'start-node' && e.target !== 'start-node')
    .map((e) => ({
      animated: true,
      markerEnd: { type: 'arrowclosed' },
      type: e.type || 'buttonEdge',
      style: { strokeWidth: 2 },
      zIndex: 1001,
      source: e.source,
      sourceHandle: e.sourceHandle ?? 'source-handle',
      target: e.target,
      targetHandle: e.targetHandle ?? 'target-handle',
      id: e.id,
    }));

  return {
    pluginList: resultPlugins,
    uiMapList,
  };
}
