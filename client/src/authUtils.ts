export function isValidEmail(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test(value);
}

export function resolveProtectedRoute(route: string, isAuthenticated: boolean): string {
  return route === "dashboard" && !isAuthenticated ? "login" : route;
}
