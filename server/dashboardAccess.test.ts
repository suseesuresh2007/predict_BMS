import { describe, expect, it, vi } from "vitest";
import { extractBearerToken, hasValidSupabaseSession } from "./dashboardAccess";

describe("protected dashboard access", () => {
  it("extracts a bearer access token and refuses malformed headers", () => {
    expect(extractBearerToken("Bearer abc.def.ghi")).toBe("abc.def.ghi");
    expect(extractBearerToken("basic credentials")).toBeNull();
    expect(extractBearerToken(undefined)).toBeNull();
  });

  it("only accepts a token Supabase recognizes", async () => {
    const acceptedRequest = vi.fn().mockResolvedValue({ ok: true });
    const rejectedRequest = vi.fn().mockResolvedValue({ ok: false });
    const config = { url: "https://example.supabase.co", anonKey: "public-key" };

    await expect(hasValidSupabaseSession("valid-token", config, acceptedRequest)).resolves.toBe(true);
    await expect(hasValidSupabaseSession("invalid-token", config, rejectedRequest)).resolves.toBe(false);
    await expect(hasValidSupabaseSession(null, config, acceptedRequest)).resolves.toBe(false);
  });
});
