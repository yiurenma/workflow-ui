import React, { useState, useEffect } from "react";
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
  environment: string;
}

type DeployStatus = "idle" | "deploying" | "success" | "error";

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
    environment: "",
  });
  const [deploying, setDeploying] = useState(false);
  const [status, setStatus] = useState<DeployStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (open && currentSettings?.applicationName) {
      setForm((f) => ({ ...f, applicationName: currentSettings.applicationName }));
    }
  }, [open, currentSettings?.applicationName]);

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
    const base = form.onlineApiUrl.replace(/\/$/, "");
    const fullUrl = `${base}${path}`;
    if (isCrossOrigin(form.onlineApiUrl)) {
      const proxyBase = "https://workflow-operation-api-n9sbp.ondigitalocean.app";
      return `${proxyBase}/workflow/deploy/proxy?targetUrl=${encodeURIComponent(fullUrl)}`;
    }
    return fullUrl;
  };

  const handleDeploy = async () => {
    if (
      !form.onlineApiUrl ||
      !form.applicationName ||
      !form.username ||
      !form.password ||
      !form.environment
    ) {
      showToast("Please fill in all fields", "error");
      return;
    }
    if (!currentWorkflow || !currentSettings) {
      showToast("No workflow or settings data available", "error");
      return;
    }
    if (form.onlineApiUrl.startsWith("http://")) {
      if (
        !window.confirm(
          "You are using HTTP instead of HTTPS. Credentials will be sent unencrypted. Continue?"
        )
      )
        return;
    }

    setDeploying(true);
    setStatus("deploying");
    setErrorMessage("");

    try {
      const auth = btoa(`${form.username}:${form.password}`);
      const sp = new URLSearchParams({
        applicationName: form.applicationName,
        environment: form.environment,
      });
      const body = JSON.stringify({
        applicationSetting: currentSettings,
        workFlow: currentWorkflow,
      });

      const response = await fetch(buildUrl(`/workflow?${sp.toString()}`), {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || response.statusText);
      }

      setStatus("success");
      showToast("Deployment successful", "success");
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

  if (!open) return null;

  return (
    <div
      className="modal-overlay fade-in"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="modal-box slide-up" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <span className="modal-title">Deploy Application</span>
          <button
            className="modal-close"
            onClick={handleClose}
            disabled={deploying}
          >
            ✕
          </button>
        </div>
        <div className="modal-body">
          <p
            style={{
              fontSize: 13,
              color: "#525252",
              marginBottom: 20,
              lineHeight: 1.6,
            }}
          >
            Deploy this application to a remote environment via the Online API.
            Source application settings and workflow are sent as payload; the
            Online API executes the provisioning workflow on the target.
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
            <p
              style={{
                fontSize: 12,
                color: "#525252",
                marginBottom: 6,
                lineHeight: 1.4,
              }}
            >
              The execution name used at runtime. May differ from the source
              application name.
            </p>
            <input
              className="cds-input"
              placeholder="my-application"
              value={form.applicationName}
              onChange={(e) => set("applicationName", e.target.value)}
            />
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label className="cds-label">Username</label>
              <input
                className="cds-input"
                placeholder="service-account"
                value={form.username}
                onChange={(e) => set("username", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="cds-label">Password</label>
              <input
                className="cds-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="cds-label">Environment</label>
            <input
              className="cds-input"
              placeholder="UAT"
              value={form.environment}
              onChange={(e) => set("environment", e.target.value)}
            />
          </div>

          {status !== "idle" && (
            <div
              style={{
                marginTop: 16,
                padding: 16,
                background:
                  status === "success"
                    ? "#defbe6"
                    : status === "error"
                    ? "#fff1f1"
                    : "#edf5ff",
                border: `1px solid ${
                  status === "success"
                    ? "#24a148"
                    : status === "error"
                    ? "#da1e28"
                    : "#0f62fe"
                }`,
              }}
            >
              {status === "deploying" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#0f62fe",
                    fontSize: 13,
                  }}
                >
                  <span style={{ fontSize: 16 }}>⟳</span>
                  Calling Online API…
                </div>
              )}
              {status === "success" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#198038",
                    fontSize: 13,
                  }}
                >
                  <span>✓</span>
                  Deployment successful
                </div>
              )}
              {status === "error" && (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "#da1e28",
                      fontSize: 13,
                      marginBottom: errorMessage ? 8 : 0,
                    }}
                  >
                    <span>✕</span>
                    Deployment failed
                  </div>
                  {errorMessage && (
                    <div style={{ fontSize: 12, color: "#da1e28" }}>
                      {errorMessage}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-ghost"
            onClick={handleClose}
            disabled={deploying}
          >
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
