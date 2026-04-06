import React from "react";
import { Layout, Button, Tooltip, Divider } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Plugin, PluginMetadataMap, PluginDisplayName, pluginMenuList } from "@/types/plugins";

const { Sider } = Layout;

type WorkflowSiderProps = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
};

export const WorkflowSider: React.FC<WorkflowSiderProps> = ({
  collapsed,
  setCollapsed,
}) => {
  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: Plugin
  ) => {
    event.dataTransfer.setData("application/@xyflow/react", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <Sider
      width={180}
      collapsible
      collapsed={collapsed}
      trigger={null}
      collapsedWidth={44}
      theme="light"
      onCollapse={(value: boolean) => setCollapsed(value)}
      className="overflow-y-auto border-r border-zinc-200 bg-white"
      style={{ background: "#FFFFFF" }}
    >
      <div className="flex flex-col h-full">
        {/* Collapse toggle */}
        <div className={`flex ${collapsed ? "justify-center" : "justify-end"} px-2 pt-2 pb-1`}>
          <Button
            type="text"
            size="small"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
          />
        </div>

        {pluginMenuList.map((group) => (
          <React.Fragment key={group.key}>
            {!collapsed && (
              <div className="px-3 pt-3 pb-1">
                <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">
                  {group.label}
                </span>
              </div>
            )}

            {collapsed && <Divider className="my-1 border-zinc-100" />}

            <div className="flex flex-col gap-0.5 px-1.5">
              {group.children.map((child) => {
                const meta = PluginMetadataMap[child.key];
                const accent = meta.color ?? "#6B7280";
                const displayName = PluginDisplayName[child.key];
                return (
                  <Tooltip
                    title={collapsed ? displayName : undefined}
                    key={child.key}
                    placement="right"
                  >
                    <div
                      draggable
                      onDragStart={(event) => onDragStart(event, child.key)}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-grab
                        hover:bg-zinc-50 transition-colors duration-100 group"
                    >
                      {/* Colored icon badge */}
                      <span
                        className="flex items-center justify-center w-[22px] h-[22px] rounded text-[12px] shrink-0"
                        style={{ backgroundColor: `${accent}18`, color: accent }}
                      >
                        {child.icon}
                      </span>
                      {!collapsed && (
                        <span className="text-[11px] font-medium text-zinc-600 group-hover:text-zinc-900 leading-none truncate">
                          {displayName}
                        </span>
                      )}
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          </React.Fragment>
        ))}
      </div>
    </Sider>
  );
};
