import { createInternalNeonAuth } from "@neondatabase/neon-js/auth";

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

const neonAuth = authUrl
  ? createInternalNeonAuth(authUrl, {
      fetchOptions: {
        credentials: "include",
        onRequest: (request) => {
          console.info("[auth] Request", {
            method: request.method,
            path: getRequestPath(request.url),
            at: new Date().toISOString(),
          });
        },
        onSuccess: (context) => {
          console.info("[auth] Response", {
            method: context.request.method,
            path: getRequestPath(context.request.url),
            status: context.response.status,
            hasAuthJwtHeader: context.response.headers.has("set-auth-jwt"),
            at: new Date().toISOString(),
          });
        },
      },
    })
  : null;
export const authClient = neonAuth?.adapter ?? null;

function getErrorDetails(error: unknown): { name?: string; message: string; status?: number; code?: string } {
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }
  if (error && typeof error === "object") {
    const candidate = error as { name?: unknown; message?: unknown; status?: unknown; code?: unknown };
    return {
      name: typeof candidate.name === "string" ? candidate.name : undefined,
      message: typeof candidate.message === "string" ? candidate.message : String(error),
      status: typeof candidate.status === "number" ? candidate.status : undefined,
      code: typeof candidate.code === "string" ? candidate.code : undefined,
    };
  }
  return { message: String(error) };
}

function getAuthEndpoint(): string {
  if (!authUrl) return "not configured";
  try {
    const endpoint = new URL(authUrl);
    return `${endpoint.origin}${endpoint.pathname}`;
  } catch {
    return "invalid URL";
  }
}

function getRequestPath(url: string | URL): string {
  try {
    return new URL(url.toString()).pathname;
  } catch {
    return "unknown";
  }
}

export async function getAuthToken(): Promise<string> {
  if (!authClient) {
    const error = new Error("Neon Auth is not configured.");
    console.error("[auth] Token request could not start", {
      endpoint: getAuthEndpoint(),
      at: new Date().toISOString(),
      error: getErrorDetails(error),
    });
    throw error;
  }

  try {
    const token = await neonAuth?.getJWTToken();
    if (token && token.split(".").length === 3) return token;

    let sessionDiagnostics: Record<string, unknown> = {};
    try {
      const { data: sessionData, error: sessionError } = await authClient.getSession();
      const session = sessionData?.session as { token?: unknown } | null | undefined;
      const sessionToken = typeof session?.token === "string" ? session.token : "";
      sessionDiagnostics = {
        hasUser: Boolean(sessionData?.user),
        hasSession: Boolean(sessionData?.session),
        hasSessionToken: Boolean(sessionToken),
        sessionTokenLooksLikeJwt: sessionToken.split(".").length === 3,
        sessionError: sessionError ? getErrorDetails(sessionError) : null,
      };
    } catch (sessionDiagnosticError) {
      sessionDiagnostics = { sessionError: getErrorDetails(sessionDiagnosticError) };
    }

    const details = { name: "AuthTokenUnavailable", message: "Neon Auth did not provide a JWT." };
    console.info("[auth] Session diagnostics", {
      ...sessionDiagnostics,
      returnedTokenLooksLikeJwt: typeof token === "string" && token.split(".").length === 3,
      at: new Date().toISOString(),
    });
    console.error("[auth] Neon Auth token request failed", {
      endpoint: getAuthEndpoint(),
      at: new Date().toISOString(),
      error: details,
    });
    throw new Error(`Neon AuthからAPI用JWTを取得できませんでした。(${details.message})`);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Neon AuthからAPI用JWT")) throw error;
    const details = getErrorDetails(error);
    console.error("[auth] Neon Auth token request threw an exception", {
      endpoint: getAuthEndpoint(),
      at: new Date().toISOString(),
      error: details,
    });
    throw new Error(`Neon AuthからAPI用JWTを取得できませんでした。(${details.message})`);
  }
}

export async function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  try {
    return await fetch(input, { ...init, headers });
  } catch (error) {
    const details = getErrorDetails(error);
    let endpoint: string;
    try {
      const url = new URL(input instanceof Request ? input.url : input.toString(), window.location.href);
      endpoint = `${url.origin}${url.pathname}`;
    } catch {
      endpoint = "invalid URL";
    }
    console.error("[api] Authenticated request failed", {
      endpoint,
      method: init.method ?? (input instanceof Request ? input.method : "GET"),
      at: new Date().toISOString(),
      error: details,
    });
    throw new Error(`APIリクエストに失敗しました。(${details.message})`);
  }
}
