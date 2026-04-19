import React from "react";
import { Node } from "@xyflow/react";
import { carbonConfirm } from "@/components/CarbonModal";
import { useToast } from "@/contexts/ToastContext";

interface NodeContextMenuProps {
  node: Node;
  position: { x: number; y: number };
  onClose: () => void;
  onDuplicate: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  getConnectedEdges: (nodeId: string) => unknown[];
}

const MENU_ITEM_STYLE: React.CSSProperties = {
  display: "block", width: "100%", padding: "8px 16px",
  background: "none", border: "none", textAlign: "left",
  fontSize: 13, fontFamily: "inherit", cursor: "pointer",
  color: "#161616",
};

export const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  node,
  position,
  onClose,
  onDuplicate,
  onDelete,
  getConnectedEdges,
}) => {
  const { showToast } = useToast();

  const handleCopyToClipboard = () => {
    const config = JSON.stringify(node.data, null, 2);
    navigator.clipboard.writeText(config);
    showToast("Node configuration copied to clipboard", "success");
    onClose();
  };

  const handleDuplicate = () => {
    onDuplicate(node.id);
    showToast("Node duplicated", "success");
    onClose();
  };

  const handleDelete = () => {
    const edges = getConnectedEdges(node.id);
    if (edges.length > 0) {
      carbonConfirm({
        title: "Delete Node",
        content: `This node has ${edges.length} connection(s). Delete anyway?`,
        okText: "Delete",
        okType: "danger",
        onOk: () => {
          onDelete(node.id);
          showToast("Node deleted", "success");
          onClose();
        },
      });
    } else {
      onDelete(node.id);
      showToast("Node deleted", "success");
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div style={{ position: "fixed", inset: 0, zIndex: 999 }} onClick={onClose} />
      {/* Menu */}
      <div
        style={{
          position: "fixed", left: position.x, top: position.y, zIndex: 1000,
          background: "#fff", border: "1px solid #c6c6c6",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)", minWidth: 180,
        }}
      >
        <button
          style={MENU_ITEM_STYLE}
          onClick={handleCopyToClipboard}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f4f4f4"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
        >
          ⊕ Copy to Clipboard
        </button>
        <button
          style={MENU_ITEM_STYLE}
          onClick={handleDuplicate}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#f4f4f4"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
        >
          ⊞ Duplicate Node
        </button>
        <div style={{ height: 1, background: "#e0e0e0", margin: "4px 0" }} />
        <button
          style={{ ...MENU_ITEM_STYLE, color: "#da1e28" }}
          onClick={handleDelete}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#fff1f1"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
        >
          ✕ Delete
        </button>
      </div>
    </>
  );
};
