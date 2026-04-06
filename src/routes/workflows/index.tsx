import { useEntitySettings, useDeleteApplication, useAutoCopyWorkflow } from "@/api/hooks/workflow";
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
  const autoCopyWorkflow = useAutoCopyWorkflow();
  const [copySource, setCopySource] = useState<string | null>(null);
  const [copyTargetName, setCopyTargetName] = useState("");

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

  const colTitle = (text: string) => (
    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">{text}</span>
  );

  const columns: ColumnsType<WorkflowEntitySettingRow> = [
    {
      title: colTitle("Application"),
      dataIndex: "applicationName",
      key: "applicationName",
      ellipsis: true,
      render: (text: string) => (
        <span className="font-medium text-zinc-800 text-sm">{text}</span>
      ),
    },
    {
      title: colTitle("Description"),
      key: "description",
      ellipsis: true,
      render: (_: unknown, r: WorkflowEntitySettingRow) => (
        <span className="text-zinc-500 text-sm">{r.eimId ?? r.defaultServiceAccount ?? r.region ?? "—"}</span>
      ),
    },
    {
      title: colTitle("Status"),
      dataIndex: "enabled",
      key: "enabled",
      width: 90,
      render: (v: boolean) =>
        v ? (
          <Tag color="green" className="text-[10px] font-medium">Active</Tag>
        ) : (
          <Tag className="text-[10px] font-medium text-zinc-400">Inactive</Tag>
        ),
    },
    {
      title: colTitle("Last updated"),
      dataIndex: "lastModifiedDateTime",
      key: "lastModifiedDateTime",
      width: 210,
      render: (v: string) => <span className="text-zinc-400 text-xs">{v ?? "—"}</span>,
    },
    {
      title: colTitle("Actions"),
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
            className="px-0"
            onClick={() => {
              setCopySource(record.applicationName);
              setCopyTargetName("");
            }}
          >
            Copy
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
    <Flex vertical gap="large" flex={1} className="p-8 bg-zinc-50 min-h-full">
      <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
        <div>
          <Typography.Title level={4} className="!mb-0 !text-zinc-900 !font-semibold tracking-tight">
            Applications
          </Typography.Title>
          <Typography.Text className="text-xs text-zinc-400">
            Manage and configure workflow applications
          </Typography.Text>
        </div>
        <Space>
          <Input.Search
            placeholder="Search application name"
            allowClear
            size="middle"
            style={{ width: 260 }}
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
            className="font-medium"
          >
            New application
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
          size="middle"
          pagination={{
            current: page + 1,
            pageSize,
            total: data?.totalElements ?? 0,
            showSizeChanger: false,
            onChange: (p: number) => setPage(p - 1),
          }}
          className="bg-white rounded-lg shadow-sm border border-zinc-200"
          rowClassName={(_: WorkflowEntitySettingRow, index: number) =>
            index % 2 === 1 ? "bg-zinc-50" : ""
          }
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

      <Modal
        title="Copy workflow"
        open={copySource !== null}
        okText="Copy"
        confirmLoading={autoCopyWorkflow.isPending}
        onCancel={() => setCopySource(null)}
        onOk={async () => {
          if (!copySource) return;
          try {
            await autoCopyWorkflow.mutateAsync({
              fromApplicationName: copySource,
              toApplicationName: copyTargetName.trim(),
            });
            message.success("Workflow copied successfully");
            setCopySource(null);
          } catch (err: unknown) {
            const error = err as { errorInfo?: { code: string; detail?: { cause?: string } }[] };
            const cause = error?.errorInfo?.[0]?.detail?.cause;
            message.error(cause ?? "Copy failed");
          }
        }}
      >
        <Flex vertical gap="small">
          <Typography.Text>
            Copy from: <strong>{copySource}</strong>
          </Typography.Text>
          <Input
            placeholder="Target application name"
            value={copyTargetName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCopyTargetName(e.target.value)
            }
          />
        </Flex>
      </Modal>
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
