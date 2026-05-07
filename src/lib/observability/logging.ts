export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  duration?: number;
}

const MAX_LOGS = 100;
const recentLogs: LogEntry[] = [];

function createLogEntry(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  };
}

export const logger = {
  info(message: string, context?: Record<string, unknown>) {
    const entry = createLogEntry("info", message, context);
    recentLogs.push(entry);
    if (recentLogs.length > MAX_LOGS) recentLogs.shift();
    console.log(`[INFO] ${message}`, context || "");
  },

  warn(message: string, context?: Record<string, unknown>) {
    const entry = createLogEntry("warn", message, context);
    recentLogs.push(entry);
    console.warn(`[WARN] ${message}`, context || "");
  },

  error(message: string, context?: Record<string, unknown>) {
    const entry = createLogEntry("error", message, context);
    recentLogs.push(entry);
    console.error(`[ERROR] ${message}`, context || "");
  },

  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "development") {
      const entry = createLogEntry("debug", message, context);
      recentLogs.push(entry);
      console.debug(`[DEBUG] ${message}`, context || "");
    }
  },

  timed<T>(message: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    return fn()
      .then((result) => {
        const duration = Date.now() - start;
        this.info(`${message} (${duration}ms)`, { duration });
        return result;
      })
      .catch((error) => {
        const duration = Date.now() - start;
        this.error(`${message} failed after ${duration}ms`, { duration, error: String(error) });
        throw error;
      });
  },

  getRecentLogs(): LogEntry[] {
    return [...recentLogs];
  },
};
