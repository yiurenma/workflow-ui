export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function saveToLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silent fail
  }
}

export function loadBooleanFromLocalStorage(key: string): boolean {
  try {
    return localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

export function saveBooleanToLocalStorage(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Silent fail
  }
}
