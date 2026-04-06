import type { FormInstance } from "antd";
import type React from "react";

/**
 * If value is valid JSON, returns it pretty-printed (2-space indent).
 * Otherwise returns the original value unchanged.
 */
export function tryFormatJson(value: string | undefined): string | undefined {
  if (!value?.trim()) return value;
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

/**
 * Returns a blur handler factory for JSON-bearing textarea fields.
 * On blur: if the field value is valid JSON, pretty-print it (2-space indent).
 * If the value is not valid JSON, leave it unchanged — no corruption.
 */
export function useJsonFormat(
  form: FormInstance,
  onValuesChange?: (values: unknown) => void,
): (fieldName: string) => React.FocusEventHandler<HTMLTextAreaElement> {
  return (fieldName) => (e) => {
    const raw = e.target.value;
    if (!raw.trim()) return;
    try {
      const parsed = JSON.parse(raw);
      const formatted = JSON.stringify(parsed, null, 2);
      if (formatted !== raw) {
        form.setFieldValue(fieldName, formatted);
        onValuesChange?.(form.getFieldsValue());
      }
    } catch {
      // Not valid JSON — leave unchanged, no user feedback
    }
  };
}
