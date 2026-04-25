import React, { useState } from "react";
import type { WorkflowEntitySettingRow } from "@/api/types";
import { useToast } from "@/contexts/ToastContext";
import { operationApi } from "@/api/services/operation";
import { onlineApi } from "@/api/services/online";

interface DeployModalProps {
  open: boolean;
  onClose: () => void;
  currentWorkflow: unknown; // kept for API compatibility — not used in new flow
  currentSettings: WorkflowEntitySettingRow | null;
}

interface DeployFormData {
  executionAppName: string;
  confirmationNumber: string;
}

type DeployStatus =
  | { kind: "idle" }
  | { kind: "deploying" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export const DeployModal: React.FC<DeployModalProps> = ({
  open,
  onClose,
  currentSettings,
}) => {
  const { showToast } = useToast();
  const [form, setForm] = useState<DeployFormData>({
    executionAppName: currentSettings?.applicationName ?? "",
    confirmationNumber: "",
  });
  const [status, setStatus] = useState<DeployStatus>({ kind: "idle" });

  const set = (k: keyof DeployFormData, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleDeploy = async () => {
    if (!form.executionAppName.trim()) {
      showToast("Execution Application Name is required", "error");
      return;
    }

    const sourceAppName = currentSettings?.applicationName;
    if (!sourceAppName) {
      showToast("No source application loaded", "error");
      return;
    }

    setStatus({ kind: "deploying" });

    try {
      // Step a: fetch fresh entity settings
      const settingsPage = await operationApi.listEntitySettings({
        applicationName: sourceAppName,
        size: 1,
      });
      const entitySetting = settingsPage.content[0];
      if (!entitySetting) {
        throw new Error(`No entity settings found for application: ${sourceAppName}`);
      }

      // Step b: fetch fresh workflow
      const workflowData = await operationApi.getWorkflow(sourceAppName);

      // Step c: build request body
      const bodyStr = JSON.stringify({
        applicationInfo: entitySetting,
        workflow: workflowData,
      });

      // Step d: resolve confirmationNumber
      const confirmationNumber =
        form.confirmationNumber.trim() !== ""
          ? form.confirmationNumber.trim()
          : crypto.randomUUID();

      // Step e: call online API
      await onlineApi.postWorkflow({
        applicationName: form.executionAppName.trim(),
        confirmationNumber,
        body: bodyStr,
      });

      setStatus({ kind: "success" });
      showToast("Deployment submitted successfully", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus({ kind: "error", message });
      showToast(message, "error");
    }
  };

  const handleClose = () => {
    if (status.kind !== "deploying") {
      setStatus({ kind: "idle" });
      onClose();
    }
  };

  const deploying = status.kind === "deploying";

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
            &#10005;
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: 13, color: "#525252", marginBottom: 20, lineHeight: 1.6 }}>
            Deploy this application to the online runtime. The source application
            settings and workflow will be fetched and submitted to the online API
            for execution.
          </p>

          <div className="form-group">
            <label className="cds-label">Source Application</label>
            <input
              className="cds-input"
              value={currentSettings?.applicationName ?? "—"}
              readOnly
              style={{ background: "#f4f4f4", color: "#525252", cursor: "default" }}
            />
          </div>

          <div className="form-group">
            <label className="cds-label">
              Execution Application Name
              <span style={{ color: "#da1e28", marginLeft: 2 }}>*</span>
            </label>
            <input
              className="cds-input"
              placeholder="Runtime application name"
              value={form.executionAppName}
              onChange={(e) => set("executionAppName", e.target.value)}
              disabled={deploying}
            />
          </div>

          <div className="form-group">
            <label className="cds-label">Confirmation Number</label>
            <input
              className="cds-input"
              placeholder="Auto-generated if blank"
              value={form.confirmationNumber}
              onChange={(e) => set("confirmationNumber", e.target.value)}
              disabled={deploying}
            />
          </div>

          {status.kind !== "idle" && (
            <div
              style={{
                marginTop: 16,
                padding: "12px 16px",
                background:
                  status.kind === "success"
                    ? "#defbe6"
                    : status.kind === "error"
                    ? "#fff1f1"
                    : "#edf5ff",
                border: `1px solid ${
                  status.kind === "success"
                    ? "#a7f0ba"
                    : status.kind === "error"
                    ? "#ffd7d9"
                    : "#d0e2ff"
                }`,
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 13,
                color:
                  status.kind === "success"
                    ? "#198038"
                    : status.kind === "error"
                    ? "#da1e28"
                    : "#0043ce",
              }}
            >
              {status.kind === "deploying" && (
                <>
                  <span style={{ fontSize: 16 }}>&#8635;</span>
                  <span>Deploying&hellip;</span>
                </>
              )}
              {status.kind === "success" && (
                <>
                  <span style={{ fontSize: 14 }}>&#10003;</span>
                  <span>Deployment submitted</span>
                </>
              )}
              {status.kind === "error" && (
                <>
                  <span style={{ fontSize: 14 }}>&#10005;</span>
                  <span>{status.message}</span>
                </>
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
            disabled={deploying}
          >
            {deploying ? "Deploying…" : "Deploy"}
          </button>
        </div>
      </div>
    </div>
  );
};
