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
  const [targetName, setTargetName] = useState(currentSettings?.applicationName ?? "");
  const [deploying, setDeploying] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultOk, setResultOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (open) {
      setTargetName(currentSettings?.applicationName ?? "");
      setResult(null);
      setResultOk(null);
    }
  }, [open, currentSettings?.applicationName]);

  const handleDeploy = async () => {
    if (!currentWorkflow || !currentSettings) {
      showToast("No workflow or settings data available", "error");
      return;
    }
    if (!targetName.trim()) {
      showToast("Please enter a target application name", "error");
      return;
    }
    setDeploying(true);
    setResult(null);
    setResultOk(null);
    try {
      const response = await onlineApi.postWorkflow({
        applicationName: targetName.trim(),
        body: JSON.stringify({ entitySetting: currentSettings, workflow: currentWorkflow }),
      });
      const text = await response.text();
      setResult(text.slice(0, 8000) || "OK");
      setResultOk(true);
      showToast("Deploy request sent successfully", "success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setResult(msg);
      setResultOk(false);
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
    <div className="modal-overlay fade-in" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-box slide-up" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <span className="modal-title">Deploy Application</span>
          <button className="modal-close" onClick={handleClose} disabled={deploying}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: "#525252", marginBottom: 20, lineHeight: 1.6 }}>
            Deploys <strong>{currentSettings?.applicationName}</strong> to the online environment.
            Sends entity settings (Block A) and workflow JSON (Block B) to the online API under the target application name.
          </p>

          <div className="form-group">
            <label className="cds-label">Target Application Name</label>
            <input
              className="cds-input"
              placeholder="target-application-name"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              disabled={deploying}
            />
            <div style={{ fontSize: 11, color: "#6f6f6f", marginTop: 4 }}>
              Runtime execution name on the online API. Defaults to the source application name.
            </div>
          </div>

          {result !== null && (
            <div style={{
              marginTop: 16,
              padding: "12px 16px",
              background: resultOk ? "#defbe6" : "#fff1f1",
              border: `1px solid ${resultOk ? "#a7f0ba" : "#ffd7d9"}`,
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.32px", color: resultOk ? "#198038" : "#da1e28",
                marginBottom: 8,
              }}>
                {resultOk ? "✓ Success" : "✕ Error"}
              </div>
              <pre style={{
                fontSize: 12, fontFamily: '"IBM Plex Mono",monospace',
                margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word",
                maxHeight: 200, overflowY: "auto",
                color: resultOk ? "#161616" : "#da1e28",
              }}>
                {result}
              </pre>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={handleClose} disabled={deploying}>
            {result !== null ? "Close" : "Cancel"}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleDeploy}
            disabled={deploying || !targetName.trim()}
          >
            {deploying ? "Deploying…" : "Deploy"}
          </button>
        </div>
      </div>
    </div>
  );
};
