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
  const [executionName, setExecutionName] = useState(
    currentSettings?.applicationName ?? ""
  );
  const [deploying, setDeploying] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const reset = () => {
    setStatus("idle");
    setErrorMsg("");
  };

  const handleDeploy = async () => {
    if (!executionName.trim()) {
      showToast("Application name is required", "error");
      return;
    }
    if (!currentSettings || !currentWorkflow) {
      showToast("No application data available", "error");
      return;
    }

    setDeploying(true);
    reset();
    try {
      const body = JSON.stringify({
        sourceApplicationSetting: currentSettings,
        workflow: currentWorkflow,
      });
      await onlineApi.postWorkflow({
        applicationName: executionName.trim(),
        body,
        contentType: "application/json",
      });
      setStatus("success");
      showToast("Deploy submitted successfully", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus("error");
      setErrorMsg(msg);
      showToast(msg, "error");
    } finally {
      setDeploying(false);
    }
  };

  const handleClose = () => {
    if (!deploying) {
      reset();
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="modal-overlay fade-in"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="modal-box slide-up" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <span className="modal-title">Deploy Application</span>
          <button className="modal-close" onClick={handleClose} disabled={deploying}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p
            style={{
              fontSize: 13,
              color: "#525252",
              marginBottom: 20,
              lineHeight: 1.6,
            }}
          >
            Submit this application and its workflow to the online API for
            deployment. The current application settings and workflow are sent
            automatically.
          </p>

          <div className="form-group">
            <label className="cds-label">Execution Application Name</label>
            <input
              className="cds-input"
              data-testid="deploy-execution-name"
              placeholder={currentSettings?.applicationName ?? "my-application"}
              value={executionName}
              onChange={(e) => setExecutionName(e.target.value)}
              disabled={deploying}
            />
            <p
              style={{
                fontSize: 11,
                color: "#6f6f6f",
                marginTop: 4,
              }}
            >
              The name used at runtime to execute this workflow.
            </p>
          </div>

          {status === "success" && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                background: "#defbe6",
                border: "1px solid #24a148",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ color: "#24a148", fontSize: 16 }}>✓</span>
              <span style={{ fontSize: 13, color: "#198038" }}>
                Deploy submitted to online API.
              </span>
            </div>
          )}

          {status === "error" && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                background: "#fff1f1",
                border: "1px solid #da1e28",
              }}
            >
              <p style={{ fontSize: 13, color: "#da1e28", margin: 0 }}>
                {errorMsg}
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-ghost"
            onClick={handleClose}
            disabled={deploying}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            data-testid="deploy-submit-btn"
            onClick={handleDeploy}
            disabled={deploying || status === "success"}
          >
            {deploying ? "Deploying…" : "Deploy"}
          </button>
        </div>
      </div>
    </div>
  );
};
