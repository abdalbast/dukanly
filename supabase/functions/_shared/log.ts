export type LogLevel = "info" | "warn" | "error";

export interface LogContext {
  [key: string]: unknown;
}

function nowIso() {
  return new Date().toISOString();
}

export function getCorrelationId(req: Request): string {
  return req.headers.get("x-correlation-id")?.trim() || crypto.randomUUID();
}

export function log(level: LogLevel, message: string, context: LogContext = {}) {
  const event = {
    level,
    message,
    timestamp: nowIso(),
    ...context,
  };

  const line = JSON.stringify(event);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}
