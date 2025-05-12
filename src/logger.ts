// Simple global logger with timestamp and log levels
export const logger = {
  info: (message: string, ...args: any[]) => {
    console.info(`[INFO] [${new Date().toISOString()}]`, message, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] [${new Date().toISOString()}]`, message, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] [${new Date().toISOString()}]`, message, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[DEBUG] [${new Date().toISOString()}]`, message, ...args);
    }
  },
};
