const AI_TOKEN_KEY = "ai_explain_token";

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
