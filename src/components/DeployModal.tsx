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
  onlineApiUrl: string;
  applicationName: string;
  username: string;
  password: string;
}

type DeployStatus = "idle" | "in-progress" | "success" | "error";

const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
};

export const DeployModal: React.FC<DeployModalProps> = ({
  open,
  onClose,
  currentWorkflow,
  currentSettings,
}) => {
  const { showToast } = useToast();
  const [form, setForm] = useState<DeployFormData>({
    onlineApiUrl: "",
    applicationName: "",
    username: "",
    password: "",
  });
  const [deploying, setDeploying] = useState(false);
  const [status, setStatus] = useState<DeployStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const set = (k: keyof DeployFormData, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const isCrossOrigin = (url: string) => {
    try {
      return new URL(url).origin !== window.location.origin;
    } catch {
      return true;
    }
  };

  const buildUrl = (path: string) => {
    const base = form.onlineApiUrl.replace(/\/$/,  "");
    const fullUrl = `${base}${path}`;
    if (isCrossOrigin(form.onlineApiUrl)) {
      const proxyBase = "https://workflow-operation-api-n9sbp.ondigitalocean.app";
      return `${proxyBase}/workflow/deploy/proxy?targetUrl=${encodeURIComponent(fullUrl)}`;
    }
    return fullUrl;
  };

  const handleDeploy = async () => {
    if (!form.onlineApiUrl || !form.applicationName) {
      showToast("Please fill in Online API URL and Application Name", "error");
      return;
    }
    if (!currentWorkflow || !currentSettings) {
      showToast("No workflow or settings data available", "error");
      return;
    }
    if (form.onlineApiUrl.startsWith("http://")) {
      if (!window.confirm("You are using HTTP instead of HTTPS. Credentials will be sent unencrypted. Continue?")) return;
    }

    setDeploying(true);
    setStatus("in-progress");
    setErrorMessage("");

    try {
      const correlationId = generateUUID();
      const confirmationNumber = generateUUID();

      const params = new URLSearchParams({
        applicationName: form.applicationName,
        confirmationNumber,
      });

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Request-Correlation-Id": correlationId,
      };
      if (form.username && form.password) {
        headers["Authorization"] = `Basic ${btoa(`${form.username}:${form.password}`)}` ;
      }

      const body = JSON.stringify({
        sourceApplication: currentSettings,
        workflow: currentWorkflow,
      });

      const url = buildUrl(`/api/workflow?${params.toString()}`);
      const response = await fetch(url, { method: "POST", headers, body });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || response.statusText);
      }

      setStatus("success");
      showToast("Deploy request submitted to online API", "success");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setStatus("error");
      setErrorMessage(msg);
      showToast(msg, "error");
    } finally {
      setDeploying(false);
    }
  };

  const handleClose = () => {
    if (!deploying) {
      setStatus("idle");
      setErrorMessage("");
      onClose();
    }
  };

  const statusIcon = () => {
    if (status === "in-progress") return <span style={{ color: "#0f62fe", fontSize: 16 }}>⟳</span>;
    if (status === "success") return <span style={{ color: "#24a148", fontSize: 14 }}>✓</span>;
    if (status === "error") return <span style={{ color: "#da1e28", fontSize: 14 }}>✕</span>;
    return null;
  };

  const statusColor = () => {
    if (status === "success") return "#198038";
    if (status === "error") return "#da1e28";
    return "#0f62fe";
  };

  const statusLabel = () => {
    if (status === "in-progress") return "Submitting to online API…";
    if (status === "success") return "Deploy request accepted";
    if (status === "error") return "Deploy failed";
    return "";
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
            Submit this application and its workflow to the online API for deployment.
            The source application settings and workflow are sent as the request body;
            the online API's deploy workflow handles provisioning on the target environment.
          </p>

          <div className="form-group">
            <label className="cds-label">Online API URL</label>
            <input
              className="cds-input"
              placeholder="https://workflow-online-api-xxx.ondigitalocean.app"
              value={form.onlineApiUrl}
              onChange={(e) => set("onlineApiUrl", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="cds-label">Application Name</label>
            <p style={{ fontSize: 12, color: "#6f6f6f", margin: "4px 0 8px" }}>
              The execution name registered in the online API for the deploy workflow.
            </p>
            <input
              className="cds-input"
              placeholder="DEPLOY"
              value={form.applicationName}
              onChange={(e) => set("applicationName", e.target.value)}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="cds-label">Username (optional)</label>
              <input
                className="cds-input"
                placeholder="service-account"
                value={form.username}
                onChange={(e) => set("username", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="cds-label">Password (optional)</label>
              <input
                className="cds-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
              />
            </div>
          </div>

          {status !== "idle" && (
            <div style={{ marginTop: 16, padding: 16, background: "#f4f4f4", border: "1px solid #e0e0e0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.32px", color: "#161616", marginBottom: 8 }}>
                Deployment Status
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {statusIcon()}
                <span style={{ fontSize: 13, color: statusColor() }}>
                  {statusLabel()}
                </span>
              </div>
              {status === "error" && errorMessage && (
                <div style={{ fontSize: 12, color: "#da1e28", marginTop: 8 }}>
                  {errorMessage}
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
