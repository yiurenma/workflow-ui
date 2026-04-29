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
  const [applicationName, setApplicationName] = useState(currentSettings?.applicationName ?? "");
  const [deploying, setDeploying] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleDeploy = async () => {
    if (!applicationName.trim()) {
      showToast("Please enter an execution application name", "error");
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
        messageInformation: {
          sourceApp: currentSettings,
          workflow: currentWorkflow,
        },
      });
      await onlineApi.postWorkflow({
        applicationName: applicationName.trim(),
        confirmationNumber: `deploy-${Date.now()}`,
        body,
        contentType: "application/json",
      });
      setResult({ ok: true, message: "Deployment request accepted by online API." });
      showToast("Deployment successful", "success");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setResult({ ok: false, message: msg });
      showToast(msg, "error");
    } finally {
      setDeploying(false);
    }
  };

  const handleClose = () => {
    if (!deploying) {
      setResult(null);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay fade-in" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-box slide-up" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <span className="modal-title">Deploy Application</span>
          <button className="modal-close" onClick={handleClose} disabled={deploying}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: "#525252", marginBottom: 16, lineHeight: 1.6 }}>
            Calls the online API with the source application settings and workflow. The execution
            application name identifies which deploy workflow to run.
          </p>
          {currentSettings && (
            <div style={{ fontSize: 12, color: "#525252", background: "#f4f4f4", padding: "8px 12px", marginBottom: 16, borderLeft: "3px solid #0f62fe" }}>
              Source: <strong>{currentSettings.applicationName}</strong>
            </div>
          )}
          <div className="form-group">
            <label className="cds-label">Execution Application Name</label>
            <input
              className="cds-input"
              placeholder="Application name registered in online API"
              value={applicationName}
              onChange={(e) => setApplicationName(e.target.value)}
              disabled={deploying}
            />
          </div>
          {result && (
            <div style={{
              marginTop: 16, padding: 12,
              background: result.ok ? "#defbe6" : "#fff1f1",
              border: `1px solid ${result.ok ? "#24a148" : "#da1e28"}`,
              fontSize: 13,
              color: result.ok ? "#198038" : "#da1e28",
              lineHeight: 1.5,
            }}>
              {result.ok ? "✓ " : "✕ "}{result.message}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={handleClose} disabled={deploying}>Cancel</button>
          <button className="btn btn-primary" onClick={handleDeploy} disabled={deploying}>
            {deploying ? "Deploying…" : "Deploy"}
          </button>
        </div>
      </div>
    </div>
  );
};
