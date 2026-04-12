import React from 'react';
import { Menu } from 'antd';
import { CopyOutlined, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Node } from '@xyflow/react';
import { carbonConfirm } from '@/components/CarbonModal';
import { message } from 'antd';

interface NodeContextMenuProps {
  node: Node;
  position: { x: number; y: number };
  onClose: () => void;
  onDuplicate: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  getConnectedEdges: (nodeId: string) => any[];
}

export const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  node,
  position,
  onClose,
  onDuplicate,
  onDelete,
  getConnectedEdges,
}) => {
  const handleCopyToClipboard = () => {
    const config = JSON.stringify(node.data, null, 2);
    navigator.clipboard.writeText(config);
    message.success('Node configuration copied to clipboard');
    onClose();
  };

  const handleDuplicate = () => {
    onDuplicate(node.id);
    message.success('Node duplicated');
    onClose();
  };

  const handleDelete = () => {
    const edges = getConnectedEdges(node.id);
    if (edges.length > 0) {
      carbonConfirm({
        title: 'Delete Node',
        content: `This node has ${edges.length} connection(s). Delete anyway?`,
        okText: 'Delete',
        okButtonProps: { danger: true },
        onOk: () => {
          onDelete(node.id);
          message.success('Node deleted');
          onClose();
        },
      });
    } else {
      onDelete(node.id);
      message.success('Node deleted');
      onClose();
    }
  };

  return (
    <Menu
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
      items={[
        {
          key: 'copy',
          label: 'Copy to Clipboard',
          icon: <CopyOutlined />,
          onClick: handleCopyToClipboard,
        },
        {
          key: 'duplicate',
          label: 'Duplicate Node',
          icon: <PlusCircleOutlined />,
          onClick: handleDuplicate,
        },
        { type: 'divider' },
        {
          key: 'delete',
          label: 'Delete',
          icon: <DeleteOutlined />,
          danger: true,
          onClick: handleDelete,
        },
      ]}
    />
  );
};
