import { useEntitySettings, useDeleteApplication, useAutoCopyWorkflow } from "@/api/hooks/workflow";
import {
  useWorkflowDialog,
  WorkflowDialogProvider,
} from "@/routes/workflows/-components/workflow-dialog/WorkflowDialogProvider";
import SettingsModal from "@/routes/workflows/-components/settings-modal";
import HistoryDrawer from "@/routes/workflows/-components/history-drawer";
import { DeployModal } from "@/components/DeployModal";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { carbonConfirm } from "@/components/CarbonModal";
import type { WorkflowEntitySettingRow, WorkFlow } from "@/api/types";
import React, { useMemo, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { WorkflowStudioIntro } from "@/components/WorkflowStudioIntro";
import { operationApi } from "@/api/services/operation";
import { useToast } from "@/contexts/ToastContext";

export const Route = createFileRoute("/workflows/")({
  component: RouteComponent,
});

const pageSize = 5;
const FAB_POS_KEY = "workflow_fab_pos";

function loadFabPos(): { x: number; y: number } {
  try {
    const s = localStorage.getItem(FAB_POS_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return { x: 24, y: 84 };
}

// Deterministic color from string
const APP_COLORS = ["#0f62fe", "#7C3AED", "#059669", "#D97706", "#0891B2", "#9f1853"];
function appColor(name: string) {
  let h = 0;
  for (let i = 0; i < (name || "").length; i++) h = ((h * 31 + name.charCodeAt(i)) >>> 0);
  return APP_COLORS[h % APP_COLORS.length];
}

function Pagination({
  page,
  totalElements,
  onPageChange,
}: {
  page: number;
  totalElements: number;
  onPageChange: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(totalElements / pageSize));
  if (pages <= 1 && totalElements <= pageSize) return null;
  const windowSize = Math.min(pages, 5);
  const start = Math.max(0, Math.min(page - 2, pages - windowSize));
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, fontSize: 12, color: "#525252" }}>
      <span>Page {page + 1} of {pages} · {totalElements} results</span>
      <div style={{ display: "flex", gap: 1 }}>
        <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => onPageChange(0)} style={{ opacity: page === 0 ? 0.4 : 1 }}>«</button>
        <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => onPageChange(page - 1)} style={{ opacity: page === 0 ? 0.4 : 1 }}>‹ Prev</button>
        {Array.from({ length: windowSize }, (_, i) => {
          const pg = start + i;
          return (
            <button
              key={pg}
              className="btn btn-sm"
              onClick={() => onPageChange(pg)}
              style={{ background: pg === page ? "#161616" : "#f4f4f4", color: pg === page ? "#fff" : "#525252", border: "1px solid #e0e0e0", height: 26, padding: "0 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
            >
              {pg + 1}
            </button>
          );
        })}
        <button className="btn btn-ghost btn-sm" disabled={page >= pages - 1} onClick={() => onPageChange(page + 1)} style={{ opacity: page >= pages - 1 ? 0.4 : 1 }}>Next ›</button>
        <button className="btn btn-ghost btn-sm" disabled={page >= pages - 1} onClick={() => onPageChange(pages - 1)} style={{ opacity: page >= pages - 1 ? 0.4 : 1 }}>»</button>
      </div>
    </div>
  );
}

