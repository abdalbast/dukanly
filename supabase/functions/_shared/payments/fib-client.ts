import { HttpError } from "../http.ts";
import type { FibCreatePaymentResponse, FibStatusResponse } from "./types.ts";

interface AccessTokenCache {
  token: string;
  expiresAt: number;
}

const TOKEN_EXPIRY_SKEW_SECONDS = 30;
let tokenCache: AccessTokenCache | null = null;

interface FibEnv {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
}

function getFibEnv(): FibEnv {
  const mode = (Deno.env.get("FIB_ENV_MODE") || "stage").toLowerCase();
  const baseUrl = mode === "prod" ? Deno.env.get("FIB_BASE_URL_PROD") : Deno.env.get("FIB_BASE_URL_STAGE");
  const clientId = Deno.env.get("FIB_CLIENT_ID");
  const clientSecret = Deno.env.get("FIB_CLIENT_SECRET");

  if (!baseUrl || !clientId || !clientSecret) {
    throw new HttpError(500, "config_error", "FIB environment variables are not fully configured.");
  }

  if (!baseUrl.startsWith("https://")) {
    throw new HttpError(500, "config_error", "FIB base URL must use HTTPS.");
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    clientId,
    clientSecret,
  };
}

function getAuthorizationHeader(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "content-type": "application/json",
  };
}

function isTokenValid(): boolean {
  if (!tokenCache) return false;
  return Date.now() < tokenCache.expiresAt;
}

async function fetchAccessToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && isTokenValid() && tokenCache) {
    return tokenCache.token;
  }

  const env = getFibEnv();

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env.clientId,
    client_secret: env.clientSecret,
  });

  const response = await fetch(
    `${env.baseUrl}/auth/realms/fib-online-shop/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    },
  );

  if (!response.ok) {
    const payload = await response.text();
    throw new HttpError(502, "provider_auth_failed", `FIB token request failed: ${response.status}`, payload);
  }

  const data = await response.json() as {
    access_token?: string;
    expires_in?: number;
  };

  if (!data.access_token || !data.expires_in) {
    throw new HttpError(502, "provider_auth_failed", "FIB token response did not include access token.");
  }

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + Math.max(0, data.expires_in - TOKEN_EXPIRY_SKEW_SECONDS) * 1000,
  };

  return tokenCache.token;
}

async function withAuthedRequest<T>(request: (token: string) => Promise<T>): Promise<T> {
  try {
    const token = await fetchAccessToken(false);
    return await request(token);
  } catch (error) {
    if (!(error instanceof HttpError) || error.code !== "provider_unauthorized") {
      throw error;
    }

    tokenCache = null;
    const retryToken = await fetchAccessToken(true);
    return request(retryToken);
  }
}

export async function createFibPayment(payload: {
  amount: number;
  currency: "IQD";
  statusCallbackUrl?: string;
  description?: string;
}): Promise<FibCreatePaymentResponse> {
  return withAuthedRequest(async (token) => {
    const env = getFibEnv();

    const response = await fetch(`${env.baseUrl}/protected/v1/payments`, {
      method: "POST",
      headers: getAuthorizationHeader(token),
      body: JSON.stringify({
        monetaryValue: {
          amount: payload.amount.toFixed(2),
          currency: payload.currency,
        },
        statusCallbackUrl: payload.statusCallbackUrl,
        description: payload.description,
      }),
    });

    if (response.status === 401) {
      throw new HttpError(502, "provider_unauthorized", "FIB create payment unauthorized.");
    }

    if (!response.ok) {
      const message = await response.text();
      throw new HttpError(502, "provider_create_payment_failed", `FIB create payment failed: ${response.status}`, message);
    }

    const data = await response.json() as FibCreatePaymentResponse;

    if (!data.paymentId || !data.qrCode || !data.readableCode || !data.validUntil) {
      throw new HttpError(502, "provider_create_payment_failed", "FIB payment response missing required fields.");
    }

    return data;
  });
}

export async function getFibPaymentStatus(paymentId: string): Promise<FibStatusResponse> {
  return withAuthedRequest(async (token) => {
    const env = getFibEnv();

    const response = await fetch(`${env.baseUrl}/protected/v1/payments/${encodeURIComponent(paymentId)}/status`, {
      method: "GET",
      headers: getAuthorizationHeader(token),
    });

    if (response.status === 401) {
      throw new HttpError(502, "provider_unauthorized", "FIB status unauthorized.");
    }

    if (!response.ok) {
      const message = await response.text();
      throw new HttpError(502, "provider_status_failed", `FIB payment status failed: ${response.status}`, message);
    }

    const data = await response.json() as FibStatusResponse & { decliningReason?: string };

    if (!data.status) {
      throw new HttpError(502, "provider_status_failed", "FIB payment status response missing status field.");
    }

    return {
      ...data,
      declineReason: data.declineReason ?? data.decliningReason,
    };
  });
}
