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
 * Returns a blur handler that formats a textarea's JSON value in place.
 * `setValue` is a state setter (or any function) that updates the field value.
 */
export function useJsonFormat(
  getValue: () => string,
  setValue: (formatted: string) => void,
): React.FocusEventHandler<HTMLTextAreaElement> {
  return () => {
    const raw = getValue();
    if (!raw?.trim()) return;
    try {
      const parsed = JSON.parse(raw);
      const formatted = JSON.stringify(parsed, null, 2);
      if (formatted !== raw) {
        setValue(formatted);
      }
    } catch {
      // Not valid JSON — leave unchanged, no user feedback
    }
  };
}