const ApplicationList = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { showToast } = useToast();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [settingsTarget, setSettingsTarget] = useState<WorkflowEntitySettingRow | null>(null);
  const [historyTarget, setHistoryTarget] = useState<string | null>(null);
  const [deployTarget, setDeployTarget] = useState<{ settings: WorkflowEntitySettingRow; workflow: WorkFlow } | null>(null);
  const { openCreateDialog } = useWorkflowDialog();
  const deleteApplication = useDeleteApplication();
  const autoCopyWorkflow = useAutoCopyWorkflow();
  const [copySource, setCopySource] = useState<string | null>(null);
  const [copyTargetName, setCopyTargetName] = useState("");
  const [copyLoading, setCopyLoading] = useState(false);

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
    carbonConfirm({
      title: "Delete application",
      content: `Delete workflow for "${record.applicationName}"?`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteApplication.mutateAsync(record.applicationName);
          showToast("Application deleted", "success");
        } catch {
          showToast("Delete failed", "error");
        }
      },
    });
  };

  const handleDeploy = async (record: WorkflowEntitySettingRow) => {
    try {
      const workflow = await operationApi.getWorkflow(record.applicationName);
      setDeployTarget({ settings: record, workflow });
    } catch {
      showToast("Failed to load workflow for deployment", "error");
    }
  };

  const rows = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;

  return (
    <div
      className="page-content-mobile"
      style={{
        padding: isMobile ? "16px" : "32px",
        overflowY: "auto",
        height: "100%",
        background: "#fff",
      }}
    >
      {/* Intro banner */}
      <WorkflowStudioIntro />

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#161616" }}>Applications</div>
          <div style={{ fontSize: 12, color: "#525252", letterSpacing: "0.32px" }}>{totalElements} total</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <input
              className="cds-input"
              placeholder="Search applications…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              style={{ width: isMobile ? 160 : 240 }}
            />
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onSearch}>Search</button>
          <button className="btn btn-primary hide-mobile" onClick={openCreateDialog}>＋ New application</button>
        </div>
      </div>

      {/* Loading overlay */}
      {(isLoading || isFetching) && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#525252", fontSize: 13 }}>Loading…</div>
      )}

      {/* Desktop table */}
      {!isLoading && !isFetching && (
        <>
          <div className="hide-mobile" style={{ overflowX: "auto" }}>
            <table className="cds-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Region</th>
                  <th>Last updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((record) => {
                  const color = appColor(record.applicationName);
                  const initials = record.applicationName.slice(0, 2).toUpperCase();
                  return (
                    <tr key={String(record.id ?? record.applicationName)} className="app-row" style={{ background: "#fff" }}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 28, height: 28,
                              background: record.enabled ? "#edf5ff" : "#f4f4f4",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 11, fontWeight: 700,
                              color: record.enabled ? color : "#8d8d8d",
                              flexShrink: 0,
                              borderRadius: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: 13, color: "#161616" }}>{record.applicationName}</span>
                        </div>
                      </td>
                      <td style={{ color: "#525252", fontSize: 12, maxWidth: 240 }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                          {record.description ?? "—"}
                        </span>
                      </td>
                      <td>
                        <span className={`tag ${record.enabled ? "tag-active" : "tag-inactive"}`}>
                          <span className="dot" style={{ background: record.enabled ? "#0f62fe" : "#8d8d8d" }} />
                          {record.enabled ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 11, color: "#525252" }}>
                          {record.region ?? "—"}
                        </span>
                      </td>
                      <td style={{ color: "#525252", fontSize: 12 }}>{record.lastModifiedDateTime ?? "—"}</td>
                      <td>
                        <div className="row-actions" style={{ display: "flex", gap: 2 }}>
                          <button className="btn-link btn-sm" onClick={() => navigate({ to: "/workflows/$applicationName", params: { applicationName: record.applicationName } })}>Open</button>
                          <button className="btn-link btn-sm" onClick={() => setSettingsTarget(record)}>Settings</button>
                          <button className="btn-link btn-sm" onClick={() => setHistoryTarget(record.applicationName)}>History</button>
                          <button className="btn-link btn-sm" onClick={() => { setCopySource(record.applicationName); setCopyTargetName(""); }}>Copy</button>
                          <button className="btn-link btn-sm" style={{ color: "#198038" }} onClick={() => handleDeploy(record)}>Deploy</button>
                          <button className="btn-link btn-sm" style={{ color: "#da1e28" }} onClick={() => confirmDelete(record)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "#525252", padding: "40px 0", fontSize: 14 }}>
                      {debounced ? `No applications matching "${debounced}"` : "No applications yet — create your first one"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="show-mobile-only" style={{ flexDirection: "column", gap: 1, border: "1px solid #e0e0e0", background: "#e0e0e0" }}>
            {rows.map((record) => (
              <div
                key={String(record.id ?? record.applicationName)}
                className="mobile-card"
                onClick={() => navigate({ to: "/workflows/$applicationName", params: { applicationName: record.applicationName } })}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: "#161616", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {record.applicationName}
                    </span>
                    <span className={`tag ${record.enabled ? "tag-active" : "tag-inactive"}`}>
                      {record.enabled ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#525252", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {record.description ?? "—"}
                  </div>
                  <div style={{ fontSize: 11, color: "#8d8d8d", marginTop: 2 }}>{record.lastModifiedDateTime ?? ""}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 12 }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => { e.stopPropagation(); setSettingsTarget(record); }}
                  >
                    ⚙
                  </button>
                  <span style={{ color: "#c6c6c6" }}>›</span>
                </div>
              </div>
            ))}
            {rows.length === 0 && (
              <div style={{ padding: "40px 16px", textAlign: "center", fontSize: 13, color: "#525252", background: "#fff" }}>
                No applications found
              </div>
            )}
          </div>

          <Pagination page={page} totalElements={totalElements} onPageChange={setPage} />
        </>
      )}

      {/* Draggable FAB — mobile only */}
      {isMobile && (
        <button
          onPointerDown={onFabPointerDown}
          onPointerMove={onFabPointerMove}
          onPointerUp={onFabPointerUp}
          style={{
            position: "fixed", bottom: fabPos.y, right: fabPos.x,
            background: "#0f62fe", zIndex: 250,
            width: 52, height: 52, borderRadius: "50%",
            color: "#fff", border: "none", fontSize: 22, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(15,98,254,0.4)",
            touchAction: "none", userSelect: "none",
          }}
          aria-label="New application"
        >
          ＋
        </button>
      )}

      {/* Copy modal */}
      {copySource !== null && (
        <div className="modal-overlay fade-in" onClick={(e) => e.target === e.currentTarget && setCopySource(null)}>
          <div className="modal-box slide-up" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <span className="modal-title">Copy workflow</span>
              <button className="modal-close" onClick={() => setCopySource(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ fontSize: 13, color: "#525252", marginBottom: 16 }}>
                Copying from: <span style={{ fontWeight: 600, color: "#161616" }}>{copySource}</span>
              </div>
              <div className="form-group">
                <label className="cds-label">New application name</label>
                <input
                  className="cds-input"
                  value={copyTargetName}
                  onChange={(e) => setCopyTargetName(e.target.value)}
                  placeholder="target-application-name"
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setCopySource(null)} disabled={copyLoading}>Cancel</button>
              <button
                className="btn btn-primary"
                disabled={!copyTargetName.trim() || copyLoading}
                onClick={async () => {
                  if (!copySource) return;
                  setCopyLoading(true);
                  try {
                    await autoCopyWorkflow.mutateAsync({
                      fromApplicationName: copySource,
                      toApplicationName: copyTargetName.trim(),
                    });
                    showToast("Workflow copied successfully", "success");
                    setCopySource(null);
                  } catch (err: unknown) {
                    const error = err as { errorInfo?: { code: string; detail?: { cause?: string } }[] };
                    const cause = error?.errorInfo?.[0]?.detail?.cause;
                    showToast(cause ?? "Copy failed", "error");
                  } finally {
                    setCopyLoading(false);
                  }
                }}
              >
                {copyLoading ? "Copying…" : "Copy"}
              </button>
            </div>
          </div>
        </div>
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

      <DeployModal
        open={deployTarget !== null}
        onClose={() => setDeployTarget(null)}
        currentWorkflow={deployTarget?.workflow ?? null}
        currentSettings={deployTarget?.settings ?? null}
      />
    </div>
  );
};

function RouteComponent() {
  return (
    <WorkflowDialogProvider>
      <ApplicationList />
    </WorkflowDialogProvider>
  );
}
