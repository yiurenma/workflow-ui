import React, { useState } from "react";
import { Modal, Input, Button, Typography, Space } from "antd";
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

  return (
    <Modal
      title="JsonPath Playground"
      open={open}
      onCancel={onClose}
      footer={<Button onClick={onClose}>Close</Button>}
      width={600}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <div>
          <Typography.Text className="text-xs text-slate-500">JsonPath Expression</Typography.Text>
          <Input
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="$.customer.id"
            className="mt-1 font-mono"
            onPressEnter={validate}
          />
        </div>
        <div>
          <Typography.Text className="text-xs text-slate-500">JSON Document</Typography.Text>
          <Input.TextArea
            value={jsonDoc}
            onChange={(e) => setJsonDoc(e.target.value)}
            rows={8}
            className="mt-1 font-mono text-sm"
          />
        </div>
        <Button type="primary" onClick={validate}>
          Validate
        </Button>
        {error && (
          <Typography.Text type="danger" className="text-sm">
            {error}
          </Typography.Text>
        )}
        {result !== null && !error && (
          <pre className="rounded bg-slate-50 p-3 text-xs max-h-48 overflow-auto">{result}</pre>
        )}
      </Space>
    </Modal>
  );
};
