import { Node } from "@xyflow/react";

export enum Plugin {
  CONSUMER = "Consumer",
  CONSUMER_WITHOUT_ERROR = "Consumer_Without_Error",
  MESSAGE = "Message",
  IF_ELSE = "If-Else",
  FUNCTION = "Function_V2",
  FUNCTION_V3 = "Function_V3",
}

/** Professional display labels shown in the UI — keys are Plugin enum values */
export const PluginDisplayName: Record<Plugin, string> = {
  [Plugin.CONSUMER]: "HTTP Fetch",
  [Plugin.CONSUMER_WITHOUT_ERROR]: "Safe Fetch",
  [Plugin.MESSAGE]: "Dispatch",
  [Plugin.IF_ELSE]: "Condition",
  [Plugin.FUNCTION]: "Transform",
  [Plugin.FUNCTION_V3]: "Transform+",
};

export type BaseNodeData = {
  label: string;
  color?: string;
  icon: React.ReactNode;
  backendPlugin?: unknown;
};

export type BaseNode = Node<BaseNodeData>;
export type IfElsePluginProps = BaseNode;
export type MessagePluginProps = BaseNode;
export type FunctionPluginProps = BaseNode;
export type ConsumerPluginProps = BaseNode;
export type ConsumerWithoutErrorPluginProps = BaseNode;
export type FunctionV3PluginProps = BaseNode;

/** Simple SVG/text icons replacing @ant-design/icons */
const IconHTTP = () => <span style={{ fontSize: 14 }}>↓</span>;
const IconSend = () => <span style={{ fontSize: 14 }}>→</span>;
const IconBranch = () => <span style={{ fontSize: 14 }}>⑂</span>;
const IconCode = () => <span style={{ fontSize: 13, fontFamily: "monospace" }}>{"{}"}</span>;
const IconShield = () => <span style={{ fontSize: 14 }}>⊙</span>;
const IconBolt = () => <span style={{ fontSize: 14 }}>⚡</span>;

export const PluginMetadataMap: Record<
  Plugin,
  {
    icon: React.ReactNode;
    color?: string;
    backgroundColor?: string;
    description: string;
  }
> = {
  [Plugin.CONSUMER]: {
    icon: <IconHTTP />,
    color: "#3B82F6",
    description: "Fetch data from external APIs",
  },
  [Plugin.MESSAGE]: {
    icon: <IconSend />,
    color: "#7C3AED",
    description: "Send messages to channels",
  },
  [Plugin.IF_ELSE]: {
    icon: <IconBranch />,
    color: "#D97706",
    description: "Branch based on conditions",
  },
  [Plugin.FUNCTION]: {
    icon: <IconCode />,
    color: "#059669",
    description: "Transform data with logic",
  },
  [Plugin.CONSUMER_WITHOUT_ERROR]: {
    icon: <IconShield />,
    color: "#0D9488",
    description: "Safe fetch without errors",
  },
  [Plugin.FUNCTION_V3]: {
    icon: <IconBolt />,
    color: "#0891B2",
    description: "Advanced data transform",
  },
};

export type PluginMenu = {
  label: string;
  key: string;
  icon: React.ReactNode;
  children: {
    key: Plugin;
    label: string;
    icon: React.ReactNode;
  }[];
};

export type PluginMenuGroup = PluginMenu[];

export const getPluginMenuList = (): PluginMenuGroup => {
  const group: PluginMenu = {
    label: "Nodes",
    key: "basic",
    icon: <span>⊞</span>,
    children: [],
  };

  Object.values(Plugin).forEach((plugin) => {
    group.children.push({
      key: plugin,
      label: PluginDisplayName[plugin],
      icon: PluginMetadataMap[plugin].icon,
    });
  });

  return [group];
};

export const pluginMenuList = getPluginMenuList();
