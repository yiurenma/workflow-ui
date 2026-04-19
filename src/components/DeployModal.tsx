import React, { useState } from "react";
import type { WorkFlow, WorkflowEntitySettingRow } from "@/api/types";
import { useToast } from "@/contexts/ToastContext";

interface DeployModalProps {
  open: boolean;
  onClose: () => void;
  currentWorkflow: WorkFlow | null;
  currentSettings: WorkflowEntitySettingRow | null;
}

interface DeployFormData {
  baseUrl: string;
  applicationName: string;
  username: string;
  password: string;
  environment: string;
}

interface DeployProgress {
  step: 1 | 2 | 3;
  status: "pending" | "in-progress" | "success" | "error";
  message?: string;
}

const STEP_LABELS = ["Create Application", "Update Settings", "Save Workflow"];

export const DeployModal: React.FC<DeployModalProps> = ({
  open,
  onClose,
  currentWorkflow,
  currentSettings,
}) => {
  const { showToast } = useToast();
  const [form, setForm] = useState<DeployFormData>({
    baseUrl: "",
    applicationName: currentSettings?.applicationName ?? "",
    username: "",
    password: "",
    environment: "",
  });
  const [deploying, setDeploying] = useState(false);
  const [progress, setProgress] = useState<DeployProgress[]>([
    { step: 1, status: "pending" },
    { step: 2, status: "pending" },
    { step: 3, status: "pending" },
  ]);

  const resetProgress = () => setProgress([
    { step: 1, status: "pending" },
    { step: 2, status: "pending" },
    { step: 3, status: "pending" },
  ]);

  const updateProgress = (step: 1 | 2 | 3, status: DeployProgress["status"], message?: string) => {
    setProgress((prev) => prev.map((p) => (p.step === step ? { ...p, status, message } : p)));
  };

  const set = (k: keyof DeployFormData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const isCrossOrigin = (url: string) => {
    try {
      const targetOrigin = new URL(url).origin;
      return targetOrigin !== window.location.origin;
    } catch { return true; }
  };

  const buildUrl = (path: string) => {
    const fullUrl = `${form.baseUrl}${path}`;
    if (isCrossOrigin(form.baseUrl)) {
      const proxyBase = "https://workflow-operation-api-n9sbp.ondigitalocean.app";
      return `${proxyBase}/workflow/deploy/proxy?targetUrl=${encodeURIComponent(fullUrl)}`;
    }
    return fullUrl;
  };

  const deployToRemote = async () => {
    if (!currentWorkflow || !currentSettings) {
      showToast("No workflow or settings data available", "error");
      return;
    }

    const auth = btoa(`${form.username}:${form.password}`);
    const headers = { Authorization: `Basic ${auth}`, "Content-Type": "application/json" };

    updateProgress(1, "in-progress");
    const createResponse = await fetch(
      buildUrl(`/workflow/entity-setting?applicationName=${encodeURIComponent(form.applicationName)}`),
      { method: "POST", headers, body: JSON.stringify({ enabled: true, asyncMode: false, retry: false, tracking: false, ignoreDuplicateRecordError: false }) }
    );
    if (!createResponse.ok) {
      const t = await createResponse.text();
      throw new Error(`Step 1 failed: ${t || createResponse.statusText}`);
    }
    updateProgress(1, "success");

    updateProgress(2, "in-progress");
    const updateResponse = await fetch(
      buildUrl(`/workflow/entity-setting?applicationName=${encodeURIComponent(form.applicationName)}`),
      {
        method: "PATCH", headers,
        body: JSON.stringify({
          enabled: currentSettings.enabled, asyncMode: currentSettings.asyncMode,
          retry: currentSettings.retry, tracking: currentSettings.tracking,
          ignoreDuplicateRecordError: currentSettings.ignoreDuplicateRecordError,
          eimId: currentSettings.eimId, defaultServiceAccount: currentSettings.defaultServiceAccount,
          region: currentSettings.region, retryProperties: currentSettings.retryProperties,
          description: currentSettings.description || "Deployed from Hub",
        }),
      }
    );
    if (!updateResponse.ok) {
      const t = await updateResponse.text();
      throw new Error(`Step 2 failed: ${t || updateResponse.statusText}`);
    }
    updateProgress(2, "success");

    updateProgress(3, "in-progress");
    const saveResponse = await fetch(
      buildUrl(`/workflow?applicationName=${encodeURIComponent(form.applicationName)}`),
      { method: "POST", headers, body: JSON.stringify(currentWorkflow) }
    );
    if (!saveResponse.ok) {
      const t = await saveResponse.text();
      throw new Error(`Step 3 failed: ${t || saveResponse.statusText}`);
    }
    updateProgress(3, "success");
  };

  const handleDeploy = async () => {
    if (!form.baseUrl || !form.applicationName || !form.username || !form.password || !form.environment) {
      showToast("Please fill in all fields", "error");
      return;
    }

    if (form.baseUrl.startsWith("http://")) {
      if (!window.confirm("You are using HTTP instead of HTTPS. Credentials will be sent unencrypted. Continue?")) return;
    }

    setDeploying(true);
    resetProgress();
    try {
      await deployToRemote();
      showToast("Deployment successful", "success");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      showToast(msg, "error");
      const failedStep = progress.findIndex((p) => p.status === "in-progress");
      if (failedStep !== -1) updateProgress((failedStep + 1) as 1 | 2 | 3, "error", msg);
    } finally {
      setDeploying(false);
    }
  };

  const handleClose = () => {
    if (!deploying) {
      resetProgress();
      onClose();
    }
  };

  const stepIcon = (p: DeployProgress) => {
    if (p.status === "in-progress") return <span style={{ color: "#0f62fe", fontSize: 16 }}>⟳</span>;
    if (p.status === "success") return <span style={{ color: "#24a148", fontSize: 14 }}>✓</span>;
    if (p.status === "error") return <span style={{ color: "#da1e28", fontSize: 14 }}>✕</span>;
    return <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: "50%", border: "2px solid #c6c6c6", flexShrink: 0 }} />;
  };

  const anyProgress = progress.some((p) => p.status !== "pending");

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
            Deploy this application and its workflow to a remote environment. Three sequential API calls: create the application, update settings, and save the workflow.
          </p>

          <div className="form-group">
            <label className="cds-label">Deploy URL</label>
            <input className="cds-input" placeholder="https://workflow-operation-api-xxx.ondigitalocean.app" value={form.baseUrl} onChange={(e) => set("baseUrl", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="cds-label">Application Name</label>
            <input className="cds-input" placeholder="my-application" value={form.applicationName} onChange={(e) => set("applicationName", e.target.value)} />
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label className="cds-label">Username</label>
              <input className="cds-input" placeholder="service-account" value={form.username} onChange={(e) => set("username", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="cds-label">Password</label>
              <input className="cds-input" type="password" placeholder="••••••••" value={form.password} onChange={(e) => set("password", e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="cds-label">Environment</label>
            <input className="cds-input" placeholder="UAT" value={form.environment} onChange={(e) => set("environment", e.target.value)} />
          </div>

          {anyProgress && (
            <div style={{ marginTop: 16, padding: 16, background: "#f4f4f4", border: "1px solid #e0e0e0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.32px", color: "#161616", marginBottom: 12 }}>Deployment Progress</div>
              {progress.map((p, index) => (
                <div key={p.step} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  {stepIcon(p)}
                  <span style={{
                    fontSize: 13,
                    color: p.status === "success" ? "#198038" : p.status === "error" ? "#da1e28" : p.status === "in-progress" ? "#0f62fe" : "#525252",
                  }}>
                    Step {p.step}: {STEP_LABELS[index]}
                  </span>
                </div>
              ))}
              {progress.some((p) => p.status === "error") && (
                <div style={{ fontSize: 12, color: "#da1e28", marginTop: 12 }}>
                  {progress.find((p) => p.status === "error")?.message}
                </div>
              )}
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
