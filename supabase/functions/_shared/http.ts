import { z, ZodError } from "npm:zod@3.23.8";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, idempotency-key, x-forwarded-for, x-correlation-id",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
};

export class HttpError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "content-type": "application/json; charset=utf-8",
    },
  });
}

export function success<T>(data: T, status = 200): Response {
  return json({ data, error: null }, status);
}

export function fail(error: HttpError): Response {
  return json(
    {
      data: null,
      error: {
        code: error.code,
        message: error.message,
        details: error.details ?? null,
      },
    },
    error.status,
  );
}

export async function parseJson<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
  let payload: unknown;

  try {
    payload = await req.json();
  } catch {
    throw new HttpError(400, "invalid_json", "Request body must be valid JSON.");
  }

  try {
    return schema.parse(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new HttpError(422, "validation_error", "Request validation failed.", {
        issues: error.issues,
      });
    }

    throw error;
  }
}

export function handleUnhandled(error: unknown): Response {
  if (error instanceof HttpError) {
    return fail(error);
  }

  const message = error instanceof Error ? error.message : "Unexpected server error.";
  return fail(new HttpError(500, "internal_error", message));
}
