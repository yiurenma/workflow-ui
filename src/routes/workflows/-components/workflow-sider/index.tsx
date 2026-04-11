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
      className="overflow-y-auto"
      style={{ background: "#FFFFFF", borderRight: "1px solid var(--ql-border)" }}
    >
      <div className="flex flex-col h-full">
        {/* Collapse toggle */}
        <div className={`flex ${collapsed ? "justify-center" : "justify-end"} px-2 pt-2 pb-1`}>
          <Button
            type="text"
            size="small"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: "var(--ql-text-muted)" }}
          />
        </div>

        {pluginMenuList.map((group) => (
          <React.Fragment key={group.key}>
            {!collapsed && (
              <div className="px-3 pt-3 pb-1">
                <span
                  className="text-[9px] font-semibold uppercase tracking-widest"
                  style={{ color: "var(--ql-text-muted)" }}
                >
                  {group.label}
                </span>
              </div>
            )}

            {collapsed && (
              <Divider className="my-1" style={{ borderColor: "var(--ql-border-subtle)" }} />
            )}

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
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-grab transition-colors duration-100 group"
                      style={{}}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--ql-bg-hover)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = ""; }}
                    >
                      {/* Colored icon badge */}
                      <span
                        className="flex items-center justify-center w-[22px] h-[22px] rounded text-[12px] shrink-0"
                        style={{ backgroundColor: `${accent}18`, color: accent }}
                      >
                        {child.icon}
                      </span>
                      {!collapsed && (
                        <span
                          className="text-[11px] font-medium leading-none truncate"
                          style={{ color: "var(--ql-text-secondary)" }}
                        >
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
