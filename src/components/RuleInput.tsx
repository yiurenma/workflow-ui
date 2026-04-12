import React, { useState } from 'react';
import { Input } from 'antd';
import { JSONPath } from 'jsonpath-plus';

interface RuleInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
}

function validateRuleKey(key: string): { valid: boolean; error?: string } {
  if (!key.trim()) {
    return { valid: false, error: 'Rule key cannot be empty' };
  }

  // Check for multiple paths (comma or semicolon separated)
  if (key.includes(',') || key.includes(';')) {
    return {
      valid: false,
      error: 'Rule key must be a single JSONPath expression (e.g., $.customer.id)',
    };
  }

  // Validate JSONPath syntax
  try {
    JSONPath({ path: key, json: {}, resultType: 'value' });
    return { valid: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      valid: false,
      error: `Invalid JSONPath syntax: ${msg}`,
    };
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
    // Clear error on change
    if (error) {
      setError(undefined);
    }
  };

  return (
    <div>
      <Input
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        status={error ? 'error' : undefined}
        placeholder={placeholder}
      />
      {error && (
        <div
          className="text-[12px] mt-1"
          style={{ color: '#da1e28' }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export { validateRuleKey };
