import { Navigate, createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

import { LoginPage, ProtectedAppShell } from "../features/auth";
import { DashboardPage } from "../features/dashboard";
import { DispatchPage } from "../features/dispatch";
import {
  DispatchCreatePage,
  DispatchEditPage,
  DispatchViewPage,
} from "../features/dispatch/pages";
import { factoryRoutes } from "../features/factory";
import { inventoryRoutes } from "../features/inventory";
import { masterRoutes } from "../features/masters";
import { ordersRoutes } from "../features/orders";
import { packingRoutes } from "../features/packing";
import { QcModulePage } from "../features/qc";
import { rolesPermissionsRoutes } from "../features/roles-permissions";
import { userManagementRoutes } from "../features/user-management";
import { WarehousesPage } from "../features/warehouses";
import { FeaturePlaceholderPage } from "../features/shared/FeaturePlaceholderPage";
import { ComponentLibraryPage } from "../pages/ComponentLibraryPage";

const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: ProtectedAppShell,
    children: [
      {
        path: "dashboard",
        Component: DashboardPage,
      },
      ...userManagementRoutes,
      ...rolesPermissionsRoutes,
      {
        path: "masters",
        element: (
          <FeaturePlaceholderPage
            breadcrumbs={[{ label: "Masters" }]}
            title="Masters"
          />
        ),
      },
      ...masterRoutes,
      {
        path: "warehouse-a",
        element: <WarehousesPage warehouseId="warehouse-a" />,
      },
      {
        path: "warehouse-b",
        element: <WarehousesPage warehouseId="warehouse-b" />,
      },
      {
        path: "warehouse-c",
        element: <WarehousesPage warehouseId="warehouse-c" />,
      },
      {
        path: "qc",
        element: <Navigate replace to="/qc/pending?inventory=veneer-blocks" />,
      },
      {
        path: "qc/pending",
        element: <QcModulePage stage="pending" />,
      },
      {
        path: "qc/done",
        element: <QcModulePage stage="done" />,
      },
      ...ordersRoutes,
      {
        path: "inventory",
        element: (
          <Navigate
            replace
            to="/warehouse-b?inventory=veneer-blocks"
          />
        ),
      },
      ...inventoryRoutes,
      {
        path: "factory",
        element: (
          <FeaturePlaceholderPage
            breadcrumbs={[{ label: "Factory" }]}
            title="Factory"
          />
        ),
      },
      ...factoryRoutes,
      ...packingRoutes,
      {
        path: "dispatch/add/:id",
        Component: DispatchCreatePage,
      },
      {
        path: "dispatch/edit/:id",
        Component: DispatchEditPage,
      },
      {
        path: "dispatch/view/:id",
        Component: DispatchViewPage,
      },
      {
        path: "dispatch",
        Component: DispatchPage,
      },
      {
        path: "tools/component-library",
        Component: ComponentLibraryPage,
      },
      {
        path: "component-library",
        Component: ComponentLibraryPage,
      },
      {
        path: "*",
        Component: AppRedirect,
      },
    ],
  },
]);

function AppRedirect() {
  return <Navigate to="/dashboard" replace />;
}

export function AppRouter() {
  return <RouterProvider router={router} />;
}
