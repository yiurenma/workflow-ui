import { useState } from "react";
import {
  Button,
  DatePicker,
  Flex,
  Input,
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

export const Route = createFileRoute("/records/")({
  component: RecordsPage,
});

const PAGE_SIZE = 20;

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
  const [page, setPage] = useState(0);
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
    <Flex vertical gap="large" flex={1} className="p-8 bg-slate-50 min-h-full">
      <Typography.Title level={3} className="!mb-0 text-slate-800">
        Execution Records
      </Typography.Title>

      {/* Filter bar */}
      <Flex wrap="wrap" gap="small" align="flex-end">
        <Flex vertical gap={4}>
          <Typography.Text type="secondary" className="text-xs">Application</Typography.Text>
          <Input
            placeholder="Application name"
            style={{ width: 180 }}
            value={draft.applicationName ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, applicationName: e.target.value || undefined }))}
          />
        </Flex>
        <Flex vertical gap={4}>
          <Typography.Text type="secondary" className="text-xs">Overall Status</Typography.Text>
          <Select
            allowClear
            placeholder="Any status"
            style={{ width: 180 }}
            options={OVERALL_STATUS_OPTIONS}
            value={draft.overallStatus}
            onChange={(v) => setDraft((d) => ({ ...d, overallStatus: v }))}
          />
        </Flex>
        <Flex vertical gap={4}>
          <Typography.Text type="secondary" className="text-xs">Confirmation No.</Typography.Text>
          <Input
            placeholder="Confirmation number"
            style={{ width: 180 }}
            value={draft.transactionConfirmationNumber ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, transactionConfirmationNumber: e.target.value || undefined }))}
          />
        </Flex>
        <Flex vertical gap={4}>
          <Typography.Text type="secondary" className="text-xs">Tracking No.</Typography.Text>
          <Input
            placeholder="Tracking number"
            style={{ width: 160 }}
            value={draft.trackingNumber ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, trackingNumber: e.target.value || undefined }))}
          />
        </Flex>
        <Flex vertical gap={4}>
          <Typography.Text type="secondary" className="text-xs">Customer ID</Typography.Text>
          <Input
            placeholder="Customer ID"
            style={{ width: 140 }}
            value={draft.customerId ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, customerId: e.target.value || undefined }))}
          />
        </Flex>
        <Flex vertical gap={4}>
          <Typography.Text type="secondary" className="text-xs">From</Typography.Text>
          <DatePicker
            showTime
            style={{ width: 180 }}
            value={draft.from ? dayjs(draft.from) : null}
            onChange={(d) => setDraft((prev) => ({ ...prev, from: d ? d.toISOString() : undefined }))}
          />
        </Flex>
        <Flex vertical gap={4}>
          <Typography.Text type="secondary" className="text-xs">To</Typography.Text>
          <DatePicker
            showTime
            style={{ width: 180 }}
            value={draft.to ? dayjs(draft.to) : null}
            onChange={(d) => setDraft((prev) => ({ ...prev, to: d ? d.toISOString() : undefined }))}
          />
        </Flex>
        <Space>
          <Button type="primary" onClick={applyFilters}>Search</Button>
          <Button onClick={resetFilters}>Reset</Button>
        </Space>
      </Flex>

      <Spin spinning={isLoading || isFetching}>
        <Table<WorkflowRecord>
          rowKey={(r) => String(r.id)}
          columns={columns}
          dataSource={data?.content ?? []}
          pagination={{
            current: page + 1,
            pageSize: PAGE_SIZE,
            total: data?.totalElements ?? 0,
            showSizeChanger: false,
            onChange: (p) => setPage(p - 1),
          }}
          className="bg-white rounded-lg shadow-sm"
          scroll={{ x: 1200 }}
        />
      </Spin>
    </Flex>
  );
}
