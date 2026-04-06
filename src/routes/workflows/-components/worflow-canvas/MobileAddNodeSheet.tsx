import React, { useState } from "react";
import { Drawer } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useReactFlow, Node } from "@xyflow/react";
import { humanId } from "human-id";
import { Plugin, PluginMetadataMap, PluginDisplayName, pluginMenuList } from "@/types/plugins";

type MobileAddNodeSheetProps = {
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
};

export const MobileAddNodeSheet: React.FC<MobileAddNodeSheetProps> = ({ setNodes }) => {
  const [open, setOpen] = useState(false);
  const { screenToFlowPosition } = useReactFlow();

  const addNodeAtCenter = (pluginType: Plugin) => {
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    const newNode: Node = {
      id: `${pluginType}_${humanId({ separator: "-", capitalize: false })}`,
      type: pluginType,
      position,
      data: {
        label: pluginType,
        icon: PluginMetadataMap[pluginType].icon,
      },
    };

    setNodes((nds) => nds.concat(newNode));
    setOpen(false);
  };

  return (
    <>
      {/* Floating + button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 left-4 z-50 w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center text-xl hover:bg-indigo-700 active:scale-95 transition-all"
        aria-label="Add node"
      >
        <PlusOutlined />
      </button>

      {/* Bottom sheet */}
      <Drawer
        title={
          <span className="text-sm font-semibold text-zinc-800">Add Node</span>
        }
        placement="bottom"
        height="auto"
        open={open}
        onClose={() => setOpen(false)}
        styles={{
          body: { padding: "12px 16px 24px" },
          header: { borderBottom: "1px solid #E4E4E7", padding: "12px 16px" },
        }}
      >
        {pluginMenuList.map((group) => (
          <div key={group.key} className="mb-3">
            <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
              {group.label}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {group.children.map((child) => {
                const meta = PluginMetadataMap[child.key];
                const accent = meta.color ?? "#6B7280";
                const displayName = PluginDisplayName[child.key];
                return (
                  <button
                    key={child.key}
                    onClick={() => addNodeAtCenter(child.key)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 active:scale-95 transition-all"
                  >
                    <span
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-base"
                      style={{ backgroundColor: `${accent}18`, color: accent }}
                    >
                      {child.icon}
                    </span>
                    <span className="text-[11px] font-medium text-zinc-600 text-center leading-tight">
                      {displayName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </Drawer>
    </>
  );
};
