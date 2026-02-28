interface LogContext {
  [key: string]: unknown;
}

interface BrowserLogEvent {
  level: "info" | "warn" | "error";
  message: string;
  context?: LogContext;
  correlationId: string;
  timestamp: string;
}

let correlationId = crypto.randomUUID();

export function getCorrelationId() {
  return correlationId;
}

export function resetCorrelationId() {
  correlationId = crypto.randomUUID();
  return correlationId;
}

function buildEvent(level: BrowserLogEvent["level"], message: string, context?: LogContext): BrowserLogEvent {
  return {
    level,
    message,
    context,
    correlationId,
    timestamp: new Date().toISOString(),
  };
}

function emit(event: BrowserLogEvent) {
  const prefix = `[${event.level.toUpperCase()}] ${event.message}`;

  if (event.level === "error") {
    console.error(prefix, event);
    return;
  }

  if (event.level === "warn") {
    console.warn(prefix, event);
    return;
  }

  console.log(prefix, event);
}

export const logger = {
  info(message: string, context?: LogContext) {
    emit(buildEvent("info", message, context));
  },
  warn(message: string, context?: LogContext) {
    emit(buildEvent("warn", message, context));
  },
  error(message: string, context?: LogContext) {
    emit(buildEvent("error", message, context));
  },
};

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  return String(err);
}

function reportToSentry(err: unknown, context?: LogContext) {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  // Placeholder integration point. Keep payload shape simple until SDK is adopted.
  void fetch(dsn, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      message: getErrorMessage(err),
      correlationId,
      context,
      timestamp: new Date().toISOString(),
    }),
  }).catch(() => {
    // Avoid recursive logging loops on transport failure.
  });
}

export function initObservability() {
  logger.info("Observability initialized", { correlationId });

  window.addEventListener("error", (event) => {
    logger.error("Unhandled window error", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
    reportToSentry(event.error ?? event.message, { source: "window.error" });
  });

  window.addEventListener("unhandledrejection", (event) => {
    logger.error("Unhandled promise rejection", {
      reason: getErrorMessage(event.reason),
    });
    reportToSentry(event.reason, { source: "window.unhandledrejection" });
  });
}
