import React, { useState, useRef } from "react";
import { useReactFlow, Node } from "@xyflow/react";
import { humanId } from "human-id";
import { Plugin, PluginMetadataMap, PluginDisplayName, pluginMenuList } from "@/types/plugins";

const FAB_POS_KEY = "workflow_canvas_fab_pos";
const EDGE_MARGIN = 16;
const FAB_SIZE = 48;

function loadPos(): { x: number; y: number } {
  try {
    const raw = localStorage.getItem(FAB_POS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { x: EDGE_MARGIN, y: window.innerHeight - 96 };
}

type MobileAddNodeSheetProps = {
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
};

export const MobileAddNodeSheet: React.FC<MobileAddNodeSheetProps> = ({ setNodes }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(loadPos);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
  } | null>(null);
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

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (!dragRef.current.moved && Math.abs(dx) + Math.abs(dy) >= 5) {
      dragRef.current.moved = true;
    }
    setPos({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current) return;
    const { moved } = dragRef.current;
    dragRef.current = null;
    if (!moved) {
      setOpen(true);
      return;
    }
    const w = window.innerWidth;
    const snapX = e.clientX < w / 2 ? EDGE_MARGIN : w - EDGE_MARGIN - FAB_SIZE;
    const snapY = Math.min(
      Math.max(e.clientY - FAB_SIZE / 2, EDGE_MARGIN),
      window.innerHeight - EDGE_MARGIN - FAB_SIZE
    );
    const newPos = { x: snapX, y: snapY };
    setPos(newPos);
    localStorage.setItem(FAB_POS_KEY, JSON.stringify(newPos));
  };

  return (
    <>
      {/* Draggable floating + button */}
      <button
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          touchAction: "none",
          zIndex: 50,
          width: FAB_SIZE,
          height: FAB_SIZE,
          background: "#0f62fe",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          fontWeight: 300,
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        aria-label="Add node"
      >
        +
      </button>

      {/* Bottom sheet */}
      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 998, background: "rgba(0,0,0,0.3)" }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
              background: "#fff",
              borderTop: "1px solid #c6c6c6",
              boxShadow: "0 -4px 16px rgba(0,0,0,0.15)",
              maxHeight: "60vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #e0e0e0" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#161616" }}>Add Node</span>
              <button
                onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#525252", padding: "4px 8px" }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "12px 16px 24px" }}>
              {pluginMenuList.map((group) => (
                <div key={group.key} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#8d8d8d", textTransform: "uppercase", letterSpacing: "0.32px", marginBottom: 8 }}>
                    {group.label}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {group.children.map((child) => {
                      const meta = PluginMetadataMap[child.key];
                      const accent = meta.color ?? "#525252";
                      const displayName = PluginDisplayName[child.key];
                      return (
                        <button
                          key={child.key}
                          onClick={() => addNodeAtCenter(child.key)}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 6,
                            padding: 12,
                            background: "#fff",
                            border: "1px solid #e0e0e0",
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          <span style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 32,
                            height: 32,
                            background: `${accent}18`,
                            color: accent,
                            fontSize: 14,
                          }}>
                            {child.icon}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 500, color: "#525252", textAlign: "center", lineHeight: 1.3 }}>
                            {displayName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};
