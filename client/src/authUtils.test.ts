import { describe, expect, it } from "vitest";
import { isValidEmail, resolveProtectedRoute } from "./authUtils";

describe("client authentication helpers", () => {
  it("validates email credentials before they reach Supabase", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("name@company")).toBe(false);
  });

  it("sends logged-out dashboard visitors to login before protected content mounts", () => {
    expect(resolveProtectedRoute("dashboard", false)).toBe("login");
    expect(resolveProtectedRoute("dashboard", true)).toBe("dashboard");
    expect(resolveProtectedRoute("about", false)).toBe("about");
  });
});
