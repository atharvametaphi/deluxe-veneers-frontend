import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Factory,
  LayoutDashboard,
  PackageOpen,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  UsersRound,
  Warehouse,
  Wrench,
} from "lucide-react";

export type SidebarMatchLocation = {
  pathname: string;
  search: string;
};

const matchesPath = (location: SidebarMatchLocation, routePath: string) =>
  location.pathname === routePath ||
  location.pathname.startsWith(`${routePath}/`);

const matchesSearchParam = (
  location: SidebarMatchLocation,
  key: string,
  expectedValue: string,
) => new URLSearchParams(location.search).get(key) === expectedValue;

export type SidebarNavigationItem = {
  id: string;
  label: string;
  to: string;
  match: (location: SidebarMatchLocation) => boolean;
};

type SidebarNavigationBase = {
  id: string;
  label: string;
  icon: LucideIcon;
  filledIcon?: boolean;
};

export type SidebarNavigationLink = SidebarNavigationBase & {
  to: string;
  match: (location: SidebarMatchLocation) => boolean;
  items?: never;
  defaultOpen?: never;
};

export type SidebarNavigationGroup = SidebarNavigationBase & {
  additionalMatches?: readonly ((location: SidebarMatchLocation) => boolean)[];
  defaultOpen?: boolean;
  items: SidebarNavigationItem[];
  to?: never;
  match?: never;
};

export type SidebarNavigationEntry =
  | SidebarNavigationLink
  | SidebarNavigationGroup;

