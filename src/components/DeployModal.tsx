import React, { useState } from "react";
import type { WorkFlow, WorkflowEntitySettingRow } from "@/api/types";
import { onlineApi } from "@/api/services/online";
import { useToast } from "@/contexts/ToastContext";

interface DeployModalProps {
  open: boolean;
  onClose: () => void;
  currentWorkflow: WorkFlow | null;
  currentSettings: WorkflowEntitySettingRow | null;
}

export const DeployModal: React.FC<DeployModalProps> = ({
  open,
  onClose,
  currentWorkflow,
  currentSettings,
}) => {
  const { showToast } = useToast();
  const [applicationName, setApplicationName] = useState(
    currentSettings?.applicationName ?? ""
  );
  const [deploying, setDeploying] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  React.useEffect(() => {
    if (open) {
      setApplicationName(currentSettings?.applicationName ?? "");
      setResult(null);
    }
  }, [open, currentSettings?.applicationName]);

  const handleClose = () => {
    if (!deploying) {
      setResult(null);
      onClose();
    }
  };

  const handleDeploy = async () => {
    if (!applicationName.trim()) {
      showToast("Application name is required", "error");
      return;
    }
    if (!currentWorkflow || !currentSettings) {
      showToast("No workflow or settings data available", "error");
      return;
    }

    setDeploying(true);
    setResult(null);
    try {
      const body = JSON.stringify({
        sourceApplication: currentSettings,
        workflow: currentWorkflow,
      });
      const confirmationNumber = `deploy-${Date.now()}`;
      const res = await onlineApi.postWorkflow({
        applicationName: applicationName.trim(),
        confirmationNumber,
        body,
        contentType: "application/json",
      });
      const text = await res.text();
      setResult({ ok: true, message: text || "Deploy request accepted." });
      showToast("Deploy request sent successfully", "success");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setResult({ ok: false, message: msg });
      showToast(msg, "error");
    } finally {
      setDeploying(false);
    }
  };

  const previewJson =
    currentSettings && currentWorkflow
      ? JSON.stringify(
          { sourceApplication: currentSettings, workflow: currentWorkflow },
          null,
          2
        )
      : "";

  if (!open) return null;

  return (
    <div
      className="modal-overlay fade-in"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="modal-box slide-up" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <span className="modal-title">Deploy Application</span>
          <button className="modal-close" onClick={handleClose} disabled={deploying}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: "#525252", marginBottom: 20, lineHeight: 1.6 }}>
            Deploy this application's workflow to the online execution engine. The
            application name below is used as the runtime execution name (online API{" "}
            <code
              style={{
                fontFamily: '"IBM Plex Mono",monospace',
                background: "#f4f4f4",
                padding: "1px 4px",
              }}
            >
              applicationName
            </code>{" "}
            query parameter). The request body contains two parts: the source application
            settings and the full workflow JSON.
          </p>

          <div className="form-group">
            <label className="cds-label">Application Name (runtime execution name)</label>
            <input
              className="cds-input"
              placeholder="e.g. my-application"
              value={applicationName}
              onChange={(e) => setApplicationName(e.target.value)}
              disabled={deploying}
            />
            <p style={{ fontSize: 12, color: "#6f6f6f", marginTop: 4, lineHeight: 1.4 }}>
              Source application:{" "}
              <strong>{currentSettings?.applicationName ?? "—"}</strong>
            </p>
          </div>

          <div style={{ marginTop: 12 }}>
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                color: "#0f62fe",
                padding: 0,
                fontFamily: "inherit",
              }}
              onClick={() => setPreviewOpen((v) => !v)}
            >
              {previewOpen ? "▲ Hide" : "▼ Show"} request body preview
            </button>
            {previewOpen && (
              <pre
                style={{
                  marginTop: 8,
                  background: "#f4f4f4",
                  padding: 12,
                  fontSize: 11,
                  fontFamily: '"IBM Plex Mono", monospace',
                  overflow: "auto",
                  maxHeight: 200,
                  border: "1px solid #e0e0e0",
                  lineHeight: 1.5,
                }}
              >
                {previewJson.slice(0, 3000)}
                {previewJson.length > 3000 ? "\n…(truncated)" : ""}
              </pre>
            )}
          </div>

          {result && (
            <div
              style={{
                marginTop: 16,
                padding: "10px 14px",
                background: result.ok ? "#defbe6" : "#fff1f1",
                border: `1px solid ${result.ok ? "#24a148" : "#da1e28"}`,
                fontSize: 13,
                color: result.ok ? "#198038" : "#da1e28",
                lineHeight: 1.5,
              }}
            >
              {result.ok ? "✓ " : "✕ "}
              {result.message || (result.ok ? "Request accepted." : "Request failed.")}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={handleClose} disabled={deploying}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleDeploy}
            disabled={deploying}
          >
            {deploying ? "Deploying…" : "Deploy"}
          </button>
        </div>
      </div>
    </div>
  );
};
