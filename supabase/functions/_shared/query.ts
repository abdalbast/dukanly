import { z, ZodError } from "npm:zod@3.23.8";
import { HttpError } from "./http.ts";

export async function parseQuery<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
  const url = new URL(req.url);
  const raw: Record<string, string> = {};

  for (const [key, value] of url.searchParams.entries()) {
    raw[key] = value;
  }

  try {
    return schema.parse(raw);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new HttpError(422, "validation_error", "Query validation failed.", {
        issues: error.issues,
      });
    }

    throw error;
  }
}
