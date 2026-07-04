const AUTH_STORAGE_KEY = "deluxe-veneers-erp-authenticated";

export const demoCredentials = {
  email: "admin@deluxeveneers.com",
  password: "admin",
} as const;

export function isAuthenticated() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(AUTH_STORAGE_KEY) === "true";
}

export function signIn(email: string, password: string) {
  const isValid =
    email.trim().toLowerCase() === demoCredentials.email &&
    password === demoCredentials.password;

  if (!isValid || typeof window === "undefined") {
    return false;
  }

  window.sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
  return true;
}

export function signOut() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
}
