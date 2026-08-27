export function isValidEmail(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test(value);
}

export function isValidE164Phone(value: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(value);
}

export function isValidOtp(value: string): boolean {
  return /^\d{6}$/.test(value);
}

export function normalizePhone(value: string): string {
  return value.replace(/[\s()-]/g, "");
}

export function resolveProtectedRoute(route: string, isAuthenticated: boolean): string {
  return route === "dashboard" && !isAuthenticated ? "login" : route;
}
