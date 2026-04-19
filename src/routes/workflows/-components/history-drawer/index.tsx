import React, { useState } from "react";
import { useEntitySettingHistory } from "@/api/hooks/workflow";
import { operationApi } from "@/api/services/operation";
import { useQueryClient } from "@tanstack/react-query";
import type { HistoryRevision, WorkFlow } from "@/api/types";
import { useToast } from "@/contexts/ToastContext";

type HistoryDrawerProps = {
  open: boolean;
  applicationName: string | null;
  onClose: () => void;
};

const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ open, applicationName, onClose }) => {
  const { showToast } = useToast();
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();
  const [rolling, setRolling] = useState<number | null>(null);

  const { data, isLoading } = useEntitySettingHistory(applicationName ?? "", page);

  const handleRollback = async (revision: HistoryRevision) => {
    if (!window.confirm(`Rollback to revision #${revision.revisionNumber}? Entity settings are not affected.`)) return;
    setRolling(revision.revisionNumber ?? null);
    try {
      const workflowField = revision.entity?.workflow;
      let payload: WorkFlow;
      if (workflowField) {
        payload = JSON.parse(atob(workflowField)) as WorkFlow;
      } else {
        showToast("No workflow payload found in this revision", "error");
        return;
      }
      await operationApi.saveWorkflow(applicationName!, payload);
      queryClient.invalidateQueries({ queryKey: ["workflow"] });
      showToast(`Rolled back to revision #${revision.revisionNumber}`, "success");
    } catch {
      showToast("Rollback failed", "error");
    } finally {
      setRolling(null);
    }
  };

  if (!open) return null;

  const rows = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const pages = Math.max(1, Math.ceil(totalElements / 20));

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-panel fade-in" style={{ width: 600 }}>
        <div className="drawer-header">
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.32px", color: "#525252", marginBottom: 2 }}>Revision History</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#161616" }}>{applicationName}</div>
        </div>
        <div className="drawer-body">
          {isLoading && (
            <div style={{ padding: "40px 0", textAlign: "center", color: "#525252", fontSize: 13 }}>Loading…</div>
          )}
          {!isLoading && (
            <>
              <div style={{ overflowX: "auto" }}>
                <table className="cds-table" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Revision</th>
                      <th>Timestamp</th>
                      <th>Change Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r: HistoryRevision) => (
                      <tr key={String(r.revisionNumber ?? Math.random())} className="app-row">
                        <td>
                          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 12 }}>
                            Rev {r.revisionNumber}
                          </span>
                        </td>
                        <td style={{ color: "#525252", fontSize: 12 }}>{r.revisionInstant ?? "—"}</td>
                        <td>
                          <span style={{
                            fontSize: 11, padding: "2px 8px",
                            background: r.revisionType === "CREATE" ? "#defbe6" : "#edf5ff",
                            color: r.revisionType === "CREATE" ? "#198038" : "#0f62fe",
                            border: `1px solid ${r.revisionType === "CREATE" ? "#a7f0ba" : "#a6c8ff"}`,
                          }}>
                            {r.revisionType ?? "MOD"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-link btn-sm"
                            onClick={() => handleRollback(r)}
                            disabled={rolling === r.revisionNumber}
                          >
                            {rolling === r.revisionNumber ? "Rolling…" : "Rollback"}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center", padding: "40px 0", color: "#525252", fontSize: 13 }}>
                          No history found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {pages > 1 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, fontSize: 12, color: "#525252" }}>
                  <span>{totalElements} total</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</button>
                    <button className="btn btn-ghost btn-sm" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default HistoryDrawer;
