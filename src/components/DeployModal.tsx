import React, { useState } from "react";
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
  const [applicationName, setApplicationName] = useState(
    currentSettings?.applicationName ?? ""
  );
  const [deploying, setDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  React.useEffect(() => {
    if (open) {
      setApplicationName(currentSettings?.applicationName ?? "");
      setDeployStatus("idle");
      setErrorMessage("");
    }
  }, [open, currentSettings?.applicationName]);

  const handleDeploy = async () => {
    if (!applicationName.trim()) {
      showToast("Application name is required", "error");
      return;
    }
    if (!currentSettings || !currentWorkflow) {
      showToast("No workflow or settings data available", "error");
      return;
    }

    const confirmationNumber = crypto.randomUUID();
    const body = JSON.stringify({
      entitySetting: currentSettings,
      workflow: currentWorkflow,
    });

    setDeploying(true);
    setDeployStatus("idle");
    setErrorMessage("");

    try {
      await onlineApi.postWorkflow({
        applicationName: applicationName.trim(),
        confirmationNumber,
        body,
        contentType: "application/json",
      });
      setDeployStatus("success");
      showToast("Deployment submitted successfully", "success");
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

  const nodeCount = currentWorkflow?.pluginList?.length ?? 0;
  const sourceApp = currentSettings?.applicationName ?? "—";

  return (
    <div className="modal-overlay fade-in" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-box slide-up" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <span className="modal-title">Deploy Application</span>
          <button className="modal-close" onClick={handleClose} disabled={deploying}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: "#525252", marginBottom: 20, lineHeight: 1.6 }}>
            Deploy this application to the online environment. The source application settings and
            workflow will be sent as the deployment payload to the online API.
          </p>

          <div className="form-group">
            <label className="cds-label">Execution Application Name</label>
            <input
              className="cds-input"
              placeholder="my-application"
              value={applicationName}
              onChange={(e) => setApplicationName(e.target.value)}
            />
            <p style={{ fontSize: 12, color: "#6f6f6f", marginTop: 4 }}>
              The name under which this workflow will execute in the online environment.
            </p>
          </div>

          <div style={{ marginTop: 16, padding: 14, background: "#f4f4f4", border: "1px solid #e0e0e0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.32px", color: "#161616", marginBottom: 10 }}>
              Deployment Payload
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: 13, color: "#525252" }}>
                <span style={{ color: "#8d8d8d", fontSize: 11, fontFamily: '"IBM Plex Mono",monospace' }}>Block A</span>
                {" — "}Entity Settings:{" "}
                <span style={{ fontWeight: 600, color: "#161616" }}>{sourceApp}</span>
              </div>
              <div style={{ fontSize: 13, color: "#525252" }}>
                <span style={{ color: "#8d8d8d", fontSize: 11, fontFamily: '"IBM Plex Mono",monospace' }}>Block B</span>
                {" — "}Workflow:{" "}
                <span style={{ fontWeight: 600, color: "#161616" }}>{nodeCount} node{nodeCount !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>

          {deployStatus === "success" && (
            <div style={{ marginTop: 12, padding: 12, background: "#defbe6", border: "1px solid #24a148", fontSize: 13, color: "#198038" }}>
              ✓ Deployment submitted successfully
            </div>
          )}
          {deployStatus === "error" && (
            <div style={{ marginTop: 12, padding: 12, background: "#fff1f1", border: "1px solid #da1e28", fontSize: 13, color: "#da1e28" }}>
              ✕ {errorMessage}
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
