import React, { useEffect, useState } from "react";
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
  const [status, setStatus] = useState<"idle" | "in-progress" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (currentSettings?.applicationName) {
      setApplicationName(currentSettings.applicationName);
    }
  }, [currentSettings?.applicationName]);

  useEffect(() => {
    if (open) {
      setStatus("idle");
      setErrorMessage("");
    }
  }, [open]);

  const handleDeploy = async () => {
    if (!applicationName.trim()) {
      showToast("Please enter an application name", "error");
      return;
    }
    if (!currentWorkflow || !currentSettings) {
      showToast("No workflow or settings data available", "error");
      return;
    }

    setDeploying(true);
    setStatus("in-progress");
    setErrorMessage("");

    try {
      const confirmationNumber =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `deploy-${Date.now()}`;

      await onlineApi.postWorkflow({
        applicationName: applicationName.trim(),
        confirmationNumber,
        body: JSON.stringify({
          sourceApplication: currentSettings,
          workflow: currentWorkflow,
        }),
        contentType: "application/json",
      });

      setStatus("success");
      showToast("Deployment submitted successfully", "success");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setStatus("error");
      setErrorMessage(msg);
      showToast(msg, "error");
    } finally {
      setDeploying(false);
    }
  };

  const handleClose = () => {
    if (!deploying) {
      setStatus("idle");
      setErrorMessage("");
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
          <p style={{ fontSize: 13, color: "#525252", marginBottom: 20, lineHeight: 1.6 }}>
            Submit this application and its workflow to the online API for deployment execution.
            The source application settings and workflow JSON are sent as the request body.
          </p>

          <div className="form-group">
            <label className="cds-label">Application Name</label>
            <input
              className="cds-input"
              placeholder="my-application"
              value={applicationName}
              onChange={(e) => setApplicationName(e.target.value)}
              disabled={deploying}
            />
            <p style={{ fontSize: 12, color: "#525252", marginTop: 4 }}>
              The execution application name used by the online API at runtime.
            </p>
          </div>

          {status !== "idle" && (
            <div style={{ marginTop: 16, padding: 16, background: "#f4f4f4", border: "1px solid #e0e0e0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {status === "in-progress" && <span style={{ color: "#0f62fe", fontSize: 16 }}>⟳</span>}
                {status === "success" && <span style={{ color: "#24a148", fontSize: 14 }}>✓</span>}
                {status === "error" && <span style={{ color: "#da1e28", fontSize: 14 }}>✕</span>}
                <span
                  style={{
                    fontSize: 13,
                    color:
                      status === "success" ? "#198038" :
                      status === "error" ? "#da1e28" : "#0f62fe",
                  }}
                >
                  {status === "in-progress" && "Submitting deployment…"}
                  {status === "success" && "Deployment submitted successfully"}
                  {status === "error" && "Deployment failed"}
                </span>
              </div>
              {status === "error" && errorMessage && (
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
            disabled={deploying || status === "success"}
          >
            {deploying ? "Deploying…" : "Deploy"}
          </button>
        </div>
      </div>
    </div>
  );
};
