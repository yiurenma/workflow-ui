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
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (open && currentSettings) {
      setExecutionAppName(currentSettings.applicationName);
      setDeployStatus("idle");
      setErrorMessage("");
    }
  }, [open, currentSettings]);

  const handleDeploy = async () => {
    if (!executionAppName.trim()) {
      showToast("Please enter execution application name", "error");
      return;
    }
    if (!currentSettings || !currentWorkflow) {
      showToast("No application data available", "error");
      return;
    }

    setDeploying(true);
    setDeployStatus("idle");
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

  const nodeCount = currentWorkflow?.pluginList?.length ?? 0;

  if (!open) return null;

  return (
    <div className="modal-overlay fade-in" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-box slide-up" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <span className="modal-title">Deploy to Online</span>
          <button className="modal-close" onClick={handleClose} disabled={deploying}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: "#525252", marginBottom: 20, lineHeight: 1.6 }}>
            Deploy this application's configuration and workflow to the online execution engine. The online API will be called with the source application settings and workflow as payload.
          </p>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="cds-label">Source Application</label>
            <div
              style={{
                padding: "10px 12px",
                background: "#f4f4f4",
                border: "1px solid #e0e0e0",
                fontSize: 13,
                color: "#161616",
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
              placeholder="application-name-to-execute"
              value={executionAppName}
              onChange={(e) => setExecutionAppName(e.target.value)}
              disabled={deploying}
            />
            <div style={{ fontSize: 11, color: "#525252", marginTop: 4 }}>
              The application name used as the runtime execution context in the online API query parameter.
            </div>
          </div>

          <div style={{ marginTop: 16, padding: 12, background: "#f4f4f4", border: "1px solid #e0e0e0" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.32px",
                color: "#161616",
                marginBottom: 8,
              }}
            >
              Payload Summary
            </div>
            <div style={{ fontSize: 12, color: "#525252", lineHeight: 1.8 }}>
              <div>
                <span style={{ fontWeight: 600 }}>Block A</span> — Application settings:{" "}
                <span style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                  {currentSettings?.applicationName ?? "—"}
                </span>
              </div>
              <div>
                <span style={{ fontWeight: 600 }}>Block B</span> — Workflow: {nodeCount} node{nodeCount !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {deployStatus === "success" && (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                background: "#defbe6",
                border: "1px solid #24a148",
                fontSize: 13,
                color: "#198038",
              }}
            >
              ✓ Deployment triggered successfully
            </div>
          )}
          {deployStatus === "error" && (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                background: "#fff1f1",
                border: "1px solid #da1e28",
                fontSize: 12,
                color: "#da1e28",
              }}
            >
              {errorMessage}
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
            disabled={deploying || deployStatus === "success"}
          >
            {deploying ? "Deploying…" : "Deploy"}
          </button>
        </div>
      </div>
    </div>
  );
};
