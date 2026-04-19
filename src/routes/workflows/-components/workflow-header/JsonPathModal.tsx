import React, { useState } from "react";
import { JSONPath } from "jsonpath-plus";

type JsonPathModalProps = {
  open: boolean;
  onClose: () => void;
};

const DEFAULT_DOC = `{
  "customer": {
    "id": "C001",
    "status": "ACTIVE"
  }
}`;

export const JsonPathModal: React.FC<JsonPathModalProps> = ({ open, onClose }) => {
  const [expression, setExpression] = useState("$.customer.id");
  const [jsonDoc, setJsonDoc] = useState(DEFAULT_DOC);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    setResult(null);
    setError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonDoc);
    } catch (e) {
      setError(`Invalid JSON: ${(e as Error).message}`);
      return;
    }
    try {
      const matched = JSONPath({ path: expression, json: parsed as object });
      if (!matched || (Array.isArray(matched) && matched.length === 0)) {
        setResult("(no match)");
      } else {
        setResult(JSON.stringify(matched, null, 2));
      }
    } catch (e) {
      setError(`JsonPath error: ${(e as Error).message}`);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box slide-up" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <span className="modal-title">JsonPath Playground</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="cds-label">JsonPath Expression</label>
            <input
              className="cds-input"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="$.customer.id"
              onKeyDown={(e) => e.key === "Enter" && validate()}
              style={{ fontFamily: '"IBM Plex Mono",monospace' }}
            />
          </div>
          <div className="form-group">
            <label className="cds-label">JSON Document</label>
            <textarea
              className="cds-input"
              value={jsonDoc}
              onChange={(e) => setJsonDoc(e.target.value)}
              rows={8}
              style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 12, resize: "vertical" }}
            />
          </div>
          <button className="btn btn-primary" onClick={validate}>
            Validate
          </button>
          {error && (
            <div style={{ marginTop: 10, fontSize: 13, color: "#da1e28" }}>{error}</div>
          )}
          {result !== null && !error && (
            <pre style={{ marginTop: 10, background: "#f4f4f4", padding: 12, fontSize: 12, maxHeight: 192, overflow: "auto", fontFamily: '"IBM Plex Mono",monospace' }}>
              {result}
            </pre>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};
