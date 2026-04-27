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
  const [executionName, setExecutionName] = useState(currentSettings?.applicationName ?? "");
  const [deploying, setDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<"idle" | "in-progress" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (open) {
      setExecutionName(currentSettings?.applicationName ?? "");
      setDeployStatus("idle");
      setErrorMessage("");
    }
  }, [open, currentSettings?.applicationName]);

  const handleDeploy = async () => {
    if (!executionName.trim()) {
      showToast("Please enter an execution application name", "error");
      return;
    }
    if (!currentSettings || !currentWorkflow) {
      showToast("No application data available", "error");
      return;
    }

    setDeploying(true);
    setDeployStatus("in-progress");
    setErrorMessage("");

    try {
      await onlineApi.postWorkflow({
        applicationName: executionName.trim(),
        body: JSON.stringify({
          applicationSetting: currentSettings,
          workflow: currentWorkflow,
        }),
      });
      setDeployStatus("success");
      showToast("Deployment triggered successfully", "success");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setDeployStatus("error");
      setErrorMessage(msg);
      showToast(msg, "error");
    } finally {
      setDeploying(false);
    }
  };

  const handleClose = () => {
    if (!deploying) {
      setDeployStatus("idle");
      setErrorMessage("");
      onClose();
    }
  };

  if (!open) return null;

  const sourceAppName = currentSettings?.applicationName ?? "—";
  const nodeCount = currentWorkflow?.pluginList?.length ?? 0;

  const statusColor =
    deployStatus === "success" ? "#24a148" :
    deployStatus === "error" ? "#da1e28" : "#0f62fe";

  return (
    <div className="modal-overlay fade-in" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-box slide-up" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <span className="modal-title">Deploy Application</span>
          <button className="modal-close" onClick={handleClose} disabled={deploying}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: "#525252", marginBottom: 20, lineHeight: 1.6 }}>
            Send this application and its workflow to the Online API runtime for execution.
          </p>

          <div style={{ background: "#f4f4f4", border: "1px solid #e0e0e0", padding: "12px 16px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.32px", color: "#161616", marginBottom: 8 }}>
              Source (Hub)
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              <div>
                <div style={{ fontSize: 11, color: "#525252", marginBottom: 2 }}>Application</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#161616", fontFamily: '"IBM Plex Mono",monospace' }}>{sourceAppName}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#525252", marginBottom: 2 }}>Nodes</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#161616" }}>{nodeCount}</div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="cds-label">Execution Application Name</label>
            <input
              className="cds-input"
              placeholder={sourceAppName}
              value={executionName}
              onChange={(e) => setExecutionName(e.target.value)}
              disabled={deploying}
            />
            <div style={{ fontSize: 11, color: "#525252", marginTop: 4 }}>
              The application name the Online API runtime uses to identify and execute this deployment.
            </div>
          </div>

          {deployStatus !== "idle" && (
            <div
              style={{
                marginTop: 16,
                padding: "12px 16px",
                background:
                  deployStatus === "success" ? "#defbe6" :
                  deployStatus === "error" ? "#fff1f1" : "#edf5ff",
                border: `1px solid ${statusColor}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {deployStatus === "in-progress" && (
                  <span style={{ color: "#0f62fe", fontSize: 16 }}>⟳</span>
                )}
                {deployStatus === "success" && (
                  <span style={{ color: "#24a148", fontSize: 14 }}>✓</span>
                )}
                {deployStatus === "error" && (
                  <span style={{ color: "#da1e28", fontSize: 14 }}>✕</span>
                )}
                <span style={{ fontSize: 13, color: statusColor }}>
                  {deployStatus === "in-progress"
                    ? "Sending to Online API…"
                    : deployStatus === "success"
                    ? "Deployment triggered successfully"
                    : "Deployment failed"}
                </span>
              </div>
              {deployStatus === "error" && errorMessage && (
                <div style={{ fontSize: 12, color: "#da1e28", marginTop: 8 }}>{errorMessage}</div>
              )}
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
            disabled={deploying || !executionName.trim()}
          >
            {deploying ? "Deploying…" : "Deploy"}
          </button>
        </div>
      </div>
    </div>
  );
};
