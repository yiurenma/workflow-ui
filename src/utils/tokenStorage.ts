const AI_TOKEN_KEY = "ai_explain_token";
const COPILOT_TOKEN_KEY = "github_copilot_token";
const COPILOT_TOKEN_EXPIRES_KEY = "github_copilot_token_expires";

export function isValidToken(token: string | null): boolean {
  if (!token) return false;
  return (
    token.startsWith("sk-ant-") ||
    token.startsWith("ghp_") ||
    token.startsWith("github_pat_") ||
    token.startsWith("gho_") ||
    token.startsWith("ghu_") ||
    token.startsWith("ghs_")
  );
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(AI_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveToken(token: string): void {
  try {
    localStorage.setItem(AI_TOKEN_KEY, token);
  } catch {
    // Silent fail
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(AI_TOKEN_KEY);
  } catch {
    // Silent fail
  }
}

// GitHub Copilot token management
export interface CopilotTokenData {
  token: string;
  expiresAt: number;
}

export function saveCopilotToken(token: string, expiresInSeconds: number): void {
  try {
    const expiresAt = Date.now() + expiresInSeconds * 1000;
    localStorage.setItem(COPILOT_TOKEN_KEY, token);
    localStorage.setItem(COPILOT_TOKEN_EXPIRES_KEY, String(expiresAt));
  } catch {
    // Silent fail
  }
}

export function getCopilotToken(): CopilotTokenData | null {
  try {
    const token = localStorage.getItem(COPILOT_TOKEN_KEY);
    const expiresAtStr = localStorage.getItem(COPILOT_TOKEN_EXPIRES_KEY);
    if (!token || !expiresAtStr) return null;
    return { token, expiresAt: parseInt(expiresAtStr, 10) };
  } catch {
    return null;
  }
}

export function isCopilotTokenValid(): boolean {
  const data = getCopilotToken();
  if (!data) return false;
  return Date.now() < data.expiresAt;
}

export function clearCopilotToken(): void {
  try {
    localStorage.removeItem(COPILOT_TOKEN_KEY);
    localStorage.removeItem(COPILOT_TOKEN_EXPIRES_KEY);
  } catch {
    // Silent fail
  }
}
