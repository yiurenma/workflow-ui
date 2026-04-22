import React, { useEffect, useState } from "react";
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
  const [executionName, setExecutionName] = useState(
    currentSettings?.applicationName ?? ""
  );
  const [deploying, setDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<
    "idle" | "in-progress" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (open) {
      setExecutionName(currentSettings?.applicationName ?? "");
      setDeployStatus("idle");
      setErrorMsg("");
    }
  }, [open, currentSettings]);

  const handleDeploy = async () => {
    if (!executionName.trim()) {
      showToast("Please enter an execution application name", "error");
      return;
    }
    if (!currentWorkflow || !currentSettings) {
      showToast("No workflow or settings data available", "error");
      return;
    }

    setDeploying(true);
    setDeployStatus("in-progress");
    setErrorMsg("");
    try {
      const body = JSON.stringify({
        sourceApplication: currentSettings,
        workflow: currentWorkflow,
      });
      await onlineApi.postWorkflow({
        applicationName: executionName.trim(),
        confirmationNumber: crypto.randomUUID(),
        body,
        contentType: "application/json",
      });
      setDeployStatus("success");
      showToast("Deployment submitted successfully", "success");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setDeployStatus("error");
      setErrorMsg(msg);
      showToast(msg, "error");
    } finally {
      setDeploying(false);
    }
  };

  const handleClose = () => {
    if (!deploying) onClose();
  };

  if (!open) return null;

  return (
    <div
      className="modal-overlay fade-in"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="modal-box slide-up" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <span className="modal-title">Deploy Application</span>
          <button className="modal-close" onClick={handleClose} disabled={deploying}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: "#525252", marginBottom: 20, lineHeight: 1.6 }}>
            Submit this application and its workflow to the Online API. Source
            application data and workflow are assembled automatically from the Hub.
            The execution name identifies this deployment at runtime.
          </p>

          <div className="form-group">
            <label className="cds-label">Source Application</label>
            <div
              style={{
                padding: "10px 12px",
                background: "#f4f4f4",
                border: "1px solid #e0e0e0",
                fontSize: 13,
                color: "#525252",
                fontFamily: '"IBM Plex Mono",monospace',
              }}
            >
              {currentSettings?.applicationName ?? "—"}
            </div>
          </div>

          <div className="form-group">
            <label className="cds-label">Execution Application Name</label>
            <input
              className="cds-input"
              placeholder="runtime-execution-name"
              value={executionName}
              onChange={(e) => setExecutionName(e.target.value)}
              disabled={deploying}
            />
            <div style={{ fontSize: 11, color: "#525252", marginTop: 4 }}>
              Used as the{" "}
              <code
                style={{
                  fontFamily: '"IBM Plex Mono",monospace',
                  background: "#e0e0e0",
                  padding: "0 3px",
                }}
              >
                applicationName
              </code>{" "}
              query parameter for runtime execution.
            </div>
          </div>

          {deployStatus !== "idle" && (
            <div
              style={{
                marginTop: 16,
                padding: 16,
                background: "#f4f4f4",
                border: "1px solid #e0e0e0",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.32px",
                  color: "#161616",
                  marginBottom: 10,
                }}
              >
                Deployment Status
              </div>
              {deployStatus === "in-progress" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 13,
                    color: "#0f62fe",
                  }}
                >
                  <span>⟳</span>
                  <span>Submitting to Online API…</span>
                </div>
              )}
              {deployStatus === "success" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 13,
                    color: "#198038",
                  }}
                >
                  <span>✓</span>
                  <span>Deployment submitted successfully</span>
                </div>
              )}
              {deployStatus === "error" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 13,
                      color: "#da1e28",
                    }}
                  >
                    <span>✕</span>
                    <span>Deployment failed</span>
                  </div>
                  {errorMsg && (
                    <div
                      style={{ fontSize: 12, color: "#da1e28", marginTop: 8 }}
                    >
                      {errorMsg}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-ghost"
            onClick={handleClose}
            disabled={deploying}
          >
            {deployStatus === "success" ? "Close" : "Cancel"}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleDeploy}
            disabled={deploying || deployStatus === "success"}
          >
            {deploying ? "Deploying…" : "Deploy"}
          </button>
        </div>
      </div>
    </div>
  );
};
