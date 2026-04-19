import React from "react";
import { Plugin, PluginMetadataMap, PluginDisplayName, pluginMenuList } from "@/types/plugins";

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
    <div
      className="sider"
      style={{ width: collapsed ? 44 : 176, flexShrink: 0 }}
    >
      {/* Collapse toggle */}
      <div style={{ display: "flex", justifyContent: collapsed ? "center" : "flex-end", padding: "6px 8px" }}>
        <button
          style={{ background: "none", border: "none", cursor: "pointer", color: "#525252", fontSize: 14, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? "▶" : "◀"}
        </button>
      </div>

      {pluginMenuList.map((group) => (
        <React.Fragment key={group.key}>
          {!collapsed && (
            <div style={{ padding: "0 12px 6px", fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.32px", color: "#525252" }}>
              {group.label}
            </div>
          )}

          {collapsed && (
            <div style={{ margin: "4px 0", height: 1, background: "#c6c6c6", opacity: 0.4 }} />
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 6px" }}>
            {group.children.map((child) => {
              const meta = PluginMetadataMap[child.key];
              const accent = meta.color ?? "#525252";
              const displayName = PluginDisplayName[child.key];
              const description = meta.description;
              return (
                <div
                  key={child.key}
                  className="sider-item"
                  draggable
                  onDragStart={(event) => onDragStart(event, child.key)}
                  title={collapsed ? `${displayName}: ${description}` : undefined}
                  style={{ padding: "8px 10px", borderRadius: 0 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        width: 22, height: 22,
                        background: `${accent}18`,
                        color: accent,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700, flexShrink: 0,
                        borderRadius: 0,
                      }}
                    >
                      {child.icon}
                    </span>
                    {!collapsed && (
                      <span style={{ fontSize: 11, fontWeight: 500, color: "#525252", letterSpacing: "0.16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {displayName}
                      </span>
                    )}
                  </div>
                  {!collapsed && (
                    <span style={{ fontSize: 10, color: "#8d8d8d", paddingLeft: 30, lineHeight: 1.3 }}>
                      {description}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};
