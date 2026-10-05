export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

/**
 * The Supabase anonymous key is intentionally public in browser clients. This
 * function keeps both values environment-backed and leaves data protection to
 * Supabase Row Level Security policies.
 */
export function resolveSupabasePublicConfig(
  env: NodeJS.ProcessEnv = process.env
): SupabasePublicConfig | null {
  const configuredUrl = env.SUPABASE_URL?.trim();
  const anonKey = env.SUPABASE_ANON_KEY?.trim();

  if (!configuredUrl || !anonKey) return null;

  const dashboardMatch = configuredUrl.match(
    /^https:\/\/supabase\.com\/dashboard\/project\/([a-z0-9]+)$/i
  );
  const url = dashboardMatch
    ? `https://${dashboardMatch[1]}.supabase.co`
    : configuredUrl.replace(/\/+$/, "");

  return { url, anonKey };
}
