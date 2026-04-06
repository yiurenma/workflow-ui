import { Node } from "@xyflow/react";
import {
  BranchesOutlined,
  CloudDownloadOutlined,
  CodeOutlined,
  FolderOutlined,
  SafetyCertificateOutlined,
  SendOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";

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

export const PluginMetadataMap: Record<
  Plugin,
  {
    icon: React.ReactNode;
    color?: string;
    backgroundColor?: string;
  }
> = {
  [Plugin.CONSUMER]: {
    icon: <CloudDownloadOutlined />,
    color: "#3B82F6",
  },
  [Plugin.MESSAGE]: {
    icon: <SendOutlined />,
    color: "#7C3AED",
  },
  [Plugin.IF_ELSE]: {
    icon: <BranchesOutlined />,
    color: "#D97706",
  },
  [Plugin.FUNCTION]: {
    icon: <CodeOutlined />,
    color: "#059669",
  },
  [Plugin.CONSUMER_WITHOUT_ERROR]: {
    icon: <SafetyCertificateOutlined />,
    color: "#0D9488",
  },
  [Plugin.FUNCTION_V3]: {
    icon: <ThunderboltOutlined />,
    color: "#0891B2",
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
    icon: <FolderOutlined />,
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
