import {
  Button,
  Descriptions,
  Flex,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useWorkflowRecordDetail } from "@/api/hooks/workflow";
import type { WorkflowRecord } from "@/api/types";
import { useIsMobile } from "@/hooks/useIsMobile";

export const Route = createFileRoute("/records/$id")({
  component: RecordDetailPage,
});

function RecordDetailPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { id } = Route.useParams();
  const numericId = Number(id);
  const { data, isLoading } = useWorkflowRecordDetail(isNaN(numericId) ? null : numericId);

  const record = data?.record;
  const children = data?.children ?? [];

  const childColumns: ColumnsType<WorkflowRecord> = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Overall Status", dataIndex: "overallStatus", key: "overallStatus", width: 160,
      render: (v: string) => v ? <Tag>{v}</Tag> : "—" },
    { title: "Tracking No.", dataIndex: "trackingNumber", key: "trackingNumber", ellipsis: true },
    { title: "Customer ID", dataIndex: "customerId", key: "customerId", width: 130 },
    { title: "Retries", dataIndex: "retryTimes", key: "retryTimes", width: 80 },
    { title: "Created", dataIndex: "createdDateTime", key: "createdDateTime", width: 200,
      render: (v: string) => v ?? "—" },
  ];

  return (
    <Flex vertical gap="large" flex={1} className={`${isMobile ? "p-4" : "p-8"} bg-slate-50 min-h-full`}>
      <Flex align="center" gap="middle">
        <Button type="link" className="px-0" onClick={() => navigate({ to: "/records" })}>
          ← Records
        </Button>
        <Typography.Title level={3} className="!mb-0 text-slate-800">
          Record #{id}
        </Typography.Title>
      </Flex>

      <Spin spinning={isLoading}>
        {record && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Typography.Title level={5} className="!mb-4">Record Details</Typography.Title>
            <Descriptions bordered size="small" column={isMobile ? 1 : 2}>
              <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
              <Descriptions.Item label="Application">{record.applicationName ?? "—"}</Descriptions.Item>
              <Descriptions.Item label="Overall Status">
                {record.overallStatus ? <Tag>{record.overallStatus}</Tag> : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Retry Times">{record.retryTimes ?? 0}</Descriptions.Item>
              <Descriptions.Item label="Confirmation No." span={2}>
                {record.transactionConfirmationNumber ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Tracking No." span={2}>
                {record.trackingNumber ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Customer ID">{record.customerId ?? "—"}</Descriptions.Item>
              <Descriptions.Item label="Origin Record ID">
                {record.originWorkflowRecordId != null ? (
                  <Button
                    type="link"
                    className="px-0"
                    onClick={() => navigate({ to: "/records/$id", params: { id: String(record.originWorkflowRecordId) } })}
                  >
                    {record.originWorkflowRecordId}
                  </Button>
                ) : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Created">{record.createdDateTime ?? "—"}</Descriptions.Item>
              <Descriptions.Item label="Last Modified">{record.lastModifiedDateTime ?? "—"}</Descriptions.Item>
            </Descriptions>
          </div>
        )}

        {children.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-4">
            <Typography.Title level={5} className="!mb-4">
              Child Records ({children.length})
            </Typography.Title>
            <Table<WorkflowRecord>
              rowKey={(r) => String(r.id)}
              columns={childColumns}
              dataSource={children}
              pagination={false}
              size="small"
              scroll={isMobile ? { x: 600 } : undefined}
            />
          </div>
        )}
      </Spin>
    </Flex>
  );
}
