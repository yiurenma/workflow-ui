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
      style={{ background: "#ffffff", borderRight: "1px solid var(--cds-border-subtle)" }}
    >
      <div className="flex flex-col h-full">
        {/* Collapse toggle */}
        <div className={`flex ${collapsed ? "justify-center" : "justify-end"} px-2 pt-2 pb-1`}>
          <Button
            type="text"
            size="small"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: "#525252" }}
          />
        </div>

        {pluginMenuList.map((group) => (
          <React.Fragment key={group.key}>
            {!collapsed && (
              <div className="px-3 pt-3 pb-1">
                <span
                  className="text-[9px] font-semibold uppercase"
                  style={{ color: "#525252", letterSpacing: "0.32px" }}
                >
                  {group.label}
                </span>
              </div>
            )}

            {collapsed && (
              <Divider className="my-1" style={{ borderColor: "var(--cds-border-subtle)" }} />
            )}

            <div className="flex flex-col gap-0.5 px-1.5">
              {group.children.map((child) => {
                const meta = PluginMetadataMap[child.key];
                const accent = meta.color ?? "#525252";
                const displayName = PluginDisplayName[child.key];
                const description = meta.description;
                return (
                  <Tooltip
                    title={collapsed ? `${displayName}: ${description}` : undefined}
                    key={child.key}
                    placement="right"
                  >
                    <div
                      draggable
                      onDragStart={(event) => onDragStart(event, child.key)}
                      className="flex flex-col gap-1 px-2 py-2 cursor-grab transition-colors duration-100"
                      style={{ borderRadius: 0 }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--cds-layer-01)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = ""; }}
                    >
                      {/* Colored icon badge */}
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex items-center justify-center w-[22px] h-[22px] text-[12px] shrink-0"
                          style={{ backgroundColor: `${accent}18`, color: accent, borderRadius: 0 }}
                        >
                          {child.icon}
                        </span>
                        {!collapsed && (
                          <span
                            className="text-[11px] font-medium leading-none truncate"
                            style={{ color: "#525252", letterSpacing: "0.16px" }}
                          >
                            {displayName}
                          </span>
                        )}
                      </div>
                      {/* Description - only show when not collapsed */}
                      {!collapsed && (
                        <span
                          className="text-[10px] leading-tight"
                          style={{ color: "#525252", paddingLeft: "30px" }}
                        >
                          {description}
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
