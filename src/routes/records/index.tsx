import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useWorkflowRecords } from "@/api/hooks/workflow";
import type { WorkflowRecord } from "@/api/types";
import { useIsMobile } from "@/hooks/useIsMobile";

export const Route = createFileRoute("/records/")({
  component: RecordsPage,
});

const PAGE_SIZE = 5;

const OVERALL_STATUS_OPTIONS = [
  "INITIATION", "GI_SUCCESS", "GI_FAIL", "FB_ALL_SUCCESS",
  "FB_PARTIAL_SUCCESS", "FB_ALL_FAIL", "RETRY_ALL_FAIL", "SM_SUCCESS", "SM_FAIL",
];

const STATUS_META: Record<string, { bg: string; color: string; border: string }> = {
  GI_SUCCESS:         { bg: "#defbe6", color: "#198038", border: "#a7f0ba" },
  FB_ALL_SUCCESS:     { bg: "#defbe6", color: "#198038", border: "#a7f0ba" },
  SM_SUCCESS:         { bg: "#defbe6", color: "#198038", border: "#a7f0ba" },
  GI_FAIL:            { bg: "#fff1f1", color: "#da1e28", border: "#ffb3b8" },
  FB_ALL_FAIL:        { bg: "#fff1f1", color: "#da1e28", border: "#ffb3b8" },
  RETRY_ALL_FAIL:     { bg: "#fff1f1", color: "#da1e28", border: "#ffb3b8" },
  SM_FAIL:            { bg: "#fff1f1", color: "#da1e28", border: "#ffb3b8" },
  FB_PARTIAL_SUCCESS: { bg: "#fdf6ec", color: "#b45309", border: "#f8d89c" },
  INITIATION:         { bg: "#edf5ff", color: "#0f62fe", border: "#a6c8ff" },
};

