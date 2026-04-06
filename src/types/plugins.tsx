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
  },
  [Plugin.MESSAGE]: {
    icon: <SendOutlined />,
  },
  [Plugin.IF_ELSE]: {
    icon: <BranchesOutlined />,
  },
  [Plugin.FUNCTION]: {
    icon: <CodeOutlined />,
  },
  [Plugin.CONSUMER_WITHOUT_ERROR]: {
    icon: <SafetyCertificateOutlined />,
  },
  [Plugin.FUNCTION_V3]: {
    icon: <ThunderboltOutlined />,
  },
};

export type PluginMenu = {
  label: string;
  key: string;
  icon: React.ReactNode;
  children: {
    key: Plugin;
    label: Plugin;
    icon: React.ReactNode;
  }[];
};

export type PluginMenuGroup = PluginMenu[];

export const getPluginMenuList = (): PluginMenuGroup => {
  const group: PluginMenu = {
    label: "Basic",
    key: "basic",
    icon: <FolderOutlined />,
    children: [],
  };

  Object.values(Plugin).forEach((plugin) => {
    group.children.push({
      key: plugin,
      label: plugin,
      icon: PluginMetadataMap[plugin].icon,
    });
  });

  return [group];
};

export const pluginMenuList = getPluginMenuList();
