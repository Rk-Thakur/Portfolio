// Shared motion settings
export const ease = [0.2, 0.8, 0.2, 1] as const;
export const easeInOut = [0.7, 0, 0.2, 1] as const;

// The hero waits for the loader only on the very first page view.
export const intro = { played: false };
export const LOADER_MS = 900;

export const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};
