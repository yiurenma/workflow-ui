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

function genId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const DeployModal: React.FC<DeployModalProps> = ({
  open,
  onClose,
  currentWorkflow,
  currentSettings,
}) => {
  const { showToast } = useToast();
  const [executionName, setExecutionName] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [status, setStatus] = useState<"idle" | "in-progress" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  React.useEffect(() => {
    if (open) {
      setExecutionName(currentSettings?.applicationName ?? "");
      setStatus("idle");
      setErrorMsg("");
    }
  }, [open, currentSettings]);

  const handleDeploy = async () => {
    if (!executionName.trim()) {
      showToast("Please enter the execution application name", "error");
      return;
    }
    if (!currentWorkflow || !currentSettings) {
      showToast("No workflow or settings data available", "error");
      return;
    }

    setDeploying(true);
    setStatus("in-progress");
    setErrorMsg("");

    try {
      await onlineApi.postWorkflow({
        applicationName: executionName.trim(),
        confirmationNumber: genId(),
        body: JSON.stringify({
          applicationSettings: currentSettings,
          workflow: currentWorkflow,
        }),
      });

      setStatus("success");
      showToast("Deploy request accepted by online API", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus("error");
      setErrorMsg(msg);
    } finally {
      setDeploying(false);
    }
  };

  const handleClose = () => {
    if (!deploying) {
      setStatus("idle");
      setErrorMsg("");
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay fade-in" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-box slide-up" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <span className="modal-title">Deploy Application</span>
          <button className="modal-close" onClick={handleClose} disabled={deploying}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ background: "#f4f4f4", border: "1px solid #e0e0e0", padding: "12px 16px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.32px", color: "#525252", marginBottom: 6 }}>
              Source Application
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#161616" }}>{currentSettings?.applicationName ?? "—"}</div>
            <div style={{ fontSize: 12, color: "#525252", marginTop: 4, lineHeight: 1.5 }}>
              Application settings and workflow JSON will be submitted to the online API for deployment.
            </div>
          </div>

          <div className="form-group">
            <label className="cds-label">Execution Application Name</label>
            <input
              className="cds-input"
              placeholder="target-application-name"
              value={executionName}
              onChange={(e) => setExecutionName(e.target.value)}
              disabled={deploying}
            />
            <div style={{ fontSize: 11, color: "#525252", marginTop: 4 }}>
              The application name registered in the online API that will execute this deployment workflow.
            </div>
          </div>

          {status !== "idle" && (
            <div style={{ marginTop: 16, padding: 16, background: "#f4f4f4", border: "1px solid #e0e0e0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.32px", color: "#161616", marginBottom: 10 }}>
                Status
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ flexShrink: 0, fontSize: 14 }}>
                  {status === "in-progress" && <span style={{ color: "#0f62fe" }}>⟳</span>}
                  {status === "success" && <span style={{ color: "#24a148" }}>✓</span>}
                  {status === "error" && <span style={{ color: "#da1e28" }}>✕</span>}
                </span>
                <div>
                  <span style={{
                    fontSize: 13,
                    color: status === "success" ? "#198038" : status === "error" ? "#da1e28" : "#0f62fe",
                  }}>
                    {status === "in-progress" && "Submitting deploy request to online API…"}
                    {status === "success" && "Deploy request accepted by online API"}
                    {status === "error" && "Deploy request failed"}
                  </span>
                  {status === "error" && errorMsg && (
                    <div style={{ fontSize: 12, color: "#da1e28", marginTop: 4 }}>{errorMsg}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={handleClose} disabled={deploying}>Cancel</button>
          <button className="btn btn-primary" onClick={handleDeploy} disabled={deploying || status === "success"}>
            {deploying ? "Deploying…" : "Deploy"}
          </button>
        </div>
      </div>
    </div>
  );
};
