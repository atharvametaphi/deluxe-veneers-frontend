import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
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

const inventorySlugs = [
  "veneer-blocks",
  "raw-veneer",
  "plywood",
  "mdf",
  "consumables",
] as const;

const matchesPath = (location: SidebarMatchLocation, routePath: string) =>
  location.pathname === routePath ||
  location.pathname.startsWith(`${routePath}/`);

const getSearchParam = (location: SidebarMatchLocation, key: string) =>
  new URLSearchParams(location.search).get(key);

const matchesSearchParam = (
  location: SidebarMatchLocation,
  key: string,
  expectedValue: string,
) => getSearchParam(location, key) === expectedValue;

const matchesSection = (
  location: SidebarMatchLocation,
  routePath: string,
  section: string,
) =>
  matchesPath(location, routePath) &&
  getSearchParam(location, "section") === section;

const matchesSectionOrDefault = (
  location: SidebarMatchLocation,
  routePath: string,
  section: string,
) => {
  if (!matchesPath(location, routePath)) {
    return false;
  }

  const activeSection = getSearchParam(location, "section");

  return !activeSection || activeSection === section;
};

const matchesInventoryRecordRoute = (
  location: SidebarMatchLocation,
  slug: (typeof inventorySlugs)[number],
  warehouse: "warehouse-a" | "warehouse-b" | "warehouse-c",
) => {
  if (!matchesPath(location, `/inventory/${slug}`)) {
    return false;
  }

  const activeWarehouse = getSearchParam(location, "warehouse");

  if (warehouse === "warehouse-b") {
    return !activeWarehouse || activeWarehouse === "warehouse-b";
  }

  return activeWarehouse === warehouse;
};

const matchesAnyWarehouseInventoryRecordRoute = (
  location: SidebarMatchLocation,
  warehouse: "warehouse-a" | "warehouse-c",
) =>
  inventorySlugs.some((slug) =>
    matchesInventoryRecordRoute(location, slug, warehouse),
  );

const matchesWarehouseBFactoryRoute = (location: SidebarMatchLocation) =>
  matchesSection(location, "/warehouse-b", "factory") ||
  matchesPath(location, "/factory/slicing") ||
  matchesPath(location, "/factory/drying");

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

export interface DynamicWarehouseSidebarItem {
  id: string;
  label: string;
  slug: string;
  warehouseType: string;
}

