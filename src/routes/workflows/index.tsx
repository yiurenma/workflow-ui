import { useEntitySettings, useDeleteApplication } from "@/api/hooks/workflow";
import {
  useWorkflowDialog,
  WorkflowDialogProvider,
} from "@/routes/workflows/-components/workflow-dialog/WorkflowDialogProvider";
import SettingsModal from "@/routes/workflows/-components/settings-modal";
import HistoryDrawer from "@/routes/workflows/-components/history-drawer";
import { PlusOutlined } from "@ant-design/icons";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Button,
  Flex,
  Input,
  Space,
  Spin,
  Table,
  Typography,
  Modal,
  message,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { WorkflowEntitySettingRow } from "@/api/types";
import React, { useMemo, useState } from "react";

export const Route = createFileRoute("/workflows/")({
  component: RouteComponent,
});

const pageSize = 20;

const ApplicationList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [settingsTarget, setSettingsTarget] = useState<WorkflowEntitySettingRow | null>(null);
  const [historyTarget, setHistoryTarget] = useState<string | null>(null);
  const { openCreateDialog } = useWorkflowDialog();
  const deleteApplication = useDeleteApplication();

  const params = useMemo(
    () => ({
      page,
      size: pageSize,
      sort: "lastModifiedDateTime,desc",
      ...(debounced.trim() ? { applicationName: debounced.trim() } : {}),
    }),
    [page, debounced]
  );

  const { data, isLoading, isFetching } = useEntitySettings(params);

  const onSearch = () => {
    setPage(0);
    setDebounced(search);
  };

  const columns: ColumnsType<WorkflowEntitySettingRow> = [
    {
      title: "Application name",
      dataIndex: "applicationName",
      key: "applicationName",
      ellipsis: true,
      render: (text: string) => (
        <span className="font-medium text-slate-800">{text}</span>
      ),
    },
    {
      title: "Description",
      key: "description",
      ellipsis: true,
      render: (_: unknown, r: WorkflowEntitySettingRow) =>
        r.eimId ?? r.defaultServiceAccount ?? r.region ?? "—",
    },
    {
      title: "Enabled",
      dataIndex: "enabled",
      key: "enabled",
      width: 100,
      render: (v: boolean) =>
        v ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>,
    },
    {
      title: "Last updated",
      dataIndex: "lastModifiedDateTime",
      key: "lastModifiedDateTime",
      width: 220,
      render: (v: string) => v ?? "—",
    },
    {
      title: "Actions",
      key: "actions",
      width: 260,
      render: (_: unknown, record: WorkflowEntitySettingRow) => (
        <Space>
          <Button
            type="link"
            className="px-0"
            onClick={() =>
              navigate({
                to: "/workflows/$applicationName",
                params: {
                  applicationName: record.applicationName,
                },
              })
            }
          >
            Open
          </Button>
          <Button
            type="link"
            className="px-0"
            onClick={() => setSettingsTarget(record)}
          >
            Settings
          </Button>
          <Button
            type="link"
            className="px-0"
            onClick={() => setHistoryTarget(record.applicationName)}
          >
            History
          </Button>
          <Button
            type="link"
            danger
            className="px-0"
            onClick={() => {
              Modal.confirm({
                title: "Delete application",
                content: `Delete workflow for "${record.applicationName}"?`,
                okText: "Delete",
                okType: "danger",
                onOk: async () => {
                  try {
                    await deleteApplication.mutateAsync(record.applicationName);
                    message.success("Deleted");
                  } catch {
                    message.error("Delete failed");
                  }
                },
              });
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Flex vertical gap="large" flex={1} className="p-8 bg-slate-50 min-h-full">
      <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
        <Typography.Title level={3} className="!mb-0 text-slate-800">
          Applications
        </Typography.Title>
        <Space>
          <Input.Search
            placeholder="Search by application name"
            allowClear
            style={{ width: 280 }}
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
            onSearch={onSearch}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateDialog}
          >
            Create application
          </Button>
        </Space>
      </Flex>

      <Spin spinning={isLoading || isFetching}>
        <Table<WorkflowEntitySettingRow>
          rowKey={(r: WorkflowEntitySettingRow) =>
            String(r.id ?? r.applicationName)
          }
          columns={columns}
          dataSource={data?.content ?? []}
          pagination={{
            current: page + 1,
            pageSize,
            total: data?.totalElements ?? 0,
            showSizeChanger: false,
            onChange: (p: number) => setPage(p - 1),
          }}
          className="bg-white rounded-lg shadow-sm"
        />
      </Spin>

      <SettingsModal
        open={settingsTarget !== null}
        record={settingsTarget}
        onClose={() => setSettingsTarget(null)}
      />

      <HistoryDrawer
        open={historyTarget !== null}
        applicationName={historyTarget}
        onClose={() => setHistoryTarget(null)}
      />
    </Flex>
  );
};

function RouteComponent() {
  return (
    <WorkflowDialogProvider>
      <ApplicationList />
    </WorkflowDialogProvider>
  );
}
