import { useState } from "react";
import {
  Button,
  DatePicker,
  Flex,
  Input,
  Pagination,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useWorkflowRecords } from "@/api/hooks/workflow";
import type { WorkflowRecord } from "@/api/types";
import dayjs from "dayjs";
import { useIsMobile } from "@/hooks/useIsMobile";

export const Route = createFileRoute("/records/")({
  component: RecordsPage,
});

const PAGE_SIZE = 5;

const OVERALL_STATUS_OPTIONS = [
  "INITIATION","GI_SUCCESS","GI_FAIL","FB_ALL_SUCCESS",
  "FB_PARTIAL_SUCCESS","FB_ALL_FAIL","RETRY_ALL_FAIL","SM_SUCCESS","SM_FAIL",
].map((v) => ({ value: v, label: v }));

const STATUS_META: Record<string, { bg: string; color: string; border: string }> = {
  GI_SUCCESS:        { bg: "#defbe6", color: "#198038", border: "#a7f0ba" },
  FB_ALL_SUCCESS:    { bg: "#defbe6", color: "#198038", border: "#a7f0ba" },
  SM_SUCCESS:        { bg: "#defbe6", color: "#198038", border: "#a7f0ba" },
  GI_FAIL:           { bg: "#fff1f1", color: "#da1e28", border: "#ffb3b8" },
  FB_ALL_FAIL:       { bg: "#fff1f1", color: "#da1e28", border: "#ffb3b8" },
  RETRY_ALL_FAIL:    { bg: "#fff1f1", color: "#da1e28", border: "#ffb3b8" },
  SM_FAIL:           { bg: "#fff1f1", color: "#da1e28", border: "#ffb3b8" },
  FB_PARTIAL_SUCCESS:{ bg: "#fdf6ec", color: "#b45309", border: "#f8d89c" },
  INITIATION:        { bg: "#edf5ff", color: "#0f62fe", border: "#a6c8ff" },
};

function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span style={{ color: "#525252" }}>—</span>;
  const m = STATUS_META[status] ?? { bg: "#f4f4f4", color: "#525252", border: "#c6c6c6" };
  return (
    <span style={{
      fontSize: 11, padding: "2px 8px",
      background: m.bg, color: m.color, border: `1px solid ${m.border}`,
      letterSpacing: "0.16px", whiteSpace: "nowrap",
    }}>
      {status}
    </span>
  );
}

const colTitle = (text: string) => (
  <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.32px", color: "#525252" }}>
    {text}
  </span>
);

function RecordsPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [page, setPage] = useState(0);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [filters, setFilters] = useState<{
    applicationName?: string; overallStatus?: string;
    transactionConfirmationNumber?: string; trackingNumber?: string;
    customerId?: string; from?: string; to?: string;
  }>({});
  const [draft, setDraft] = useState({ ...filters });

  const { data, isLoading, isFetching } = useWorkflowRecords({ ...filters, page, size: PAGE_SIZE });

  const applyFilters = () => { setPage(0); setFilters({ ...draft }); };
  const resetFilters = () => { setDraft({}); setFilters({}); setPage(0); };

  const columns: ColumnsType<WorkflowRecord> = [
    {
      title: colTitle("ID"), dataIndex: "id", key: "id", width: 80,
      render: (v: number) => <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 12 }}>{v}</span>,
    },
    {
      title: colTitle("Application"), dataIndex: "applicationName", key: "applicationName", ellipsis: true,
      render: (v: string) => <span style={{ fontSize: 12 }}>{v ?? "—"}</span>,
    },
    {
      title: colTitle("Overall Status"), dataIndex: "overallStatus", key: "overallStatus", width: 170,
      render: (v: string) => <StatusBadge status={v} />,
    },
    {
      title: colTitle("Confirmation No."), dataIndex: "transactionConfirmationNumber", key: "transactionConfirmationNumber", ellipsis: true,
      render: (v: string) => <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 11, color: "#525252" }}>{v ?? "—"}</span>,
    },
    {
      title: colTitle("Tracking No."), dataIndex: "trackingNumber", key: "trackingNumber", ellipsis: true,
      render: (v: string) => <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 11, color: "#525252" }}>{v ?? "—"}</span>,
    },
    {
      title: colTitle("Customer ID"), dataIndex: "customerId", key: "customerId", width: 130,
      render: (v: string) => <span style={{ fontSize: 12, color: "#525252" }}>{v ?? "—"}</span>,
    },
    {
      title: colTitle("Created"), dataIndex: "createdDateTime", key: "createdDateTime", width: 190,
      render: (v: string) => <span style={{ fontSize: 12, color: "#525252", whiteSpace: "nowrap" }}>{v ?? "—"}</span>,
    },
    {
      title: colTitle("Retries"), dataIndex: "retryTimes", key: "retryTimes", width: 80,
      render: (v: number) => <span style={{ fontSize: 12, color: "#525252", textAlign: "center", display: "block" }}>{v ?? 0}</span>,
    },
    {
      title: colTitle("Actions"), key: "actions", width: 80,
      render: (_: unknown, record: WorkflowRecord) => (
        <button
          onClick={() => navigate({ to: "/records/$id", params: { id: String(record.id) } })}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#0f62fe", fontSize: 13, fontFamily: "inherit", padding: "0 4px" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.textDecoration = "underline"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.textDecoration = "none"; }}
        >
          View
        </button>
      ),
    },
  ];

  const extraFilters = (
    <>
      <Flex vertical gap={4}>
        <span style={{ fontSize: 11, color: "#525252", letterSpacing: "0.32px" }}>Confirmation No.</span>
        <Input placeholder="Confirmation number" style={isMobile ? undefined : { width: 180 }}
          value={draft.transactionConfirmationNumber ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, transactionConfirmationNumber: e.target.value || undefined }))} />
      </Flex>
      <Flex vertical gap={4}>
        <span style={{ fontSize: 11, color: "#525252", letterSpacing: "0.32px" }}>Tracking No.</span>
        <Input placeholder="Tracking number" style={isMobile ? undefined : { width: 160 }}
          value={draft.trackingNumber ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, trackingNumber: e.target.value || undefined }))} />
      </Flex>
      <Flex vertical gap={4}>
        <span style={{ fontSize: 11, color: "#525252", letterSpacing: "0.32px" }}>Customer ID</span>
        <Input placeholder="Customer ID" style={isMobile ? undefined : { width: 140 }}
          value={draft.customerId ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, customerId: e.target.value || undefined }))} />
      </Flex>
      <Flex vertical gap={4}>
        <span style={{ fontSize: 11, color: "#525252", letterSpacing: "0.32px" }}>From</span>
        <DatePicker showTime style={isMobile ? undefined : { width: 180 }}
          value={draft.from ? dayjs(draft.from) : null}
          onChange={(d) => setDraft((prev) => ({ ...prev, from: d ? d.toISOString() : undefined }))} />
      </Flex>
      <Flex vertical gap={4}>
        <span style={{ fontSize: 11, color: "#525252", letterSpacing: "0.32px" }}>To</span>
        <DatePicker showTime style={isMobile ? undefined : { width: 180 }}
          value={draft.to ? dayjs(draft.to) : null}
          onChange={(d) => setDraft((prev) => ({ ...prev, to: d ? d.toISOString() : undefined }))} />
      </Flex>
    </>
  );

  return (
    <div className={`${isMobile ? "p-4" : "p-8"} h-full overflow-y-auto`} style={{ background: "#fff", paddingBottom: isMobile ? 80 : undefined }}>
      <h2 style={{ fontSize: 22, fontWeight: 400, color: "#161616", marginBottom: 20 }}>Execution Records</h2>

      {/* Filter panel */}
      <div style={{ border: "1px solid #e0e0e0", marginBottom: 20 }}>
        <div style={{ padding: "12px 16px", background: "#f4f4f4", borderBottom: "1px solid #e0e0e0", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.32px", color: "#525252" }}>
          Filter
        </div>
        <div style={{ padding: 16 }}>
          <Flex vertical={isMobile} wrap={isMobile ? undefined : "wrap"} gap="small" align={isMobile ? undefined : "flex-end"}>
            <Input placeholder="Application name" style={isMobile ? undefined : { width: 180 }}
              value={draft.applicationName ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, applicationName: e.target.value || undefined }))} />
            <Select allowClear placeholder="Any status" style={isMobile ? { width: "100%" } : { width: 180 }}
              options={OVERALL_STATUS_OPTIONS} value={draft.overallStatus}
              onChange={(v) => setDraft((d) => ({ ...d, overallStatus: v }))} />
            {(!isMobile || showMoreFilters) && extraFilters}
            <Space>
              {isMobile && (
                <Button type="text" size="small" onClick={() => setShowMoreFilters((v) => !v)}>
                  {showMoreFilters ? "Fewer filters" : "More filters"}
                </Button>
              )}
              <Button type="primary" onClick={applyFilters}>Search</Button>
              <Button onClick={resetFilters}>Reset</Button>
            </Space>
          </Flex>
        </div>
      </div>

      <Spin spinning={isLoading || isFetching}>
        {isMobile ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "#e0e0e0", border: "1px solid #e0e0e0" }}>
            {(data?.content ?? []).map((record: WorkflowRecord) => (
              <div
                key={String(record.id)}
                style={{ background: "#fff", padding: "12px 16px", cursor: "pointer" }}
                onClick={() => navigate({ to: "/records/$id", params: { id: String(record.id) } })}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#f4f4f4"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#fff"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 12, fontWeight: 600, color: "#161616" }}>#{record.id}</span>
                      <StatusBadge status={record.overallStatus} />
                    </div>
                    <div style={{ fontSize: 12, color: "#525252", marginBottom: 2 }}>{record.applicationName ?? "—"}</div>
                    {record.transactionConfirmationNumber && (
                      <div style={{ fontSize: 11, color: "#6f6f6f", fontFamily: '"IBM Plex Mono",monospace' }}>
                        Conf: {record.transactionConfirmationNumber}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: "#8d8d8d", marginTop: 2 }}>{record.createdDateTime ?? ""}</div>
                  </div>
                  <span style={{ color: "#c6c6c6", fontSize: 16, flexShrink: 0, marginTop: 2 }}>›</span>
                </div>
              </div>
            ))}
            {(data?.content ?? []).length === 0 && !isLoading && !isFetching && (
              <div style={{ padding: "40px 16px", textAlign: "center", fontSize: 13, color: "#525252", background: "#fff" }}>No records found</div>
            )}
            {(data?.totalElements ?? 0) > 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "8px 0", background: "#fff" }}>
                <span style={{ fontSize: 12, color: "#525252" }}>{data?.totalElements ?? 0} total</span>
                <Pagination current={page + 1} pageSize={PAGE_SIZE} total={data?.totalElements ?? 0}
                  showSizeChanger={false} hideOnSinglePage={false} onChange={(p) => setPage(p - 1)} size="small" />
              </div>
            )}
          </div>
        ) : (
          <>
            <Table<WorkflowRecord>
              rowKey={(r) => String(r.id)}
              columns={columns}
              dataSource={data?.content ?? []}
              pagination={false}
              style={{ borderRadius: 0, border: "1px solid #e0e0e0" }}
              scroll={{ x: 1100 }}
            />
            <Flex justify="space-between" align="center" style={{ paddingTop: 12 }}>
              <Typography.Text style={{ fontSize: 12, color: "#525252", letterSpacing: "0.32px" }}>
                {data?.totalElements ?? 0} total
              </Typography.Text>
              <Pagination current={page + 1} pageSize={PAGE_SIZE} total={data?.totalElements ?? 0}
                showSizeChanger={false} hideOnSinglePage={false} onChange={(p) => setPage(p - 1)} size="small" />
            </Flex>
          </>
        )}
      </Spin>
    </div>
  );
}