const staticSidebarNavigation: SidebarNavigationEntry[] = [
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
        id: "consumables-master",
        label: "Consumables",
        to: "/masters/consumables-master",
        match: (location) =>
          matchesPath(location, "/masters/consumables-master"),
      },
      {
        id: "currency-master",
        label: "Currency",
        to: "/masters/currency-master",
        match: (location) => matchesPath(location, "/masters/currency-master"),
      },
      {
        id: "cut-master",
        label: "Cut",
        to: "/masters/cut-master",
        match: (location) => matchesPath(location, "/masters/cut-master"),
      },
      {
        id: "customer-master",
        label: "Customer",
        to: "/masters/customer-master",
        match: (location) => matchesPath(location, "/masters/customer-master"),
      },
      {
        id: "department-master",
        label: "Department",
        to: "/masters/department-master",
        match: (location) =>
          matchesPath(location, "/masters/department-master"),
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
        id: "item-category-master",
        label: "Item Category",
        to: "/masters/item-category-master",
        match: (location) =>
          matchesPath(location, "/masters/item-category-master"),
      },
      {
        id: "item-name-master",
        label: "Item Name",
        to: "/masters/item-name-master",
        match: (location) =>
          matchesPath(location, "/masters/item-name-master"),
      },
      {
        id: "item-sub-category-master",
        label: "Item Sub Category",
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
        id: "transporter-master",
        label: "Transporter",
        to: "/masters/transporter-master",
        match: (location) =>
          matchesPath(location, "/masters/transporter-master"),
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
    match: (location) =>
      matchesPath(location, "/warehouse-a") ||
      matchesAnyWarehouseInventoryRecordRoute(location, "warehouse-a"),
  },
  {
    id: "warehouse-b",
    label: "Warehouse B",
    icon: Warehouse,
    items: [
      {
        id: "warehouse-b-inventory",
        label: "Inventory",
        to: "/warehouse-b?section=inventory&inventory=veneer-blocks",
        match: (location) =>
          matchesSectionOrDefault(location, "/warehouse-b", "inventory") ||
          inventorySlugs
            .filter((slug) => slug !== "consumables")
            .some((slug) =>
              matchesInventoryRecordRoute(location, slug, "warehouse-b"),
            ),
      },
      {
        id: "warehouse-b-factory",
        label: "Factory",
        to: "/warehouse-b?section=factory&factory=slicing",
        match: matchesWarehouseBFactoryRoute,
      },
      {
        id: "warehouse-b-inspection",
        label: "Inspection",
        to: "/warehouse-b?section=inspection",
        match: (location) =>
          matchesSection(location, "/warehouse-b", "inspection"),
      },
    ],
  },
  {
    id: "warehouse-c",
    label: "Warehouse C",
    icon: Warehouse,
    items: [
      {
        id: "warehouse-c-inventory",
        label: "Inventory",
        to: "/warehouse-c?section=inventory&inventory=raw-veneer",
        match: (location) =>
          matchesSectionOrDefault(location, "/warehouse-c", "inventory") ||
          matchesAnyWarehouseInventoryRecordRoute(location, "warehouse-c"),
      },
      {
        id: "warehouse-c-factory",
        label: "Factory",
        to: "/warehouse-c?section=factory&factory=marquetry",
        match: (location) => matchesSection(location, "/warehouse-c", "factory"),
      },
    ],
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

export function getSidebarNavigation(
  dynamicWarehouses: readonly DynamicWarehouseSidebarItem[] = [],
): SidebarNavigationEntry[] {
  const dynamicWarehouseEntries: SidebarNavigationEntry[] =
    dynamicWarehouses.map((warehouse) => {
      if (warehouse.warehouseType === "Storage") {
        return {
          id: `dynamic-warehouse-${warehouse.slug}`,
          label: warehouse.label,
          icon: Warehouse,
          items: [
            {
              id: `dynamic-warehouse-${warehouse.slug}-inventory`,
              label: "Inventory",
              to: `/warehouses/${warehouse.slug}?section=inventory&inventory=veneer-blocks`,
              match: (location) =>
                matchesPath(location, `/warehouses/${warehouse.slug}`) &&
                (!getSearchParam(location, "section") ||
                  getSearchParam(location, "section") === "inventory"),
            },
            {
              id: `dynamic-warehouse-${warehouse.slug}-factory`,
              label: "Factory",
              to: `/warehouses/${warehouse.slug}?section=factory&factory=slicing`,
              match: (location) =>
                matchesSection(location, `/warehouses/${warehouse.slug}`, "factory"),
            },
            {
              id: `dynamic-warehouse-${warehouse.slug}-inspection`,
              label: "Inspection",
              to: `/warehouses/${warehouse.slug}?section=inspection`,
              match: (location) =>
                matchesSection(
                  location,
                  `/warehouses/${warehouse.slug}`,
                  "inspection",
                ),
            },
          ],
        } satisfies SidebarNavigationGroup;
      }

      if (warehouse.warehouseType === "Production") {
        return {
          id: `dynamic-warehouse-${warehouse.slug}`,
          label: warehouse.label,
          icon: Warehouse,
          items: [
            {
              id: `dynamic-warehouse-${warehouse.slug}-inventory`,
              label: "Inventory",
              to: `/warehouses/${warehouse.slug}?section=inventory&inventory=raw-veneer`,
              match: (location) =>
                matchesPath(location, `/warehouses/${warehouse.slug}`) &&
                (!getSearchParam(location, "section") ||
                  getSearchParam(location, "section") === "inventory"),
            },
            {
              id: `dynamic-warehouse-${warehouse.slug}-factory`,
              label: "Factory",
              to: `/warehouses/${warehouse.slug}?section=factory&factory=marquetry`,
              match: (location) =>
                matchesSection(location, `/warehouses/${warehouse.slug}`, "factory"),
            },
          ],
        } satisfies SidebarNavigationGroup;
      }

      if (warehouse.warehouseType === "Inward") {
        return {
          id: `dynamic-warehouse-${warehouse.slug}`,
          label: warehouse.label,
          icon: Warehouse,
          to: `/warehouses/${warehouse.slug}?inventory=veneer-blocks`,
          match: (location) =>
            matchesPath(location, `/warehouses/${warehouse.slug}`),
        } satisfies SidebarNavigationLink;
      }

      return {
        id: `dynamic-warehouse-${warehouse.slug}`,
        label: warehouse.label,
        icon: Warehouse,
        to: `/warehouses/${warehouse.slug}`,
        match: (location) =>
          matchesPath(location, `/warehouses/${warehouse.slug}`),
      } satisfies SidebarNavigationLink;
    });

  const qcIndex = staticSidebarNavigation.findIndex((entry) => entry.id === "qc");

  if (qcIndex === -1 || dynamicWarehouseEntries.length === 0) {
    return [...staticSidebarNavigation];
  }

  return [
    ...staticSidebarNavigation.slice(0, qcIndex),
    ...dynamicWarehouseEntries,
    ...staticSidebarNavigation.slice(qcIndex),
  ];
}

export const sidebarNavigation = getSidebarNavigation();
