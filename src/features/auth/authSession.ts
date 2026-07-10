const AUTH_STORAGE_KEY = "deluxe-veneers-erp-authenticated";
const AUTH_USER_STORAGE_KEY = "deluxe-veneers-erp-user";
export const AUTH_USER_UPDATED_EVENT = "deluxe-veneers-auth-user-updated";

export interface AuthenticatedUserProfile {
  accountRole: "Admin" | "Super Admin" | "Staff";
  address: string;
  age: string;
  approver: string;
  bloodGroup: string;
  city: string;
  country: string;
  dateOfBirth: Date | null;
  department: string;
  email: string;
  firstName: string;
  gender: string;
  lastName: string;
  phoneNo: string;
  pincode: string;
  remarks: string;
  role: string;
  state: string;
  userName: string;
  userType: string;
}

type SerializedAuthenticatedUserProfile = Omit<
  AuthenticatedUserProfile,
  "dateOfBirth"
> & {
  dateOfBirth: string | null;
};

export const demoCredentials = {
  email: "admin@deluxeveneers.com",
  password: "admin",
} as const;

export const demoUserProfile: AuthenticatedUserProfile = {
  accountRole: "Super Admin",
  address: "Corporate Office, SG Highway",
  age: "31",
  approver: "Tanya Khanna",
  bloodGroup: "O+",
  city: "Ahmedabad",
  country: "India",
  dateOfBirth: new Date("1995-04-18"),
  department: "Management / Admin",
  email: demoCredentials.email,
  firstName: "Atharva",
  gender: "Male",
  lastName: "Patil",
  phoneNo: "+91 98765 43210",
  pincode: "380015",
  remarks: "System administrator profile for the Deluxe Veneers ERP.",
  role: "System Administrator",
  state: "Gujarat",
  userName: "Atharva Patil",
  userType: "Admin",
};

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
  persistCurrentUser(demoUserProfile);
  return true;
}

export function signOut() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
}

export function getCurrentUser() {
  if (typeof window === "undefined") {
    return demoUserProfile;
  }

  const storedValue = window.sessionStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!storedValue) {
    return demoUserProfile;
  }

  try {
    const parsedValue = JSON.parse(
      storedValue,
    ) as Partial<SerializedAuthenticatedUserProfile>;

    return {
      ...demoUserProfile,
      ...parsedValue,
      dateOfBirth:
        parsedValue.dateOfBirth != null ? new Date(parsedValue.dateOfBirth) : null,
    };
  } catch {
    return demoUserProfile;
  }
}

export function saveCurrentUser(profile: AuthenticatedUserProfile) {
  persistCurrentUser(profile);
}

export function getUserDisplayName(profile: AuthenticatedUserProfile) {
  return profile.userName.trim().length > 0
    ? profile.userName
    : `${profile.firstName} ${profile.lastName}`.trim() || "Deluxe Veneers User";
}

export function getUserInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return parts.map((part) => part.charAt(0).toUpperCase()).join("") || "DV";
}

function persistCurrentUser(profile: AuthenticatedUserProfile) {
  if (typeof window === "undefined") {
    return;
  }

  const serializedProfile: SerializedAuthenticatedUserProfile = {
    ...profile,
    dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.toISOString() : null,
  };

  window.sessionStorage.setItem(
    AUTH_USER_STORAGE_KEY,
    JSON.stringify(serializedProfile),
  );
  window.dispatchEvent(new CustomEvent(AUTH_USER_UPDATED_EVENT));
}
