export function getStorageItem<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') {
    return fallback;
  }

  const rawValue = localStorage.getItem(key);

  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return rawValue as T;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
}

export function removeStorageItem(key: string): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.removeItem(key);
}