export function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span style={{ color: "#525252" }}>—</span>;
  const m = STATUS_META[status] ?? { bg: "#f4f4f4", color: "#525252", border: "#c6c6c6" };
  return (
    <span style={{ fontSize: 11, padding: "2px 8px", background: m.bg, color: m.color, border: `1px solid ${m.border}`, letterSpacing: "0.16px", whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
}

function Pagination({ page, totalElements, onPageChange }: { page: number; totalElements: number; onPageChange: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));
  const windowSize = Math.min(pages, 5);
  const start = Math.max(0, Math.min(page - 2, pages - windowSize));
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, fontSize: 12, color: "#525252" }}>
      <span>{totalElements} total</span>
      <div style={{ display: "flex", gap: 1 }}>
        <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => onPageChange(0)} style={{ opacity: page === 0 ? 0.4 : 1 }}>«</button>
        <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => onPageChange(page - 1)} style={{ opacity: page === 0 ? 0.4 : 1 }}>‹</button>
        {Array.from({ length: windowSize }, (_, i) => {
          const pg = start + i;
          return (
            <button key={pg} className="btn btn-sm" onClick={() => onPageChange(pg)}
              style={{ background: pg === page ? "#161616" : "#f4f4f4", color: pg === page ? "#fff" : "#525252", border: "1px solid #e0e0e0", height: 26, padding: "0 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              {pg + 1}
            </button>
          );
        })}
        <button className="btn btn-ghost btn-sm" disabled={page >= pages - 1} onClick={() => onPageChange(page + 1)} style={{ opacity: page >= pages - 1 ? 0.4 : 1 }}>›</button>
        <button className="btn btn-ghost btn-sm" disabled={page >= pages - 1} onClick={() => onPageChange(pages - 1)} style={{ opacity: page >= pages - 1 ? 0.4 : 1 }}>»</button>
      </div>
    </div>
  );
}

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

  const setD = (k: string, v: string) =>
    setDraft((d) => ({ ...d, [k]: v || undefined }));

  const extraFilters = (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 11, color: "#525252", letterSpacing: "0.32px" }}>Confirmation No.</span>
        <input className="cds-input" placeholder="Confirmation number"
          value={draft.transactionConfirmationNumber ?? ""}
          onChange={(e) => setD("transactionConfirmationNumber", e.target.value)}
          style={{ width: isMobile ? "100%" : 180 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 11, color: "#525252", letterSpacing: "0.32px" }}>Tracking No.</span>
        <input className="cds-input" placeholder="Tracking number"
          value={draft.trackingNumber ?? ""}
          onChange={(e) => setD("trackingNumber", e.target.value)}
          style={{ width: isMobile ? "100%" : 160 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 11, color: "#525252", letterSpacing: "0.32px" }}>Customer ID</span>
        <input className="cds-input" placeholder="Customer ID"
          value={draft.customerId ?? ""}
          onChange={(e) => setD("customerId", e.target.value)}
          style={{ width: isMobile ? "100%" : 140 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 11, color: "#525252", letterSpacing: "0.32px" }}>From</span>
        <input type="datetime-local" className="cds-input"
          value={draft.from ?? ""}
          onChange={(e) => setD("from", e.target.value)}
          style={{ width: isMobile ? "100%" : 180 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 11, color: "#525252", letterSpacing: "0.32px" }}>To</span>
        <input type="datetime-local" className="cds-input"
          value={draft.to ?? ""}
          onChange={(e) => setD("to", e.target.value)}
          style={{ width: isMobile ? "100%" : 180 }} />
      </div>
    </>
  );

  const rows = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;

  return (
    <div
      className="page-content-mobile"
      style={{ padding: isMobile ? "16px" : "32px", overflowY: "auto", height: "100%", background: "#fff" }}
    >
      <h2 style={{ fontSize: 22, fontWeight: 400, color: "#161616", marginBottom: 20 }}>Execution Records</h2>

      {/* Filter panel */}
      <div style={{ border: "1px solid #e0e0e0", marginBottom: 20 }}>
        <div style={{ padding: "12px 16px", background: "#f4f4f4", borderBottom: "1px solid #e0e0e0", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.32px", color: "#525252" }}>
          Filter
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 12, flexWrap: "wrap", alignItems: isMobile ? "stretch" : "flex-end" }}>
            <input className="cds-input" placeholder="Application name"
              value={draft.applicationName ?? ""}
              onChange={(e) => setD("applicationName", e.target.value)}
              style={{ width: isMobile ? "100%" : 180 }} />

            <div style={{ position: "relative", width: isMobile ? "100%" : 180 }}>
              <select className="cds-select"
                value={draft.overallStatus ?? ""}
                onChange={(e) => setD("overallStatus", e.target.value)}
                style={{ paddingRight: 28 }}>
                <option value="">Any status</option>
                {OVERALL_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#525252", fontSize: 10 }}>▼</span>
            </div>

            {(!isMobile || showMoreFilters) && extraFilters}

            <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
              {isMobile && (
                <button className="btn btn-ghost btn-sm" onClick={() => setShowMoreFilters((v) => !v)}>
                  {showMoreFilters ? "Fewer filters" : "More filters"}
                </button>
              )}
              <button className="btn btn-primary btn-sm" onClick={applyFilters}>Search</button>
              <button className="btn btn-ghost btn-sm" onClick={resetFilters}>Reset</button>
            </div>
          </div>
        </div>
      </div>

      {(isLoading || isFetching) && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#525252", fontSize: 13 }}>Loading…</div>
      )}

      {!isLoading && !isFetching && (
        <>
          {/* Desktop table */}
          <div className="hide-mobile" style={{ overflowX: "auto" }}>
            <table className="cds-table" style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th>ID</th><th>Application</th><th>Overall Status</th>
                  <th>Confirmation No.</th><th>Tracking No.</th><th>Customer ID</th>
                  <th>Created</th><th>Retries</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: WorkflowRecord) => (
                  <tr key={String(r.id)} className="app-row" style={{ background: "#fff" }}>
                    <td style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 12 }}>{r.id}</td>
                    <td style={{ fontSize: 12 }}>{r.applicationName ?? "—"}</td>
                    <td><StatusBadge status={r.overallStatus} /></td>
                    <td style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 11, color: "#525252", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.transactionConfirmationNumber ?? "—"}</td>
                    <td style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 11, color: "#525252" }}>{r.trackingNumber ?? "—"}</td>
                    <td style={{ fontSize: 12, color: "#525252" }}>{r.customerId ?? "—"}</td>
                    <td style={{ fontSize: 12, color: "#525252", whiteSpace: "nowrap" }}>{r.createdDateTime ?? "—"}</td>
                    <td style={{ fontSize: 12, color: "#525252", textAlign: "center" }}>{r.retryTimes ?? 0}</td>
                    <td>
                      <button className="btn-link btn-sm" onClick={() => navigate({ to: "/records/$id", params: { id: String(r.id) } })}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={9} style={{ textAlign: "center", padding: "40px 0", color: "#525252", fontSize: 13 }}>No records found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="show-mobile-only" style={{ flexDirection: "column", gap: 1, background: "#e0e0e0", border: "1px solid #e0e0e0" }}>
            {rows.map((r: WorkflowRecord) => (
              <div
                key={String(r.id)}
                className="mobile-card"
                onClick={() => navigate({ to: "/records/$id", params: { id: String(r.id) } })}
                style={{ cursor: "pointer" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 12, fontWeight: 600, color: "#161616" }}>#{r.id}</span>
                      <StatusBadge status={r.overallStatus} />
                    </div>
                    <div style={{ fontSize: 12, color: "#525252", marginBottom: 2 }}>{r.applicationName ?? "—"}</div>
                    {r.transactionConfirmationNumber && (
                      <div style={{ fontSize: 11, color: "#6f6f6f", fontFamily: '"IBM Plex Mono",monospace' }}>
                        Conf: {r.transactionConfirmationNumber}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: "#8d8d8d", marginTop: 2 }}>{r.createdDateTime ?? ""}</div>
                  </div>
                  <span style={{ color: "#c6c6c6", fontSize: 16, flexShrink: 0, marginTop: 2 }}>›</span>
                </div>
              </div>
            ))}
            {rows.length === 0 && (
              <div style={{ padding: "40px 16px", textAlign: "center", fontSize: 13, color: "#525252", background: "#fff" }}>No records found</div>
            )}
          </div>

          <Pagination page={page} totalElements={totalElements} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
