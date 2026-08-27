import { describe, expect, it } from "vitest";
import { resolveSupabasePublicConfig } from "./supabaseConfig";

describe("resolveSupabasePublicConfig", () => {
  it("returns the environment-backed public Supabase settings when both are present", () => {
    expect(
      resolveSupabasePublicConfig({
        SUPABASE_URL: " https://example.supabase.co ",
        SUPABASE_ANON_KEY: " public-anon-key ",
      }),
    ).toEqual({
      url: "https://example.supabase.co",
      anonKey: "public-anon-key",
    });
  });

  it("refuses an incomplete configuration", () => {
    expect(resolveSupabasePublicConfig({ SUPABASE_URL: "https://example.supabase.co" })).toBeNull();
    expect(resolveSupabasePublicConfig({ SUPABASE_ANON_KEY: "public-anon-key" })).toBeNull();
  });
});
