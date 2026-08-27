export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

/**
 * The Supabase anonymous key is intentionally public in browser clients. This
 * function keeps both values environment-backed and leaves data protection to
 * Supabase Row Level Security policies.
 */
export function resolveSupabasePublicConfig(env: NodeJS.ProcessEnv = process.env): SupabasePublicConfig | null {
  const url = env.SUPABASE_URL?.trim();
  const anonKey = env.SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) return null;

  return { url, anonKey };
}
