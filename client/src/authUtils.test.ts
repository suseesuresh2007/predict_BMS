import { describe, expect, it } from "vitest";
import { isValidE164Phone, isValidEmail, isValidOtp, normalizePhone, resolveProtectedRoute } from "./authUtils";

describe("client authentication helpers", () => {
  it("validates and normalizes credentials before they reach Supabase", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(normalizePhone("+91 (98765) 43210")).toBe("+919876543210");
    expect(isValidE164Phone("+919876543210")).toBe(true);
    expect(isValidE164Phone("9876543210")).toBe(false);
    expect(isValidOtp("123456")).toBe(true);
    expect(isValidOtp("12345a")).toBe(false);
  });

  it("sends logged-out dashboard visitors to login before protected content mounts", () => {
    expect(resolveProtectedRoute("dashboard", false)).toBe("login");
    expect(resolveProtectedRoute("dashboard", true)).toBe("dashboard");
    expect(resolveProtectedRoute("about", false)).toBe("about");
  });
});
