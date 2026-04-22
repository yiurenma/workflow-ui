import React, { useState, useEffect } from "react";
import type { WorkFlow, WorkflowEntitySettingRow } from "@/api/types";
import { onlineApi } from "@/api/services/online";
import { useToast } from "@/contexts/ToastContext";

interface DeployModalProps {
  open: boolean;
  onClose: () => void;
  currentWorkflow: WorkFlow | null;
  currentSettings: WorkflowEntitySettingRow | null;
}

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const DeployModal: React.FC<DeployModalProps> = ({
  open,
  onClose,
  currentWorkflow,
  currentSettings,
}) => {
  const { showToast } = useToast();
  const [executionAppName, setExecutionAppName] = useState("");
  const [confirmationNumber, setConfirmationNumber] = useState(() => generateUUID());
  const [deploying, setDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<"idle" | "success" | "error">("idle");
  const [deployError, setDeployError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setConfirmationNumber(generateUUID());
      setDeployStatus("idle");
      setDeployError(null);
      setExecutionAppName("");
    }
  }, [open]);

  const handleDeploy = async () => {
    if (!executionAppName.trim()) {
      showToast("Please enter the Execution Application Name", "error");
      return;
    }
    if (!currentSettings || !currentWorkflow) {
      showToast("No application data available", "error");
      return;
    }

    setDeploying(true);
    setDeployStatus("idle");
    setDeployError(null);

    try {
      const payload = {
        sourceApplication: currentSettings,
        workflow: currentWorkflow,
      };

      await onlineApi.postWorkflow({
        applicationName: executionAppName.trim(),
        confirmationNumber: confirmationNumber.trim() || generateUUID(),
        body: JSON.stringify(payload),
      });

      setDeployStatus("success");
      showToast("Deploy request submitted successfully", "success");
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
      setDeployStatus("idle");
      setDeployError(null);
      onClose();
    }
  };

  if (!open) return null;

  const bodyPreviewObj = { sourceApplication: currentSettings, workflow: currentWorkflow };
  const bodyPreviewStr = JSON.stringify(bodyPreviewObj, null, 2);
  const truncated = bodyPreviewStr.length > 500;

  return (
    <div className="modal-overlay fade-in" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-box slide-up" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <span className="modal-title">Deploy Application</span>
          <button className="modal-close" onClick={handleClose} disabled={deploying}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: "#525252", marginBottom: 20, lineHeight: 1.6 }}>
            Submit this application and its workflow to the online API for deployment. The online API
            will execute the configured deploy workflow using the source application settings and
            workflow definition.
          </p>

          <div className="form-group">
            <label className="cds-label">Source Application</label>
            <div
              style={{
                height: 48,
                padding: "0 16px",
                display: "flex",
                alignItems: "center",
                background: "#f4f4f4",
                border: "1px solid #e0e0e0",
                fontSize: 13,
                color: "#525252",
                fontFamily: '"IBM Plex Mono", monospace',
              }}
            >
              {currentSettings?.applicationName ?? "—"}
            </div>
          </div>

          <div className="form-group">
            <label className="cds-label">Execution Application Name</label>
            <input
              className="cds-input"
              placeholder="deploy-workflow-app"
              value={executionAppName}
              onChange={(e) => setExecutionAppName(e.target.value)}
              disabled={deploying}
              autoFocus
            />
            <div style={{ fontSize: 11, color: "#525252", marginTop: 4 }}>
              The application registered in the online API that handles the deploy workflow.
            </div>
          </div>

          <div className="form-group">
            <label className="cds-label">Confirmation Number</label>
            <input
              className="cds-input"
              value={confirmationNumber}
              onChange={(e) => setConfirmationNumber(e.target.value)}
              disabled={deploying}
              style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 12 }}
            />
            <div style={{ fontSize: 11, color: "#525252", marginTop: 4 }}>
              Auto-generated UUID. Used for idempotency and run tracking.
            </div>
          </div>

          <div style={{ marginTop: 4 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.32px",
                color: "#525252",
                marginBottom: 8,
              }}
            >
              Request Body Preview
            </div>
            <pre
              style={{
                background: "#f4f4f4",
                border: "1px solid #e0e0e0",
                padding: 12,
                fontSize: 11,
                fontFamily: '"IBM Plex Mono", monospace',
                color: "#161616",
                overflowX: "auto",
                maxHeight: 140,
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {truncated ? bodyPreviewStr.slice(0, 500) + "\n…" : bodyPreviewStr}
            </pre>
          </div>

          {deployStatus === "success" && (
            <div
              style={{
                marginTop: 16,
                padding: "12px 16px",
                background: "#defbe6",
                border: "1px solid #24a148",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ color: "#24a148", fontSize: 16 }}>✓</span>
              <span style={{ fontSize: 13, color: "#198038" }}>Deploy request submitted successfully</span>
            </div>
          )}
          {deployStatus === "error" && deployError && (
            <div
              style={{
                marginTop: 16,
                padding: "12px 16px",
                background: "#fff1f1",
                border: "1px solid #da1e28",
              }}
            >
              <div style={{ fontSize: 13, color: "#da1e28", fontWeight: 600, marginBottom: 4 }}>Deploy failed</div>
              <div style={{ fontSize: 12, color: "#da1e28" }}>{deployError}</div>
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
