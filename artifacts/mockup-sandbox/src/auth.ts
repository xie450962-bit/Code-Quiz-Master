import { createAuthClient } from "@neondatabase/neon-js/auth";

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

export const authClient = authUrl
  ? createAuthClient(authUrl, { fetchOptions: { credentials: "include" } })
  : null;

export async function getAuthToken(): Promise<string> {
  if (!authClient) throw new Error("Neon Auth is not configured.");
  const { data, error } = await authClient.token();
  if (error || !data?.token) throw new Error("ログイン状態を確認できません。再度ログインしてください。");
  return data.token;
}

export async function authenticatedFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
