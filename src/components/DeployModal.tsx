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

interface DeployFormData {
  executionAppName: string;
  confirmationNumber: string;
  channelKind: string;
}

export const DeployModal: React.FC<DeployModalProps> = ({
  open,
  onClose,
  currentWorkflow,
  currentSettings,
}) => {
  const { showToast } = useToast();
  const [form, setForm] = useState<DeployFormData>({
    executionAppName: "",
    confirmationNumber: `deploy-${Date.now()}`,
    channelKind: "",
  });
  const [deploying, setDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<"idle" | "success" | "error">("idle");
  const [deployMessage, setDeployMessage] = useState("");

  const set = (k: keyof DeployFormData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleDeploy = async () => {
    if (!form.executionAppName.trim()) {
      showToast("Execution application name is required", "error");
      return;
    }
    if (!form.confirmationNumber.trim()) {
      showToast("Confirmation number is required", "error");
      return;
    }
    if (!currentWorkflow || !currentSettings) {
      showToast("No workflow or settings data available", "error");
      return;
    }

    setDeploying(true);
    setDeployStatus("idle");
    setDeployMessage("");

    try {
      const body = JSON.stringify({
        applicationInfo: currentSettings,
        workflow: currentWorkflow,
      });

      await onlineApi.postWorkflow({
        applicationName: form.executionAppName.trim(),
        confirmationNumber: form.confirmationNumber.trim(),
        channelKind: form.channelKind.trim() || undefined,
        body,
      });

      setDeployStatus("success");
      setDeployMessage("Deploy request accepted by online API.");
      showToast("Deploy request sent successfully", "success");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setDeployStatus("error");
      setDeployMessage(msg);
      showToast(msg, "error");
    } finally {
      setDeploying(false);
    }
  };

  const handleClose = () => {
    if (!deploying) {
      setDeployStatus("idle");
      setDeployMessage("");
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay fade-in" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-box slide-up" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <span className="modal-title">Deploy Application</span>
          <button className="modal-close" onClick={handleClose} disabled={deploying}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: "#525252", marginBottom: 20, lineHeight: 1.6 }}>
            Deploy <strong>{currentSettings?.applicationName ?? "this application"}</strong> via
            the online API. The source application settings and workflow are automatically
            assembled as the request body.
          </p>

          <div style={{
            marginBottom: 20, padding: 12,
            background: "#f4f4f4", border: "1px solid #e0e0e0",
            fontSize: 12, color: "#525252",
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.32px", marginBottom: 8, color: "#161616" }}>Source Application</div>
            <div><strong>Name:</strong> {currentSettings?.applicationName ?? "—"}</div>
            <div style={{ marginTop: 4 }}><strong>Nodes:</strong> {currentWorkflow?.pluginList?.length ?? 0}</div>
          </div>

          <div className="form-group">
            <label className="cds-label">Execution Application Name</label>
            <p style={{ fontSize: 12, color: "#8d8d8d", margin: "4px 0 8px" }}>
              The online API application that handles this deploy request
            </p>
            <input
              className="cds-input"
              placeholder="deploy-workflow"
              value={form.executionAppName}
              onChange={(e) => set("executionAppName", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="cds-label">Confirmation Number</label>
            <input
              className="cds-input"
              placeholder="deploy-12345"
              value={form.confirmationNumber}
              onChange={(e) => set("confirmationNumber", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="cds-label">
              Channel Kind{" "}
              <span style={{ fontWeight: 400, color: "#8d8d8d" }}>(optional)</span>
            </label>
            <input
              className="cds-input"
              placeholder="e.g. EMAIL, SMS"
              value={form.channelKind}
              onChange={(e) => set("channelKind", e.target.value)}
            />
          </div>

          {deployStatus !== "idle" && (
            <div style={{
              marginTop: 16, padding: 12,
              background: deployStatus === "success" ? "#defbe6" : "#fff1f1",
              border: `1px solid ${deployStatus === "success" ? "#a7f0ba" : "#ffb3b8"}`,
              fontSize: 13,
              color: deployStatus === "success" ? "#0e6027" : "#da1e28",
            }}>
              {deployStatus === "success" ? "✓ " : "✕ "}{deployMessage}
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
