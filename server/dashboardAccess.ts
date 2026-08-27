import type { SupabasePublicConfig } from "./supabaseConfig";

type FetchLike = (input: string, init?: RequestInit) => Promise<Pick<Response, "ok">>;

export function extractBearerToken(header: string | undefined): string | null {
  const match = header?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function hasValidSupabaseSession(
  token: string | null,
  config: SupabasePublicConfig | null,
  fetchImpl: FetchLike = fetch,
): Promise<boolean> {
  if (!token || !config) return false;

  try {
    const response = await fetchImpl(`${config.url.replace(/\/+$/, "")}/auth/v1/user`, {
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
