import React from "react";

/**
 * Carbon Design System styled confirmation dialog — pure CSS, no Ant Design
 */

interface CarbonModalProps {
  open?: boolean;
  title?: React.ReactNode;
  children?: React.ReactNode;
  onClose?: () => void;
  footer?: React.ReactNode;
  maxWidth?: number;
  className?: string;
}

export function CarbonModal({
  open,
  title,
  children,
  onClose,
  footer,
  maxWidth = 520,
}: CarbonModalProps) {
  if (!open) return null;
  return (
    <div className="modal-overlay fade-in" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal-box slide-up" style={{ maxWidth }}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

interface ConfirmConfig {
  title?: React.ReactNode;
  content?: React.ReactNode;
  okText?: string;
  okType?: "primary" | "danger" | "default";
  cancelText?: string;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
  className?: string;
  okButtonProps?: Record<string, unknown>;
  cancelButtonProps?: Record<string, unknown>;
}

/**
 * Carbon-styled confirmation dialog using native browser confirm.
 * For a proper modal, mount a React component instead.
 */
export function carbonConfirm(config: ConfirmConfig) {
  // We use a dynamic portal-based approach
  const container = document.createElement("div");
  document.body.appendChild(container);

  const cleanup = () => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  // Render using ReactDOM dynamically
  import("react-dom/client").then(({ createRoot }) => {
    const root = createRoot(container);

    const ConfirmDialog = () => {
      const [open, setOpen] = React.useState(true);
      const [loading, setLoading] = React.useState(false);

      const handleOk = async () => {
        setLoading(true);
        try {
          await config.onOk?.();
        } finally {
          setLoading(false);
          setOpen(false);
          setTimeout(cleanup, 300);
        }
      };

      const handleCancel = () => {
        config.onCancel?.();
        setOpen(false);
        setTimeout(cleanup, 300);
      };

      if (!open) return null;

      const isDanger = config.okType === "danger";

      return (
        <div className="modal-overlay fade-in" onClick={(e) => e.target === e.currentTarget && handleCancel()}>
          <div className="modal-box slide-up" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <span className="modal-title">{config.title ?? "Confirm"}</span>
              <button className="modal-close" onClick={handleCancel}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ fontSize: 14, color: "#161616", lineHeight: 1.6 }}>{config.content}</div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={handleCancel}>{config.cancelText ?? "Cancel"}</button>
              <button
                className={`btn ${isDanger ? "btn-danger" : "btn-primary"}`}
                onClick={handleOk}
                disabled={loading}
              >
                {loading ? "Processing…" : (config.okText ?? "OK")}
              </button>
            </div>
          </div>
        </div>
      );
    };

    root.render(<ConfirmDialog />);
  });
}

/**
 * Carbon-styled info dialog
 */
export function carbonInfo(config: ConfirmConfig) {
  return carbonConfirm({ ...config, okType: "primary" });
}

/**
 * Carbon-styled warning dialog
 */
export function carbonWarning(config: ConfirmConfig) {
  return carbonConfirm({ ...config, okType: "primary" });
}

/**
 * Carbon-styled error dialog
 */
export function carbonError(config: ConfirmConfig) {
  return carbonConfirm({ ...config, okType: "danger" });
}
