import type { RouteObject } from "react-router";

import {
  EditPackingPage,
  PackingPage,
  ViewPackingPage,
} from "./pages";

export const packingRoutes: RouteObject[] = [
  { path: "packing", Component: PackingPage },
  { path: "packing/edit/:id", Component: EditPackingPage },
  { path: "packing/view/:id", Component: ViewPackingPage },
];
