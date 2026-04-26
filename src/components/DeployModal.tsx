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
  const [applicationName, setApplicationName] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [responseText, setResponseText] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setApplicationName(currentSettings?.applicationName ?? "");
      setResponseText(null);
      setErrorMsg(null);
    }
  }, [open, currentSettings?.applicationName]);

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
    setResponseText(null);
    setErrorMsg(null);

    try {
      const response = await onlineApi.postWorkflow({
        applicationName: applicationName.trim(),
        body: JSON.stringify({
          entitySetting: currentSettings,
          workflow: currentWorkflow,
        }),
        contentType: "application/json",
      });

      const text = await response.text();
      setResponseText(text || "Deployment initiated successfully");
      showToast("Deployment initiated", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
      showToast(msg, "error");
    } finally {
      setDeploying(false);
    }
  };

  const handleClose = () => {
    if (!deploying) {
      setResponseText(null);
      setErrorMsg(null);
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
            Deploy this application via the online API. The source application settings and workflow are sent as the request body; the execution application name determines which deploy workflow runs.
          </p>

          <div className="form-group">
            <label className="cds-label">Execution Application Name</label>
            <input
              className="cds-input"
              placeholder="e.g. deploy-workflow"
              value={applicationName}
              onChange={(e) => setApplicationName(e.target.value)}
              disabled={deploying}
            />
            <div style={{ fontSize: 11, color: "#6f6f6f", marginTop: 4 }}>
              The name of the workflow to execute on the online API (runtime execution name)
            </div>
          </div>

          <div style={{ marginTop: 16, padding: 12, background: "#f4f4f4", border: "1px solid #e0e0e0", fontSize: 12 }}>
            <div style={{ fontWeight: 700, color: "#161616", marginBottom: 8, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.32px" }}>
              Request Body
            </div>
            <div style={{ color: "#525252", lineHeight: 2 }}>
              <div>
                <span style={{ fontFamily: '"IBM Plex Mono",monospace', color: "#0f62fe", fontWeight: 600 }}>Block A</span>
                <span style={{ marginLeft: 8 }}>Source application settings:</span>
                <span style={{ fontFamily: '"IBM Plex Mono",monospace', color: "#161616", marginLeft: 8 }}>
                  {currentSettings?.applicationName ?? "—"}
                </span>
              </div>
              <div>
                <span style={{ fontFamily: '"IBM Plex Mono",monospace', color: "#0f62fe", fontWeight: 600 }}>Block B</span>
                <span style={{ marginLeft: 8 }}>Workflow definition:</span>
                <span style={{ fontFamily: '"IBM Plex Mono",monospace', color: "#161616", marginLeft: 8 }}>
                  {(currentWorkflow?.pluginList?.length ?? 0)} node(s)
                </span>
              </div>
            </div>
          </div>

          {responseText && (
            <div style={{ marginTop: 16, padding: 12, background: "#defbe6", border: "1px solid #24a148", fontSize: 12, color: "#198038" }}>
              <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.32px" }}>Deployment Response</div>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: 11, fontFamily: '"IBM Plex Mono",monospace', color: "#198038" }}>{responseText}</pre>
            </div>
          )}

          {errorMsg && (
            <div style={{ marginTop: 16, padding: 12, background: "#fff1f1", border: "1px solid #da1e28", fontSize: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.32px", color: "#da1e28" }}>Deployment Failed</div>
              <div style={{ color: "#da1e28" }}>{errorMsg}</div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={handleClose} disabled={deploying}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleDeploy}
            disabled={deploying || !applicationName.trim()}
          >
            {deploying ? "Deploying…" : "Deploy"}
          </button>
        </div>
      </div>
    </div>
  );
};
