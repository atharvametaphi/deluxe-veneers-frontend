import type { RouteObject } from "react-router";

import {
  AddOrderModulePage,
  EditOrderModulePage,
  OrderPage,
  ViewOrderModulePage,
} from "./pages";

export const orderRoutes: RouteObject[] = [
  { path: "order", Component: OrderPage },
  { path: "order/add", Component: AddOrderModulePage },
  { path: "order/edit/:id", Component: EditOrderModulePage },
  { path: "order/view/:id", Component: ViewOrderModulePage },
];