export const sidebarNavigation: SidebarNavigationEntry[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/dashboard",
    match: (location) => matchesPath(location, "/dashboard"),
  },
  {
    id: "user-management",
    label: "User Management",
    icon: UsersRound,
    to: "/user-management",
    match: (location) => matchesPath(location, "/user-management"),
  },
  {
    id: "roles-permissions",
    label: "Roles & Permissions",
    icon: ShieldCheck,
    to: "/roles-permissions",
    match: (location) => matchesPath(location, "/roles-permissions"),
  },
  {
    id: "masters",
    label: "Masters",
    icon: Star,
    items: [
      {
        id: "color-master",
        label: "Color",
        to: "/masters/color-master",
        match: (location) => matchesPath(location, "/masters/color-master"),
      },
      {
        id: "currency-master",
        label: "Currency",
        to: "/masters/currency-master",
        match: (location) => matchesPath(location, "/masters/currency-master"),
      },
      {
        id: "customer-master",
        label: "Customer",
        to: "/masters/customer-master",
        match: (location) => matchesPath(location, "/masters/customer-master"),
      },
      {
        id: "gst-master",
        label: "GST",
        to: "/masters/gst-master",
        match: (location) => matchesPath(location, "/masters/gst-master"),
      },
      {
        id: "hsn-master",
        label: "HSN",
        to: "/masters/hsn-master",
        match: (location) => matchesPath(location, "/masters/hsn-master"),
      },
      {
        id: "item-master",
        label: "Item",
        to: "/masters/item-master",
        match: (location) => matchesPath(location, "/masters/item-master"),
      },
      {
        id: "item-category-master",
        label: "Item Category",
        to: "/masters/item-category-master",
        match: (location) =>
          matchesPath(location, "/masters/item-category-master"),
      },
      {
        id: "item-sub-category-master",
        label: "Item Sub-Category",
        to: "/masters/item-sub-category-master",
        match: (location) =>
          matchesPath(location, "/masters/item-sub-category-master"),
      },
      {
        id: "supplier-master",
        label: "Supplier",
        to: "/masters/supplier-master",
        match: (location) =>
          matchesPath(location, "/masters/supplier-master") ||
          matchesPath(location, "/supplier-master"),
      },
      {
        id: "unit-master",
        label: "Unit",
        to: "/masters/unit-master",
        match: (location) => matchesPath(location, "/masters/unit-master"),
      },
      {
        id: "warehouse-location-master",
        label: "Warehouse / Location",
        to: "/masters/warehouse-location-master",
        match: (location) =>
          matchesPath(location, "/masters/warehouse-location-master"),
      },
    ],
  },
  {
    id: "warehouse-a",
    label: "Warehouse A",
    icon: Warehouse,
    to: "/warehouse-a",
    match: (location) => matchesPath(location, "/warehouse-a"),
  },
  {
    id: "warehouse-b",
    label: "Warehouse B",
    icon: Warehouse,
    additionalMatches: [
      (location) =>
        matchesPath(location, "/warehouse-b") &&
        !new URLSearchParams(location.search).get("inventory"),
    ],
    items: [
      {
        id: "warehouse-b-veneer-blocks",
        label: "Veneer Blocks",
        to: "/warehouse-b?inventory=veneer-blocks",
        match: (location) =>
          (matchesPath(location, "/warehouse-b") &&
            matchesSearchParam(location, "inventory", "veneer-blocks")) ||
          matchesPath(location, "/inventory/veneer-blocks"),
      },
      {
        id: "warehouse-b-raw-veneer",
        label: "Raw Veneer",
        to: "/warehouse-b?inventory=raw-veneer",
        match: (location) =>
          (matchesPath(location, "/warehouse-b") &&
            matchesSearchParam(location, "inventory", "raw-veneer")) ||
          matchesPath(location, "/inventory/raw-veneer"),
      },
      {
        id: "warehouse-b-plywood",
        label: "Plywood",
        to: "/warehouse-b?inventory=plywood",
        match: (location) =>
          (matchesPath(location, "/warehouse-b") &&
            matchesSearchParam(location, "inventory", "plywood")) ||
          matchesPath(location, "/inventory/plywood"),
      },
      {
        id: "warehouse-b-mdf",
        label: "MDF",
        to: "/warehouse-b?inventory=mdf",
        match: (location) =>
          (matchesPath(location, "/warehouse-b") &&
            matchesSearchParam(location, "inventory", "mdf")) ||
          matchesPath(location, "/inventory/mdf"),
      },
    ],
  },
  {
    id: "warehouse-c",
    label: "Warehouse C",
    icon: Warehouse,
    to: "/warehouse-c",
    match: (location) => matchesPath(location, "/warehouse-c"),
  },
  {
    id: "qc",
    label: "QC",
    icon: BadgeCheck,
    additionalMatches: [
      (location) =>
        matchesPath(location, "/qc") &&
        !matchesPath(location, "/qc/pending") &&
        !matchesPath(location, "/qc/done"),
    ],
    items: [
      {
        id: "qc-pending",
        label: "QC Pending",
        to: "/qc/pending?inventory=veneer-blocks",
        match: (location) => matchesPath(location, "/qc/pending"),
      },
      {
        id: "qc-done",
        label: "QC Done",
        to: "/qc/done?inventory=veneer-blocks",
        match: (location) => matchesPath(location, "/qc/done"),
      },
    ],
  },
  {
    id: "factory",
    label: "Factory",
    icon: Factory,
    items: [
      {
        id: "slicing",
        label: "Slicing",
        to: "/factory/slicing",
        match: (location) => matchesPath(location, "/factory/slicing"),
      },
      {
        id: "drying",
        label: "Drying",
        to: "/factory/drying",
        match: (location) => matchesPath(location, "/factory/drying"),
      },
      {
        id: "grouping",
        label: "Grouping",
        to: "/factory/grouping",
        match: (location) => matchesPath(location, "/factory/grouping"),
      },
      {
        id: "splicing",
        label: "Splicing",
        to: "/factory/splicing",
        match: (location) => matchesPath(location, "/factory/splicing"),
      },
      {
        id: "pressing",
        label: "Pressing",
        to: "/factory/pressing",
        match: (location) => matchesPath(location, "/factory/pressing"),
      },
      {
        id: "finishing",
        label: "Finishing",
        to: "/factory/finishing",
        match: (location) => matchesPath(location, "/factory/finishing"),
      },
      {
        id: "cnc-fluting",
        label: "CNC / Fluting",
        to: "/factory/cnc-fluting",
        match: (location) => matchesPath(location, "/factory/cnc-fluting"),
      },
      {
        id: "embossing",
        label: "Embossing",
        to: "/factory/embossing",
        match: (location) => matchesPath(location, "/factory/embossing"),
      },
      {
        id: "marquetry",
        label: "Marquetry",
        to: "/factory/marquetry",
        match: (location) => matchesPath(location, "/factory/marquetry"),
      },
      {
        id: "sample-sheets",
        label: "Sample Sheets",
        to: "/factory/sample-sheets",
        match: (location) => matchesPath(location, "/factory/sample-sheets"),
      },
      {
        id: "export-oem",
        label: "Export / OEM",
        to: "/factory/export-oem",
        match: (location) => matchesPath(location, "/factory/export-oem"),
      },
    ],
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingCart,
    to: "/orders",
    match: (location) => matchesPath(location, "/orders"),
  },
  {
    id: "packing",
    label: "Packing",
    icon: PackageOpen,
    to: "/packing",
    match: (location) => matchesPath(location, "/packing"),
  },
  {
    id: "dispatch",
    label: "Dispatch",
    icon: Truck,
    to: "/dispatch",
    match: (location) => matchesPath(location, "/dispatch"),
  },
  {
    id: "tools",
    label: "Tools",
    icon: Wrench,
    items: [
      {
        id: "component-library",
        label: "Component Library",
        to: "/tools/component-library",
        match: (location) =>
          matchesPath(location, "/tools/component-library") ||
          matchesPath(location, "/component-library"),
      },
    ],
  },
];
