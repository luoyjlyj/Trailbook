const key = 'trailbook-demo-library-v1';
export const storage = {
  persistent: true,
  read: (): string | null => window.localStorage.getItem(key),
  write: (value: string): void => window.localStorage.setItem(key, value),
  clear: (): void => window.localStorage.removeItem(key),
};
