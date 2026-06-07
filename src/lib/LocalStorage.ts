type Value = number | string | { [name: string]: Value };

export const LocalStorage = {
  get: (key: string): Value | null => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as Value) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: Value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
};
