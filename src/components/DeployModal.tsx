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
  const [applicationName, setApplicationName] = useState(
    currentSettings?.applicationName ?? ""
  );
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [channelKind, setChannelKind] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (open && currentSettings) {
      setApplicationName(currentSettings.applicationName);
    }
  }, [open, currentSettings?.applicationName]);

  const handleDeploy = async () => {
    if (!applicationName.trim()) {
      showToast("Application name is required", "error");
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
        sourceApplication: currentSettings,
        workflow: currentWorkflow,
      });

      await onlineApi.postWorkflow({
        applicationName: applicationName.trim(),
        ...(confirmationNumber.trim() ? { confirmationNumber: confirmationNumber.trim() } : {}),
        ...(channelKind.trim() ? { channelKind: channelKind.trim() } : {}),
        body,
      });

      setResult({ success: true, message: "Deployment submitted successfully" });
      showToast("Deployment successful", "success");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setResult({ success: false, message: msg });
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
      <div className="modal-box slide-up" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <span className="modal-title">Deploy Application</span>
          <button className="modal-close" onClick={handleClose} disabled={deploying}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: "#525252", marginBottom: 20, lineHeight: 1.6 }}>
            Deploy <strong>{currentSettings?.applicationName}</strong> to the online API.
            The application name below is the runtime execution name used as the query parameter.
          </p>

          <div className="form-group">
            <label className="cds-label">
              Application Name <span style={{ color: "#da1e28" }}>*</span>
            </label>
            <p style={{ fontSize: 12, color: "#6f6f6f", marginBottom: 6 }}>
              Runtime execution name sent as <code>?applicationName=</code> to the online API.
            </p>
            <input
              className="cds-input"
              placeholder="my-application"
              value={applicationName}
              onChange={(e) => setApplicationName(e.target.value)}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="cds-label">Confirmation Number</label>
              <input
                className="cds-input"
                placeholder="optional"
                value={confirmationNumber}
                onChange={(e) => setConfirmationNumber(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="cds-label">Channel Kind</label>
              <input
                className="cds-input"
                placeholder="optional"
                value={channelKind}
                onChange={(e) => setChannelKind(e.target.value)}
              />
            </div>
          </div>

          <div style={{
            marginTop: 16,
            padding: 12,
            background: "#f4f4f4",
            border: "1px solid #e0e0e0",
            fontSize: 12,
            color: "#525252",
          }}>
            <div style={{
              fontWeight: 700,
              color: "#161616",
              marginBottom: 8,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.32px",
            }}>Payload preview</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div>
                Source application:{" "}
                <span style={{ fontFamily: '"IBM Plex Mono",monospace', color: "#161616" }}>
                  {currentSettings?.applicationName ?? "—"}
                </span>
              </div>
              <div>
                Workflow nodes:{" "}
                <span style={{ fontFamily: '"IBM Plex Mono",monospace', color: "#161616" }}>
                  {currentWorkflow?.pluginList?.length ?? 0}
                </span>
              </div>
            </div>
          </div>

          {result && (
            <div style={{
              marginTop: 12,
              padding: 12,
              background: result.success ? "#defbe6" : "#fff1f1",
              border: `1px solid ${result.success ? "#24a148" : "#da1e28"}`,
              color: result.success ? "#198038" : "#da1e28",
              fontSize: 13,
            }}>
              {result.success ? "✓ " : "✕ "}{result.message}
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
