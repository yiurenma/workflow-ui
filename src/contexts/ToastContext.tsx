import React, { createContext, useContext, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastMessage {
  id: number;
  msg: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (msg: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

let nextId = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((msg: string, type: ToastType = "info") => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: "fixed", top: 64, right: 16, zIndex: 9000, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast-${t.type}`}
            style={{
              background: "#161616",
              color: "#f4f4f4",
              padding: "12px 20px 12px 16px",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 10,
              maxWidth: 320,
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              position: "relative",
            }}
          >
            <span
              style={{
                width: 4,
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                background:
                  t.type === "success" ? "#24a148" :
                  t.type === "error" ? "#da1e28" :
                  t.type === "warning" ? "#f1c21b" :
                  "#0f62fe",
              }}
            />
            <span style={{ paddingLeft: 4 }}>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
