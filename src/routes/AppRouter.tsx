import { Navigate, createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import { AppShell } from "../layouts/AppShell";
import { ComponentLibraryPage } from "../pages/ComponentLibraryPage";

const router = createBrowserRouter([
  {
    path: "/",
    Component: AppShell,
    children: [
      {
        index: true,
        Component: RootRedirect,
      },
      {
        path: "component-library",
        Component: ComponentLibraryPage,
      },
    ],
  },
]);

function RootRedirect() {
  return <Navigate to="/component-library" replace />;
}

export function AppRouter() {
  return <RouterProvider router={router} />;
}