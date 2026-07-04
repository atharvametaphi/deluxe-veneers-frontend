import { Navigate } from "react-router";

import { AppShell } from "../../../layouts/AppShell";
import { isAuthenticated } from "../authSession";

export function ProtectedAppShell() {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return <AppShell />;
}
