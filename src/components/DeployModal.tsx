import React, { useState } from "react";
import type { WorkFlow, WorkflowEntitySettingRow } from "@/api/types";
import { useToast } from "@/contexts/ToastContext";
import { onlineApi } from "@/api/services/online";
import { operationApi } from "@/api/services/operation";

interface DeployModalProps {
  open: boolean;
  onClose: () => void;
  currentWorkflow: WorkFlow | null;
  currentSettings: WorkflowEntitySettingRow | null;
}

interface DeployFormData {
  executionAppName: string;
  confirmationNumber: string;
}

interface DeployStep {
  id: number;
  label: string;
  status: "pending" | "in-progress" | "success" | "error";
  message?: string;
}

const STEPS: Omit<DeployStep, "status">[] = [
  { id: 1, label: "Fetch source application data" },
  { id: 2, label: "Submit to online API" },
];

function randomUUID(): string {
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
  const [form, setForm] = useState<DeployFormData>({
    executionAppName: "",
    confirmationNumber: "",
  });
  const [deploying, setDeploying] = useState(false);
  const [steps, setSteps] = useState<DeployStep[]>(
    STEPS.map((s) => ({ ...s, status: "pending" }))
  );

  const resetSteps = () =>
    setSteps(STEPS.map((s) => ({ ...s, status: "pending" })));

  const updateStep = (id: number, status: DeployStep["status"], message?: string) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status, message } : s)));

  const set = (k: keyof DeployFormData, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleDeploy = async () => {
    if (!form.executionAppName.trim()) {
      showToast("Execution application name is required", "error");
      return;
    }
    if (!currentSettings) {
      showToast("No source application selected", "error");
      return;
    }

    setDeploying(true);
    resetSteps();

    try {
      // Step 1: fetch fresh source data from operation API
      updateStep(1, "in-progress");
      const [entitySetting, workflow] = await Promise.all([
        operationApi
          .listEntitySettings({ applicationName: currentSettings.applicationName, size: 1 })
          .then((page) => page.content[0] ?? currentSettings),
        currentWorkflow
          ? Promise.resolve(currentWorkflow)
          : operationApi.getWorkflow(currentSettings.applicationName),
      ]);
      updateStep(1, "success");

      // Step 2: submit to online API
      updateStep(2, "in-progress");
      const confirmationNumber = form.confirmationNumber.trim() || randomUUID();
      const body = JSON.stringify({ applicationSetting: entitySetting, workflow });
      await onlineApi.postWorkflow({
        applicationName: form.executionAppName.trim(),
        confirmationNumber,
        body,
      });
      updateStep(2, "success");

      showToast("Deployment submitted successfully", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(msg, "error");
      setSteps((prev) =>
        prev.map((s) =>
          s.status === "in-progress" ? { ...s, status: "error", message: msg } : s
        )
      );
    } finally {
      setDeploying(false);
    }
  };

  const handleClose = () => {
    if (!deploying) {
      resetSteps();
      onClose();
    }
  };

  const anyProgress = steps.some((s) => s.status !== "pending");

  const stepIcon = (s: DeployStep) => {
    if (s.status === "in-progress") return <span style={{ color: "#0f62fe", fontSize: 16 }}>⟳</span>;
    if (s.status === "success") return <span style={{ color: "#24a148", fontSize: 14 }}>✓</span>;
    if (s.status === "error") return <span style={{ color: "#da1e28", fontSize: 14 }}>✕</span>;
    return (
      <span
        style={{
          display: "inline-block",
          width: 14,
          height: 14,
          borderRadius: "50%",
          border: "2px solid #c6c6c6",
          flexShrink: 0,
        }}
      />
    );
  };

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
            ✕
          </button>
        </div>
        <div className="modal-body">
          {currentSettings && (
            <div
              style={{
                fontSize: 12,
                color: "#525252",
                marginBottom: 16,
                padding: "8px 12px",
                background: "#f4f4f4",
                borderLeft: "3px solid #0f62fe",
              }}
            >
              Source:{" "}
              <span style={{ fontWeight: 600, color: "#161616" }}>
                {currentSettings.applicationName}
              </span>
            </div>
          )}
          <p style={{ fontSize: 13, color: "#525252", marginBottom: 20, lineHeight: 1.6 }}>
            Deploys this application's settings and workflow to the online API. The execution
            application must be registered in the online API to handle the deploy workflow.
          </p>

          <div className="form-group">
            <label className="cds-label">Execution Application Name</label>
            <input
              className="cds-input"
              placeholder="online-deploy-handler"
              value={form.executionAppName}
              onChange={(e) => set("executionAppName", e.target.value)}
              disabled={deploying}
            />
            <p style={{ fontSize: 11, color: "#6f6f6f", marginTop: 4 }}>
              The application registered in the online API that will execute the deploy workflow.
            </p>
          </div>

          <div className="form-group">
            <label className="cds-label">
              Confirmation Number{" "}
              <span style={{ fontWeight: 400, color: "#6f6f6f" }}>
                (optional — auto-generated if blank)
              </span>
            </label>
            <input
              className="cds-input"
              placeholder="e.g. DEPLOY-2026-001"
              value={form.confirmationNumber}
              onChange={(e) => set("confirmationNumber", e.target.value)}
              disabled={deploying}
            />
          </div>

          {anyProgress && (
            <div
              style={{
                marginTop: 16,
                padding: 16,
                background: "#f4f4f4",
                border: "1px solid #e0e0e0",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.32px",
                  color: "#161616",
                  marginBottom: 12,
                }}
              >
                Deployment Progress
              </div>
              {steps.map((s) => (
                <div
                  key={s.id}
                  style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}
                >
                  {stepIcon(s)}
                  <span
                    style={{
                      fontSize: 13,
                      color:
                        s.status === "success"
                          ? "#198038"
                          : s.status === "error"
                          ? "#da1e28"
                          : s.status === "in-progress"
                          ? "#0f62fe"
                          : "#525252",
                    }}
                  >
                    Step {s.id}: {s.label}
                  </span>
                </div>
              ))}
              {steps.some((s) => s.status === "error") && (
                <div style={{ fontSize: 12, color: "#da1e28", marginTop: 12 }}>
                  {steps.find((s) => s.status === "error")?.message}
                </div>
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
            disabled={deploying || !form.executionAppName.trim()}
          >
            {deploying ? "Deploying…" : "Deploy"}
          </button>
        </div>
      </div>
    </div>
  );
};
