import React, { useEffect, useState } from "react";
import { usePatchEntitySetting } from "@/api/hooks/workflow";
import type { WorkflowEntitySettingRow } from "@/api/types";
import { useToast } from "@/contexts/ToastContext";

type SettingsModalProps = {
  open: boolean;
  record: WorkflowEntitySettingRow | null;
  onClose: () => void;
};

interface FormState {
  newApplicationName: string;
  description: string;
  enabled: boolean;
  asyncMode: boolean;
  retry: boolean;
  tracking: boolean;
  ignoreDuplicateRecordError: boolean;
  eimId: string;
  defaultServiceAccount: string;
  region: string;
  retryProperties: string;
}

const TOGGLES: { key: keyof FormState; label: string; desc: string }[] = [
  { key: "enabled", label: "Enabled", desc: "Activate this workflow" },
  { key: "asyncMode", label: "Async Mode", desc: "Process messages asynchronously" },
  { key: "retry", label: "Retry", desc: "Auto-retry on transient failures" },
  { key: "tracking", label: "Tracking", desc: "Record execution history" },
  { key: "ignoreDuplicateRecordError", label: "Ignore Duplicate Error", desc: "Skip duplicate record errors" },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ open, record, onClose }) => {
  const { showToast } = useToast();
  const patchSetting = usePatchEntitySetting();

  const [form, setForm] = useState<FormState>({
    newApplicationName: "",
    description: "",
    enabled: true,
    asyncMode: true,
    retry: false,
    tracking: false,
    ignoreDuplicateRecordError: false,
    eimId: "",
    defaultServiceAccount: "",
    region: "",
    retryProperties: "",
  });

  useEffect(() => {
    if (open && record) {
      setForm({
        newApplicationName: record.applicationName ?? "",
        description: record.description ?? "",
        enabled: record.enabled ?? true,
        asyncMode: record.asyncMode ?? true,
        retry: record.retry ?? false,
        tracking: record.tracking ?? false,
        ignoreDuplicateRecordError: record.ignoreDuplicateRecordError ?? false,
        eimId: record.eimId ?? "",
        defaultServiceAccount: record.defaultServiceAccount ?? "",
        region: record.region ?? "",
        retryProperties: record.retryProperties ?? "",
      });
    }
  }, [open, record]);

  const set = (k: keyof FormState, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleOk = async () => {
    try {
      const { newApplicationName, description, ...rest } = form;
      const patch = { ...rest, description } as Parameters<typeof patchSetting.mutateAsync>[0]["patch"];
      if (newApplicationName && newApplicationName.trim() !== record!.applicationName) {
        patch.newApplicationName = newApplicationName.trim();
      }
      await patchSetting.mutateAsync({
        applicationName: record!.applicationName,
        patch,
      });
      showToast("Settings updated", "success");
      onClose();
    } catch {
      showToast("Failed to update settings", "error");
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box slide-up" style={{ maxWidth: 540 }}>
        <div className="modal-header">
          <span className="modal-title">Edit Settings — {record?.applicationName ?? ""}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="cds-label">Application Name (rename)</label>
            <input className="cds-input" value={form.newApplicationName} onChange={(e) => set("newApplicationName", e.target.value)} placeholder="New application name" />
          </div>
          <div className="form-group">
            <label className="cds-label">Description</label>
            <textarea className="cds-input" rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Human-readable description" style={{ resize: "none" }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.32px", color: "#525252", marginBottom: 8 }}>Configuration flags</div>
            {TOGGLES.map((t) => (
              <div className="toggle-row" key={t.key}>
                <div>
                  <div className="toggle-label">{t.label}</div>
                  <div className="toggle-desc">{t.desc}</div>
                </div>
                <label className="cds-switch">
                  <input type="checkbox" checked={!!form[t.key]} onChange={(e) => set(t.key, e.target.checked)} />
                  <span className="cds-switch-slider" />
                </label>
              </div>
            ))}
          </div>

          <div className="form-row-2" style={{ marginBottom: 16 }}>
            {([["eimId", "EIM ID", "Enterprise identity ID"], ["defaultServiceAccount", "Service Account", "Service account name"], ["region", "Region", "e.g. prod, dev"]] as [keyof FormState, string, string][]).map(([k, label, placeholder]) => (
              <div className="form-group" key={String(k)} style={{ marginBottom: 0 }}>
                <label className="cds-label">{label}</label>
                <input className="cds-input" value={form[k] as string} onChange={(e) => set(k, e.target.value)} placeholder={placeholder} />
              </div>
            ))}
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="cds-label">Retry Properties (JSON)</label>
            <textarea
              className="cds-input"
              rows={3}
              style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 12, resize: "none" }}
              value={form.retryProperties}
              onChange={(e) => set("retryProperties", e.target.value)}
              placeholder='{"maxAttempts": 3, "retryErrorCodes": ["500"]}'
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={patchSetting.isPending}>Cancel</button>
          <button className="btn btn-primary" onClick={handleOk} disabled={patchSetting.isPending}>
            {patchSetting.isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
