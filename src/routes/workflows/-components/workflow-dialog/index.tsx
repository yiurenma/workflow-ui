import React, { useCallback, useEffect, useId, useState } from "react";
import type { ApplicationFormValues } from "@/api/types";

type WorkflowDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ApplicationFormValues) => void;
  mode: "create" | "edit";
  initialApplicationName?: string | null;
};

export const WorkflowDialog: React.FC<WorkflowDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  initialApplicationName,
}) => {
  const isEdit = mode === "edit";
  const [appName, setAppName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    if (isEdit && initialApplicationName) {
      setAppName(initialApplicationName);
    } else {
      setAppName("");
    }
    setError(null);
  }, [isEdit, initialApplicationName]);

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen, resetForm]);

  const handleSubmit = () => {
    if (!appName.trim()) {
      setError("Please enter an application name");
      return;
    }
    if (!/^[A-Za-z0-9_.-]+$/.test(appName.trim())) {
      setError("Use letters, numbers, dot, underscore, hyphen");
      return;
    }
    setError(null);
    onSubmit({ applicationName: appName.trim() });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box slide-up" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <span className="modal-title">{isEdit ? "Application name" : "Create application"}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="cds-label">Application name</label>
            <input
              className="cds-input"
              value={appName}
              onChange={(e) => { setAppName(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="e.g. MY_APP"
              disabled={isEdit}
              autoFocus
              style={error ? { borderBottomColor: "#da1e28", borderBottomWidth: 2 } : undefined}
            />
            {error && <div style={{ fontSize: 12, color: "#da1e28", marginTop: 4 }}>{error}</div>}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {isEdit ? "OK" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};
