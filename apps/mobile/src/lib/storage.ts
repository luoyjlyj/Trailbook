// Native persistence can be connected later without adding a dependency now.
export const storage = {
  persistent: false,
  read: (): string | null => null,
  write: (_value: string): void => {},
  clear: (): void => {},
};
