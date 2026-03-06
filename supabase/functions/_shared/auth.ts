import { createClient, type User } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { HttpError } from "./http.ts";

export type AppRole = "buyer" | "seller" | "admin";

export interface AuthContext {
  userId: string;
  role: AppRole;
}

function resolveRole(user: User): AppRole {
  // SECURITY: Only read from app_metadata which is server-controlled.
  // user_metadata is user-editable and must NOT be trusted for role resolution.
  const appMeta = user.app_metadata as Record<string, unknown> | undefined;
  const roleFromClaim = appMeta?.role;

  if (roleFromClaim === "seller" || roleFromClaim === "admin") {
    return roleFromClaim;
  }

  return "buyer";
}

export async function requireAuth(req: Request): Promise<AuthContext> {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    throw new HttpError(401, "unauthorized", "Authorization token is required.");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new HttpError(500, "config_error", "Supabase environment is not configured.");
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });

  const { data, error } = await client.auth.getUser(token);

  if (error || !data.user) {
    throw new HttpError(401, "unauthorized", "Invalid or expired authorization token.");
  }

  return {
    userId: data.user.id,
    role: resolveRole(data.user),
  };
}

export function requireRole(context: AuthContext, allowed: AppRole[]): void {
  if (!allowed.includes(context.role)) {
    throw new HttpError(403, "forbidden", "You do not have access to this resource.");
  }
}
