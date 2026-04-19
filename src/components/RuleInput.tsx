import React, { useState } from "react";
import { JSONPath } from "jsonpath-plus";

interface RuleInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
}

function validateRuleKey(key: string): { valid: boolean; error?: string } {
  if (!key.trim()) {
    return { valid: false, error: "Rule key cannot be empty" };
  }
  if (key.includes(",") || key.includes(";")) {
    return { valid: false, error: "Rule key must be a single JSONPath expression (e.g., $.customer.id)" };
  }
  try {
    JSONPath({ path: key, json: {}, resultType: "value" });
    return { valid: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { valid: false, error: `Invalid JSONPath syntax: ${msg}` };
  }
}

export const RuleInput: React.FC<RuleInputProps> = ({
  value,
  onChange,
  onBlur,
  placeholder,
}) => {
  const [error, setError] = useState<string>();

  const handleBlur = () => {
    const validation = validateRuleKey(value);
    setError(validation.error);
    onBlur?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (error) setError(undefined);
  };

  return (
    <div>
      <input
        className="cds-input"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={error ? { borderBottomColor: "#da1e28", borderBottomWidth: 2 } : undefined}
      />
      {error && (
        <div style={{ fontSize: 12, marginTop: 4, color: "#da1e28" }}>{error}</div>
      )}
    </div>
  );
};

export { validateRuleKey };
