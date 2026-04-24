import React, { useState, useEffect } from "react";
import type { WorkFlow, WorkflowEntitySettingRow } from "@/api/types";
import { useToast } from "@/contexts/ToastContext";
import { onlineApi } from "@/api/services/online";

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
  const [executionAppName, setExecutionAppName] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<"idle" | "success" | "error">("idle");
  const [deployError, setDeployError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setExecutionAppName(currentSettings?.applicationName ?? "");
      setDeployStatus("idle");
      setDeployError(null);
    }
  }, [open, currentSettings?.applicationName]);

  const handleDeploy = async () => {
    if (!executionAppName.trim()) {
      showToast("Please enter the execution application name", "error");
      return;
    }
    if (!currentWorkflow || !currentSettings) {
      showToast("No workflow or settings data available", "error");
      return;
    }

    setDeploying(true);
    setDeployStatus("idle");
    setDeployError(null);

    try {
      await onlineApi.postWorkflow({
        applicationName: executionAppName.trim(),
        body: JSON.stringify({
          applicationSettings: currentSettings,
          workflow: currentWorkflow,
        }),
        contentType: "application/json",
      });
      setDeployStatus("success");
      showToast("Deployment triggered successfully", "success");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setDeployStatus("error");
      setDeployError(msg);
      showToast(msg, "error");
    } finally {
      setDeploying(false);
    }
  };

  const handleClose = () => {
    if (!deploying) {
      onClose();
    }
  };

  if (!open) return null;

  const nodeCount = currentWorkflow?.pluginList?.length ?? 0;

  return (
    <div className="modal-overlay fade-in" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-box slide-up" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <span className="modal-title">Deploy Application</span>
          <button className="modal-close" onClick={handleClose} disabled={deploying}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: "#525252", marginBottom: 20, lineHeight: 1.6 }}>
            Trigger a deployment via the online API. The source application settings and workflow are assembled and sent as the request body.
          </p>

          <div style={{ marginBottom: 20, padding: 12, background: "#f4f4f4", border: "1px solid #e0e0e0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.32px", color: "#161616", marginBottom: 10 }}>
              Request Body
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: 12 }}>
              <div>
                <span style={{ color: "#8d8d8d" }}>Block A — Application:</span>{" "}
                <span style={{ color: "#161616", fontWeight: 600 }}>{currentSettings?.applicationName ?? "—"}</span>
              </div>
              <div>
                <span style={{ color: "#8d8d8d" }}>Status:</span>{" "}
                <span style={{ color: currentSettings?.enabled ? "#198038" : "#8d8d8d" }}>
                  {currentSettings?.enabled ? "Active" : "Inactive"}
                </span>
              </div>
              <div>
                <span style={{ color: "#8d8d8d" }}>Block B — Nodes:</span>{" "}
                <span style={{ color: "#161616" }}>{nodeCount} plugins</span>
              </div>
              <div>
                <span style={{ color: "#8d8d8d" }}>Region:</span>{" "}
                <span style={{ color: "#161616" }}>{currentSettings?.region ?? "—"}</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="cds-label">Execution Application Name</label>
            <p style={{ fontSize: 12, color: "#525252", margin: "4px 0 8px", lineHeight: 1.5 }}>
              Sent as the{" "}
              <code style={{ background: "#e0e0e0", padding: "1px 4px", fontSize: 11 }}>applicationName</code>{" "}
              query parameter to the online API — the runtime workflow that processes this deployment.
            </p>
            <input
              className="cds-input"
              placeholder="deploy-workflow-app"
              value={executionAppName}
              onChange={(e) => setExecutionAppName(e.target.value)}
              disabled={deploying}
              autoFocus
            />
          </div>

          {deployStatus === "success" && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                background: "#defbe6",
                border: "1px solid #24a148",
                fontSize: 13,
                color: "#198038",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontWeight: 700 }}>✓</span> Deployment triggered successfully
            </div>
          )}

          {deployStatus === "error" && deployError && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                background: "#fff1f1",
                border: "1px solid #da1e28",
                fontSize: 12,
                color: "#da1e28",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Deployment failed</div>
              {deployError}
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
            disabled={deploying || !executionAppName.trim()}
          >
            {deploying ? "Deploying…" : "Deploy"}
          </button>
        </div>
      </div>
    </div>
  );
};
