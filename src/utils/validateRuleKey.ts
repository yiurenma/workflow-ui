import { JSONPath } from 'jsonpath-plus';

/**
 * Validates a rule key as a single valid JSONPath expression
 * @param value - The rule key value to validate
 * @returns Validation result with error message if invalid
 */
export function validateRuleKey(value: string): { valid: boolean; error?: string } {
  if (!value || !value.trim()) {
    return { valid: true }; // Empty is allowed
  }

  // Check for comma-separated paths (not allowed)
  if (value.includes(',')) {
    return {
      valid: false,
      error: 'Rule key must be a single JSONPath expression (no comma-separated paths)',
    };
  }

  // Validate JSONPath syntax
  try {
    JSONPath({ path: value, json: {} }); // Dry-run parse
    return { valid: true };
  } catch (err) {
    return {
      valid: false,
      error: `Invalid JSONPath syntax: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}
