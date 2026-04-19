import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useWorkflowRecordDetail } from "@/api/hooks/workflow";
import type { WorkflowRecord } from "@/api/types";
import { useIsMobile } from "@/hooks/useIsMobile";
import { StatusBadge } from "./index";

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

  if (isLoading) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "#525252", fontSize: 13 }}>Loading…</div>
    );
  }

  const fields: [string, React.ReactNode][] = record
    ? [
        ["ID", <span style={{ fontFamily: '"IBM Plex Mono",monospace' }}>{record.id}</span>],
        ["Application", record.applicationName ?? "—"],
        ["Overall Status", <StatusBadge key="s" status={record.overallStatus} />],
        ["Retry Times", String(record.retryTimes ?? 0)],
        ["Confirmation No.", <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 12 }}>{record.transactionConfirmationNumber ?? "—"}</span>],
        ["Tracking No.", <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 12 }}>{record.trackingNumber ?? "—"}</span>],
        ["Customer ID", <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 12 }}>{record.customerId ?? "—"}</span>],
        [
          "Origin Record ID",
          record.originWorkflowRecordId != null ? (
            <button
              className="btn-link"
              onClick={() => navigate({ to: "/records/$id", params: { id: String(record.originWorkflowRecordId) } })}
            >
              {record.originWorkflowRecordId}
            </button>
          ) : "—",
        ],
        ["Created", record.createdDateTime ?? "—"],
        ["Last Modified", record.lastModifiedDateTime ?? "—"],
      ]
    : [];

  return (
    <div
      className="page-content-mobile"
      style={{ padding: isMobile ? "16px" : "32px", overflowY: "auto", height: "100%", background: "#fff" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button className="btn-link" style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 4 }} onClick={() => navigate({ to: "/records" })}>
          ← Records
        </button>
        <span style={{ color: "#c6c6c6" }}>|</span>
        <h2 style={{ fontSize: 20, fontWeight: 400, color: "#161616", margin: 0 }}>Record #{id}</h2>
      </div>

      {record && (
        <div style={{ border: "1px solid #e0e0e0", marginBottom: 20 }}>
          <div style={{ padding: "12px 16px", background: "#f4f4f4", borderBottom: "1px solid #e0e0e0", fontSize: 13, fontWeight: 600, color: "#161616" }}>
            Record Details
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
            {fields.map(([k, v], i) => (
              <div
                key={String(k)}
                style={{
                  padding: "10px 16px",
                  borderBottom: i < fields.length - (isMobile ? 1 : 2) ? "1px solid #f4f4f4" : "none",
                  display: "flex", gap: 12, alignItems: "flex-start",
                }}
              >
                <div style={{ width: 160, flexShrink: 0, fontSize: 12, color: "#525252", paddingTop: 1 }}>{k}</div>
                <div style={{ fontSize: 12, color: "#161616" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {children.length > 0 && (
        <div style={{ border: "1px solid #e0e0e0" }}>
          <div style={{ padding: "12px 16px", background: "#f4f4f4", borderBottom: "1px solid #e0e0e0", fontSize: 13, fontWeight: 600, color: "#161616" }}>
            Child Records ({children.length})
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="cds-table">
              <thead>
                <tr>
                  <th>ID</th><th>Overall Status</th><th>Tracking No.</th>
                  <th>Customer ID</th><th>Retries</th><th>Created</th>
                </tr>
              </thead>
              <tbody>
                {children.map((c: WorkflowRecord) => (
                  <tr key={String(c.id)} className="app-row">
                    <td style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 12 }}>{c.id}</td>
                    <td><StatusBadge status={c.overallStatus} /></td>
                    <td style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 11, color: "#525252" }}>{c.trackingNumber ?? "—"}</td>
                    <td style={{ fontSize: 12, color: "#525252" }}>{c.customerId ?? "—"}</td>
                    <td style={{ fontSize: 12, color: "#525252" }}>{c.retryTimes ?? 0}</td>
                    <td style={{ fontSize: 12, color: "#525252" }}>{c.createdDateTime ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
