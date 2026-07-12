export const logger = {
  info: (message: string, ...meta: unknown[]) => {
    console.info(`[INFO] ${message}`, ...meta);
  },
  warn: (message: string, ...meta: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...meta);
  },
  error: (message: string, error?: unknown, ...meta: unknown[]) => {
    console.error(`[ERROR] ${message}`, error, ...meta);
  },
  debug: (message: string, ...meta: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[DEBUG] ${message}`, ...meta);
    }
  },
};
