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
  Tag,
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
  "INITIATION",
  "GI_SUCCESS",
  "GI_FAIL",
  "FB_ALL_SUCCESS",
  "FB_PARTIAL_SUCCESS",
  "FB_ALL_FAIL",
  "RETRY_ALL_FAIL",
  "SM_SUCCESS",
  "SM_FAIL",
].map((v) => ({ value: v, label: v }));

function RecordsPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [page, setPage] = useState(0);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [filters, setFilters] = useState<{
    applicationName?: string;
    overallStatus?: string;
    transactionConfirmationNumber?: string;
    trackingNumber?: string;
    customerId?: string;
    from?: string;
    to?: string;
  }>({});
  const [draft, setDraft] = useState({ ...filters });

  const { data, isLoading, isFetching } = useWorkflowRecords({
    ...filters,
    page,
    size: PAGE_SIZE,
  });

  const applyFilters = () => {
    setPage(0);
    setFilters({ ...draft });
  };

  const resetFilters = () => {
    setDraft({});
    setFilters({});
    setPage(0);
  };

  const columns: ColumnsType<WorkflowRecord> = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Application", dataIndex: "applicationName", key: "applicationName", ellipsis: true },
    {
      title: "Overall Status",
      dataIndex: "overallStatus",
      key: "overallStatus",
      width: 160,
    },
    {
      title: "Confirmation No.",
      dataIndex: "transactionConfirmationNumber",
      key: "transactionConfirmationNumber",
      ellipsis: true,
    },
    {
      title: "Tracking No.",
      dataIndex: "trackingNumber",
      key: "trackingNumber",
      ellipsis: true,
    },
    { title: "Customer ID", dataIndex: "customerId", key: "customerId", width: 130 },
    {
      title: "Created",
      dataIndex: "createdDateTime",
      key: "createdDateTime",
      width: 200,
      render: (v: string) => v ?? "—",
    },
    { title: "Retries", dataIndex: "retryTimes", key: "retryTimes", width: 80 },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_: unknown, record: WorkflowRecord) => (
        <Button
          type="link"
          className="px-0"
          onClick={() => navigate({ to: "/records/$id", params: { id: String(record.id) } })}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Flex vertical gap="large" className={`${isMobile ? "p-4" : "p-8"} h-full overflow-y-auto`} style={{ background: "#ffffff" }}>
      <Typography.Title level={3} className="!mb-0" style={{ color: "#161616" }}>
        Execution Records
      </Typography.Title>

      {/* Filter bar — compact on mobile */}
      <Flex vertical={isMobile} wrap={isMobile ? undefined : "wrap"} gap="small" align={isMobile ? undefined : "flex-end"}>
        <Input
          placeholder="Application name"
          style={isMobile ? undefined : { width: 180 }}
          value={draft.applicationName ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, applicationName: e.target.value || undefined }))}
        />
        <Select
          allowClear
          placeholder="Any status"
          style={isMobile ? undefined : { width: 180 }}
          options={OVERALL_STATUS_OPTIONS}
          value={draft.overallStatus}
          onChange={(v) => setDraft((d) => ({ ...d, overallStatus: v }))}
        />
        {/* Extra filters — always shown on desktop; toggled via "More filters" on mobile */}
        {(!isMobile || showMoreFilters) && (
          <>
            <Flex vertical gap={4}>
              <Typography.Text type="secondary" className="text-xs">Confirmation No.</Typography.Text>
              <Input
                placeholder="Confirmation number"
                style={isMobile ? undefined : { width: 180 }}
                value={draft.transactionConfirmationNumber ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, transactionConfirmationNumber: e.target.value || undefined }))}
              />
            </Flex>
            <Flex vertical gap={4}>
              <Typography.Text type="secondary" className="text-xs">Tracking No.</Typography.Text>
              <Input
                placeholder="Tracking number"
                style={isMobile ? undefined : { width: 160 }}
                value={draft.trackingNumber ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, trackingNumber: e.target.value || undefined }))}
              />
            </Flex>
            <Flex vertical gap={4}>
              <Typography.Text type="secondary" className="text-xs">Customer ID</Typography.Text>
              <Input
                placeholder="Customer ID"
                style={isMobile ? undefined : { width: 140 }}
                value={draft.customerId ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, customerId: e.target.value || undefined }))}
              />
            </Flex>
            <Flex vertical gap={4}>
              <Typography.Text type="secondary" className="text-xs">From</Typography.Text>
              <DatePicker
                showTime
                style={isMobile ? undefined : { width: 180 }}
                value={draft.from ? dayjs(draft.from) : null}
                onChange={(d) => setDraft((prev) => ({ ...prev, from: d ? d.toISOString() : undefined }))}
              />
            </Flex>
            <Flex vertical gap={4}>
              <Typography.Text type="secondary" className="text-xs">To</Typography.Text>
              <DatePicker
                showTime
                style={isMobile ? undefined : { width: 180 }}
                value={draft.to ? dayjs(draft.to) : null}
                onChange={(d) => setDraft((prev) => ({ ...prev, to: d ? d.toISOString() : undefined }))}
              />
            </Flex>
          </>
        )}
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

      <Spin spinning={isLoading || isFetching}>
        {isMobile ? (
          <div className="flex flex-col gap-2">
            {(data?.content ?? []).map((record: WorkflowRecord) => (
              <div
                key={String(record.id)}
                className="px-4 py-3"
                style={{ background: "#f4f4f4", border: "1px solid #e0e0e0", borderRadius: 0 }}
                onClick={() => navigate({ to: "/records/$id", params: { id: String(record.id) } })}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: "#161616" }}>#{record.id}</span>
                      {record.overallStatus && (
                        <Tag className="text-[10px] font-medium shrink-0">{record.overallStatus}</Tag>
                      )}
                    </div>
                    <span className="text-xs mt-0.5 block truncate" style={{ color: "#525252", letterSpacing: "0.16px" }}>
                      {record.applicationName ?? "—"}
                    </span>
                    {record.transactionConfirmationNumber && (
                      <span className="text-xs block truncate" style={{ color: "#6f6f6f", letterSpacing: "0.16px" }}>
                        Conf: {record.transactionConfirmationNumber}
                      </span>
                    )}
                    <span className="text-xs block" style={{ color: "#6f6f6f", letterSpacing: "0.32px" }}>
                      {record.createdDateTime ?? ""}
                    </span>
                  </div>
                  <Button
                    type="link"
                    size="small"
                    className="px-0 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate({ to: "/records/$id", params: { id: String(record.id) } });
                    }}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
            {(data?.content ?? []).length === 0 && !isLoading && !isFetching && (
              <div className="text-center py-8 text-sm" style={{ color: "#525252" }}>No records found</div>
            )}
            {/* Mobile pagination */}
            {(data?.totalElements ?? 0) > 0 && (
              <div className="flex flex-col items-center gap-1 pt-2">
                <span className="text-xs" style={{ color: "#525252", letterSpacing: "0.32px" }}>
                  {data?.totalElements ?? 0} total
                </span>
                <Pagination
                  current={page + 1}
                  pageSize={PAGE_SIZE}
                  total={data?.totalElements ?? 0}
                  showSizeChanger={false}
                  hideOnSinglePage={false}
                  onChange={(p) => setPage(p - 1)}
                  size="small"
                />
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
              className="bg-white"
              style={{ borderRadius: 0, border: "1px solid #e0e0e0" }}
              scroll={{ x: 1200 }}
            />
            <Flex justify="space-between" align="center" className="pt-2">
              <Typography.Text className="text-xs" style={{ color: "#525252", letterSpacing: "0.32px" }}>
                {data?.totalElements ?? 0} total
              </Typography.Text>
              <Pagination
                current={page + 1}
                pageSize={PAGE_SIZE}
                total={data?.totalElements ?? 0}
                showSizeChanger={false}
                hideOnSinglePage={false}
                onChange={(p) => setPage(p - 1)}
                size="small"
              />
            </Flex>
          </>
        )}
      </Spin>
    </Flex>
  );
}
