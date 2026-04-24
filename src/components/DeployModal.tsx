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

export const DeployModal: React.FC<DeployModalProps> = ({
  open,
  onClose,
  currentWorkflow,
  currentSettings,
}) => {
  const { showToast } = useToast();
  const [executingAppName, setExecutingAppName] = useState(currentSettings?.applicationName ?? "");
  const [deploying, setDeploying] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (open) {
      setExecutingAppName(currentSettings?.applicationName ?? "");
      setResult(null);
    }
  }, [open, currentSettings?.applicationName]);

  const handleDeploy = async () => {
    if (!executingAppName.trim()) {
      showToast("Please enter an executing application name", "error");
      return;
    }
    if (!currentWorkflow || !currentSettings) {
      showToast("No workflow or settings data available", "error");
      return;
    }

    setDeploying(true);
    setResult(null);
    try {
      const body = JSON.stringify({
        entitySetting: currentSettings,
        workFlow: currentWorkflow,
      });
      const res = await onlineApi.postWorkflow({
        applicationName: executingAppName.trim(),
        body,
        contentType: "application/json",
      });
      const text = await res.text();
      setResult({ ok: true, text: text || "(no response body)" });
      showToast("Deploy request sent successfully", "success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setResult({ ok: false, text: msg });
      showToast(msg, "error");
    } finally {
      setDeploying(false);
    }
  };

  const handleClose = () => {
    if (!deploying) {
      setResult(null);
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
            Deploy this application to the online API. The request sends two blocks: source application entity settings (Block A) and the workflow definition (Block B).
          </p>

          <div style={{ background: "#f4f4f4", border: "1px solid #e0e0e0", padding: "12px 16px", marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.32px", color: "#525252", marginBottom: 4 }}>Source Application</div>
            <div style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 13, color: "#161616" }}>
              {currentSettings?.applicationName ?? "—"}
            </div>
          </div>

          <div className="form-group">
            <label className="cds-label">Executing Application Name</label>
            <div style={{ fontSize: 12, color: "#6f6f6f", marginBottom: 6, lineHeight: 1.5 }}>
              The <code style={{ fontFamily: '"IBM Plex Mono",monospace', background: "#f4f4f4", padding: "1px 4px" }}>applicationName</code> query parameter sent to the online API. Defaults to the source application name.
            </div>
            <input
              className="cds-input"
              placeholder="executing-application-name"
              value={executingAppName}
              onChange={(e) => setExecutingAppName(e.target.value)}
              disabled={deploying}
            />
          </div>

          {result && (
            <div style={{
              marginTop: 16,
              padding: 16,
              background: result.ok ? "#defbe6" : "#fff1f1",
              border: `1px solid ${result.ok ? "#24a148" : "#da1e28"}`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.32px", color: result.ok ? "#198038" : "#da1e28", marginBottom: 8 }}>
                {result.ok ? "✓ Deploy Request Sent" : "✕ Deploy Failed"}
              </div>
              <pre style={{
                fontSize: 12,
                fontFamily: '"IBM Plex Mono",monospace',
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                color: "#161616",
                maxHeight: 200,
                overflowY: "auto",
              }}>
                {result.text}
              </pre>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={handleClose} disabled={deploying}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleDeploy}
            disabled={deploying || !executingAppName.trim()}
          >
            {deploying ? "Deploying…" : "Deploy to Online API"}
          </button>
        </div>
      </div>
    </div>
  );
};
