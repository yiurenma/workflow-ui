import React, { useState } from "react";
import { Drawer, Table, Typography, Modal, message, Spin, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEntitySettingHistory } from "@/api/hooks/workflow";
import { operationApi } from "@/api/services/operation";
import { useQueryClient } from "@tanstack/react-query";
import type { HistoryRevision, WorkFlow } from "@/api/types";

type HistoryDrawerProps = {
  open: boolean;
  applicationName: string | null;
  onClose: () => void;
};

const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ open, applicationName, onClose }) => {
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  const { data, isLoading } = useEntitySettingHistory(applicationName ?? "", page);

  const handleRollback = (revision: HistoryRevision) => {
    Modal.confirm({
      title: "Rollback to this version?",
      content: `This will restore the workflow definition to revision #${revision.revisionNumber}. Entity settings (asyncMode, retry, etc.) are not affected.`,
      okText: "Rollback",
      okType: "primary",
      onOk: async () => {
        try {
          const workflowField = revision.entity?.workflow;
          let payload: WorkFlow;
          if (workflowField) {
            payload = JSON.parse(atob(workflowField)) as WorkFlow;
          } else {
            message.warning("No workflow payload found in this revision");
            return;
          }
          await operationApi.saveWorkflow(applicationName!, payload);
          queryClient.invalidateQueries({ queryKey: ["workflow"] });
          message.success(`Rolled back to revision #${revision.revisionNumber}`);
        } catch {
          message.error("Rollback failed");
        }
      },
    });
  };

  const columns: ColumnsType<HistoryRevision> = [
    {
      title: "Revision",
      dataIndex: "revisionNumber",
      key: "revisionNumber",
      width: 80,
    },
    {
      title: "Timestamp",
      dataIndex: "revisionInstant",
      key: "revisionInstant",
      render: (v: string) => v ?? "—",
    },
    {
      title: "Change Type",
      dataIndex: "revisionType",
      key: "revisionType",
      width: 100,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: unknown, record: HistoryRevision) => (
        <Button type="link" className="px-0" onClick={() => handleRollback(record)}>
          Rollback
        </Button>
      ),
    },
  ];

  return (
    <Drawer
      title={
        <Typography.Title level={4} className="!mb-0">
          History — {applicationName}
        </Typography.Title>
      }
      placement="right"
      width={640}
      open={open}
      onClose={onClose}
    >
      <Spin spinning={isLoading}>
        <Table<HistoryRevision>
          rowKey={(r) => String(r.revisionNumber ?? Math.random())}
          columns={columns}
          dataSource={data?.content ?? []}
          pagination={{
            current: page + 1,
            pageSize: 20,
            total: data?.totalElements ?? 0,
            showSizeChanger: false,
            onChange: (p) => setPage(p - 1),
          }}
          size="small"
        />
      </Spin>
    </Drawer>
  );
};

export default HistoryDrawer;
