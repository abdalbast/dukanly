import * as Sentry from "@sentry/browser";

interface LogContext {
  [key: string]: unknown;
}

interface BrowserLogEvent {
  level: "info" | "warn" | "error";
  message: string;
  context?: LogContext;
  correlationId: string;
  timestamp: string;
  userId?: string;
}

interface UserContext {
  id?: string;
  email?: string;
}

type ErrorReporter = (error: unknown, context?: LogContext) => void;

let correlationId = crypto.randomUUID();
let currentUser: UserContext = {};
let didInit = false;
let errorReporter: ErrorReporter = () => {};
const seenSuppressedPreviewReasons = new Set<string>();

function isLovablePreviewHost(hostname: string): boolean {
  return (
    hostname === "lovable.dev" ||
    hostname.endsWith(".lovable.dev") ||
    hostname.endsWith(".lovableproject.com") ||
    hostname.endsWith(".lovableproject-dev.com")
  );
}

function shouldSuppressLovablePreviewNoise(reason: string): boolean {
  const value = reason.toLowerCase();
  return (
    (value.includes("failed to fetch") && value.includes("posthog.com")) ||
    (value.includes("failed to fetch") && value.includes("otel-faro.p.l5e.io")) ||
    value.includes("err_blocked_by_client")
  );
}

export function getCorrelationId() {
  return correlationId;
}

export function resetCorrelationId() {
  correlationId = crypto.randomUUID();
  return correlationId;
}

export function setObservabilityUser(user: UserContext) {
  currentUser = { ...user };
  if (didInit) {
    Sentry.setUser(currentUser.id ? { id: currentUser.id, email: currentUser.email } : null);
  }
}

export function setErrorReporterForTests(reporter: ErrorReporter) {
  errorReporter = reporter;
}

function buildEvent(level: BrowserLogEvent["level"], message: string, context?: LogContext): BrowserLogEvent {
  return {
    level,
    message,
    context,
    correlationId,
    timestamp: new Date().toISOString(),
    userId: currentUser.id,
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

function buildErrorContext(extra?: LogContext) {
  return {
    correlationId,
    userId: currentUser.id,
    userEmail: currentUser.email,
    ...extra,
  };
}

function initRemoteErrorTracking() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    errorReporter = () => {};
    return;
  }

  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    environment: import.meta.env.MODE,
    initialScope: {
      tags: { app: "dukanly-web" },
    },
  });

  if (currentUser.id) {
    Sentry.setUser({ id: currentUser.id, email: currentUser.email });
  }

  errorReporter = (error: unknown, context?: LogContext) => {
    Sentry.withScope((scope) => {
      const merged = buildErrorContext(context);
      scope.setTag("correlation_id", correlationId);
      if (currentUser.id) scope.setUser({ id: currentUser.id, email: currentUser.email });
      scope.setContext("request", merged);
      Sentry.captureException(error instanceof Error ? error : new Error(getErrorMessage(error)));
    });
  };
}

export function initObservability() {
  if (didInit) return;
  didInit = true;

  initRemoteErrorTracking();

  logger.info("Observability initialized", {
    correlationId,
    userId: currentUser.id,
  });

  window.addEventListener("error", (event) => {
    const context = {
      source: "window.error",
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      userId: currentUser.id,
    };

    logger.error("Unhandled window error", context);
    errorReporter(event.error ?? event.message, context);
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = getErrorMessage(event.reason);

    if (
      isLovablePreviewHost(window.location.hostname) &&
      shouldSuppressLovablePreviewNoise(reason)
    ) {
      // Avoid noisy third-party telemetry failures in Lovable preview (often ad-blocker/network-policy).
      event.preventDefault();
      if (!seenSuppressedPreviewReasons.has(reason)) {
        seenSuppressedPreviewReasons.add(reason);
        logger.warn("Suppressed Lovable preview telemetry rejection", { reason });
      }
      return;
    }

    const context = {
      source: "window.unhandledrejection",
      reason,
      userId: currentUser.id,
    };

    logger.error("Unhandled promise rejection", context);
    errorReporter(event.reason, context);
  });
}
