export const storage = {
  get<T>(key: string, fallback: T): T {
    const value = localStorage.getItem(key);

    if (value === null) {
      return fallback;
    }

    try {
      return JSON.parse(value) ?? fallback;
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    const nextValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, nextValue);
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },
};
