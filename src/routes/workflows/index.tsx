import { useEntitySettings, useDeleteApplication, useAutoCopyWorkflow } from "@/api/hooks/workflow";
import {
  useWorkflowDialog,
  WorkflowDialogProvider,
} from "@/routes/workflows/-components/workflow-dialog/WorkflowDialogProvider";
import SettingsModal from "@/routes/workflows/-components/settings-modal";
import HistoryDrawer from "@/routes/workflows/-components/history-drawer";
import { EllipsisOutlined, PlusOutlined, RightOutlined } from "@ant-design/icons";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Button,
  Dropdown,
  Flex,
  Input,
  Pagination,
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
import React, { useMemo, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

export const Route = createFileRoute("/workflows/")({
  component: RouteComponent,
});

const pageSize = 5;
const DESKTOP_VIEW_KEY = "workflow_list_desktop_view";
const FAB_POS_KEY = "workflow_fab_pos";

function loadDesktopOverride(): boolean {
  try { return localStorage.getItem(DESKTOP_VIEW_KEY) === "true"; } catch { return false; }
}

function loadFabPos(): { x: number; y: number } {
  try {
    const s = localStorage.getItem(FAB_POS_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return { x: 24, y: 24 };
}

const ApplicationList = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [desktopOverride, setDesktopOverride] = useState(loadDesktopOverride);
  const showDesktop = !isMobile || desktopOverride;

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

  // Draggable FAB state
  const [fabPos, setFabPos] = useState<{ x: number; y: number }>(loadFabPos);
  const isDragging = useRef(false);
  const dragStart = useRef<{ px: number; py: number; fx: number; fy: number } | null>(null);

  const onFabPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = false;
    dragStart.current = { px: e.clientX, py: e.clientY, fx: fabPos.x, fy: fabPos.y };
  };

  const onFabPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.px;
    const dy = e.clientY - dragStart.current.py;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) isDragging.current = true;
    if (!isDragging.current) return;
    setFabPos({
      x: Math.max(8, dragStart.current.fx - dx),
      y: Math.max(8, dragStart.current.fy - dy),
    });
  };

  const onFabPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging.current) {
      openCreateDialog();
    } else {
      // Snap to nearest horizontal edge
      const snapX = fabPos.x > window.innerWidth / 2 ? 24 : window.innerWidth - 56 - 24;
      const snapped = { x: snapX, y: Math.max(8, Math.min(fabPos.y, window.innerHeight - 80)) };
      setFabPos(snapped);
      try { localStorage.setItem(FAB_POS_KEY, JSON.stringify(snapped)); } catch {}
    }
    isDragging.current = false;
    dragStart.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

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

  const confirmDelete = (record: WorkflowEntitySettingRow) => {
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
  };

  const cardMenu = (record: WorkflowEntitySettingRow) => ({
    items: [
      {
        key: "history",
        label: "History",
        onClick: () => setHistoryTarget(record.applicationName),
      },
      {
        key: "copy",
        label: "Copy",
        onClick: () => { setCopySource(record.applicationName); setCopyTargetName(""); },
      },
      {
        key: "delete",
        label: <span className="text-red-500">Delete</span>,
        onClick: () => confirmDelete(record),
      },
    ],
  });

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
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (v: string | undefined) => (
        <span className="text-zinc-500 text-sm">{v ?? "—"}</span>
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
                params: { applicationName: record.applicationName },
              })
            }
          >
            Open
          </Button>
          <Button type="link" className="px-0" onClick={() => setSettingsTarget(record)}>
            Settings
          </Button>
          <Button type="link" className="px-0" onClick={() => setHistoryTarget(record.applicationName)}>
            History
          </Button>
          <Button
            type="link"
            className="px-0"
            onClick={() => { setCopySource(record.applicationName); setCopyTargetName(""); }}
          >
            Copy
          </Button>
          <Button
            type="link"
            danger
            className="px-0"
            onClick={() => confirmDelete(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Flex vertical gap="large" className={`${isMobile ? "p-4" : "p-8"} h-full overflow-y-auto`} style={{ background: "var(--ql-bg)" }}>
      <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
        <div>
          <Typography.Title level={4} className="!mb-0 !text-zinc-900 !font-semibold tracking-tight">
            Applications
          </Typography.Title>
          <Typography.Text className="text-xs text-zinc-400">
            Manage and configure workflow applications
          </Typography.Text>
        </div>
        {showDesktop && (
          <Space>
            {isMobile && (
              <Button
                size="small"
                type="text"
                className="text-xs text-zinc-400"
                onClick={() => {
                  const next = false;
                  setDesktopOverride(next);
                  try { localStorage.setItem(DESKTOP_VIEW_KEY, String(next)); } catch {}
                }}
              >
                Mobile view
              </Button>
            )}
            <Input.Search
              placeholder="Search application name"
              allowClear
              size="middle"
              style={{ width: 260 }}
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
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
        )}
      </Flex>

      {/* Mobile-only search + desktop toggle */}
      {!showDesktop && (
        <Flex gap="small" align="center">
          <Input.Search
            placeholder="Search application name"
            allowClear
            size="middle"
            style={{ flex: 1 }}
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            onSearch={onSearch}
          />
          <Button
            size="small"
            type="text"
            className="text-xs text-zinc-400 shrink-0"
            onClick={() => {
              const next = true;
              setDesktopOverride(next);
              try { localStorage.setItem(DESKTOP_VIEW_KEY, String(next)); } catch {}
            }}
          >
            Desktop view
          </Button>
        </Flex>
      )}

      <Spin spinning={isLoading || isFetching}>
        {!showDesktop ? (
          <div className="flex flex-col gap-2">
            {(data?.content ?? []).map((record: WorkflowEntitySettingRow) => (
              <div
                key={String(record.id ?? record.applicationName)}
                className="bg-white rounded-xl shadow-sm px-4 py-3"
                style={{ border: "1px solid var(--ql-border)" }}
              >
                <div className="flex items-center justify-between">
                  {/* Navigation zone — only tapping the info area navigates */}
                  <div
                    className="flex-1 min-w-0 pr-3 cursor-pointer"
                    onClick={() =>
                      navigate({
                        to: "/workflows/$applicationName",
                        params: { applicationName: record.applicationName },
                      })
                    }
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-zinc-800 text-sm truncate">
                        {record.applicationName}
                      </span>
                      {record.enabled ? (
                        <Tag color="green" className="text-[10px] font-medium shrink-0">Active</Tag>
                      ) : (
                        <Tag className="text-[10px] font-medium text-zinc-400 shrink-0">Inactive</Tag>
                      )}
                    </div>
                    <span className="text-zinc-500 text-xs mt-0.5 block truncate">
                      {record.description ?? record.eimId ?? record.defaultServiceAccount ?? record.region ?? "—"}
                    </span>
                    <span className="text-zinc-400 text-xs mt-0.5 block">
                      {record.lastModifiedDateTime ?? ""}
                    </span>
                  </div>
                  {/* Actions zone — no navigate handler; ghost clicks stay here */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="text"
                      size="small"
                      className="text-zinc-400 px-1"
                      onClick={() => setSettingsTarget(record)}
                    >
                      Settings
                    </Button>
                    <Dropdown menu={cardMenu(record)} trigger={["click"]} placement="bottomRight">
                      <Button
                        type="text"
                        size="small"
                        icon={<EllipsisOutlined />}
                        className="text-zinc-400 px-1"
                      />
                    </Dropdown>
                    <RightOutlined className="text-zinc-300 text-xs" />
                  </div>
                </div>
              </div>
            ))}
            {(data?.content ?? []).length === 0 && !isLoading && !isFetching && (
              <div className="text-center text-zinc-400 py-8 text-sm">No applications found</div>
            )}
            {/* Mobile pagination */}
            {(data?.totalElements ?? 0) > 0 && (
              <div className="flex flex-col gap-1 pt-2">
                <span className="text-xs text-zinc-400 text-center">
                  {data?.totalElements ?? 0} total · Page {page + 1} of {Math.max(1, Math.ceil((data?.totalElements ?? 0) / pageSize))}
                </span>
                {(data?.totalElements ?? 0) > pageSize && (
                  <div className="flex justify-between items-center">
                    <Button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} size="small">
                      Previous
                    </Button>
                    <Button
                      disabled={(page + 1) * pageSize >= (data?.totalElements ?? 0)}
                      onClick={() => setPage((p) => p + 1)}
                      size="small"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <Table<WorkflowEntitySettingRow>
                rowKey={(r: WorkflowEntitySettingRow) => String(r.id ?? r.applicationName)}
                columns={columns}
                dataSource={data?.content ?? []}
                size="middle"
                pagination={false}
                className="bg-white rounded-xl shadow-sm"
                style={{ minWidth: 700, border: "1px solid var(--ql-border)" }}
                rowClassName={(_: WorkflowEntitySettingRow, index: number) =>
                  index % 2 === 1 ? "bg-[#F3F1EE]" : ""
                }
              />
            </div>
            <Flex justify="space-between" align="center" className="pt-2">
              <Typography.Text className="text-xs text-zinc-400">
                {data?.totalElements ?? 0} total
              </Typography.Text>
              <Pagination
                current={page + 1}
                pageSize={pageSize}
                total={data?.totalElements ?? 0}
                showSizeChanger={false}
                hideOnSinglePage={false}
                onChange={(p: number) => setPage(p - 1)}
                size="small"
              />
            </Flex>
          </>
        )}
      </Spin>

      {/* Draggable FAB — mobile only */}
      {isMobile && (
        <button
          onPointerDown={onFabPointerDown}
          onPointerMove={onFabPointerMove}
          onPointerUp={onFabPointerUp}
          style={{ position: "fixed", bottom: fabPos.y, right: fabPos.x, background: "var(--ql-accent)" }}
          className="z-50 w-14 h-14 rounded-full text-white flex items-center justify-center text-2xl touch-none select-none"
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--ql-accent-hover)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--ql-accent)"; }}
          aria-label="New application"
        >
          <PlusOutlined />
        </button>
      )}

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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCopyTargetName(e.target.value)}
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
