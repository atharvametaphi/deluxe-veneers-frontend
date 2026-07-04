import type {
  EnterpriseTableColumn,
  EnterpriseTableRow,
} from "../../../components/data-display/EnterpriseDataTable";
import type { MasterFieldDefinition, MasterFieldValue } from "../../masters/shared";

export type UserPermissionAction = "view" | "edit" | "create";

export interface UserPermissionFlags {
  create: boolean;
  edit: boolean;
  view: boolean;
}

export interface UserPermissionItem {
  key: string;
  label: string;
}

export interface UserPermissionSection {
  id: string;
  label: string;
  items: readonly UserPermissionItem[];
}

interface UserManagementSeedRow {
  userName: string;
  department: string;
  remark: string;
  createdBy: string;
  createdDate: Date;
  isActive: boolean;
  permissions: Record<string, UserPermissionFlags>;
  updatedDate: Date;
}

export interface UserManagementRecord extends EnterpriseTableRow {
  createdBy: string;
  createdDate: Date;
  department: string;
  id: string;
  isActive: boolean;
  remark: string;
  statusLabel: string;
  updatedDate: Date;
  userName: string;
}

export interface UserManagementDetail extends UserManagementSeedRow {
  id: string;
  statusLabel: string;
}

export const userManagementColumns: readonly EnterpriseTableColumn<UserManagementRecord>[] =
  [
    { key: "userName", label: "User Name" },
    { key: "department", label: "Department Name" },
    { key: "statusLabel", label: "Status" },
    { key: "remark", label: "Remarks" },
    { key: "createdBy", label: "Created By" },
    { key: "createdDate", label: "Created Date" },
    { key: "updatedDate", label: "Updated Date" },
  ];

export const departmentOptions = [
  "Management / Admin",
  "Production Team",
  "Warehouse Team",
  "QC Team",
  "Dispatch Team",
  "Sales Team",
  "Accounts Team",
] as const;

export const userPermissionSections: readonly UserPermissionSection[] = [
  {
    id: "core",
    label: "Core Access",
    items: [
      { key: "dashboard", label: "Dashboard" },
      { key: "userManagement", label: "User Management" },
      { key: "rolesPermissions", label: "Roles & Permissions" },
    ],
  },
  {
    id: "masters",
    label: "Masters",
    items: [
      { key: "colorMaster", label: "Color Master" },
      { key: "currencyMaster", label: "Currency Master" },
      { key: "customerMaster", label: "Customer Master" },
      { key: "gstMaster", label: "GST Master" },
      { key: "hsnMaster", label: "HSN Master" },
      { key: "itemCategoryMaster", label: "Item Category" },
      { key: "itemMaster", label: "Item Master" },
      { key: "itemSubCategoryMaster", label: "Item Sub-Category" },
      { key: "supplierMaster", label: "Supplier Master" },
      { key: "unitMaster", label: "Unit Master" },
      { key: "warehouseLocationMaster", label: "Warehouse / Location" },
    ],
  },
  {
    id: "warehouses",
    label: "Warehouses",
    items: [
      { key: "warehouseA", label: "Warehouse A" },
      { key: "warehouseB", label: "Warehouse B" },
      { key: "warehouseC", label: "Warehouse C" },
    ],
  },
  {
    id: "qc",
    label: "QC",
    items: [
      { key: "qcPending", label: "QC Pending" },
      { key: "qcDone", label: "QC Done" },
    ],
  },
  {
    id: "factory",
    label: "Factory",
    items: [
      { key: "slicing", label: "Slicing" },
      { key: "drying", label: "Drying" },
      { key: "pressing", label: "Pressing" },
      { key: "finishing", label: "Finishing" },
      { key: "cncFluting", label: "CNC / Fluting" },
      { key: "embossing", label: "Embossing" },
      { key: "sampleSheets", label: "Sample Sheets" },
      { key: "grouping", label: "Grouping" },
      { key: "splicing", label: "Splicing" },
      { key: "exportOem", label: "Export / OEM" },
      { key: "marquetry", label: "Marquetry" },
    ],
  },
  {
    id: "commercial",
    label: "Commercial",
    items: [
      { key: "placeOrder", label: "Place Order" },
      { key: "packing", label: "Packing" },
      { key: "dispatch", label: "Dispatch" },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    items: [{ key: "componentLibrary", label: "Component Library" }],
  },
];

function getAllPermissionItems() {
  return userPermissionSections.flatMap((section) => section.items);
}

function buildPermissionState(
  overrides: Partial<Record<string, Partial<UserPermissionFlags>>> = {},
) {
  return getAllPermissionItems().reduce<Record<string, UserPermissionFlags>>(
    (accumulator, item) => {
      accumulator[item.key] = {
        view: false,
        edit: false,
        create: false,
        ...overrides[item.key],
      };

      return accumulator;
    },
    {},
  );
}

const userManagementSeedRows: UserManagementSeedRow[] = [
  {
    userName: "Rohan Patel",
    department: "Warehouse Team",
    remark: "Warehouse stock visibility and inward configuration.",
    createdBy: "Neha Sharma",
    createdDate: new Date("2026-06-12"),
    updatedDate: new Date("2026-06-24"),
    isActive: true,
    permissions: buildPermissionState({
      dashboard: { view: true },
      userManagement: { view: true },
      warehouseA: { view: true, edit: true, create: true },
      warehouseB: { view: true, edit: true },
      warehouseC: { view: true },
      qcPending: { view: true },
    }),
  },
  {
    userName: "Ananya Saxena",
    department: "Sales Team",
    remark: "Sales coordination, order intake, and dispatch visibility.",
    createdBy: "Vikram Mehta",
    createdDate: new Date("2026-06-10"),
    updatedDate: new Date("2026-06-26"),
    isActive: true,
    permissions: buildPermissionState({
      dashboard: { view: true },
      customerMaster: { view: true, create: true, edit: true },
      itemMaster: { view: true },
      placeOrder: { view: true, create: true, edit: true },
      packing: { view: true },
      dispatch: { view: true },
    }),
  },
  {
    userName: "Karan Gupta",
    department: "Sales Team",
    remark: "External coordination access for client and order follow-up.",
    createdBy: "Aarav Bansal",
    createdDate: new Date("2026-06-08"),
    updatedDate: new Date("2026-06-18"),
    isActive: true,
    permissions: buildPermissionState({
      dashboard: { view: true },
      customerMaster: { view: true },
      placeOrder: { view: true, create: true },
      dispatch: { view: true },
    }),
  },
  {
    userName: "Meera Iyer",
    department: "QC Team",
    remark: "QC pending review and approval movement access.",
    createdBy: "Neha Sharma",
    createdDate: new Date("2026-06-14"),
    updatedDate: new Date("2026-06-25"),
    isActive: true,
    permissions: buildPermissionState({
      dashboard: { view: true },
      warehouseA: { view: true },
      qcPending: { view: true, edit: true },
      qcDone: { view: true, edit: true },
      warehouseB: { view: true },
    }),
  },
  {
    userName: "Samar Singh",
    department: "Production Team",
    remark: "Factory process execution across active production stages.",
    createdBy: "Vikram Mehta",
    createdDate: new Date("2026-06-07"),
    updatedDate: new Date("2026-06-22"),
    isActive: false,
    permissions: buildPermissionState({
      dashboard: { view: true },
      warehouseB: { view: true },
      slicing: { view: true, edit: true },
      drying: { view: true, edit: true },
      pressing: { view: true, edit: true },
      finishing: { view: true, edit: true },
      cncFluting: { view: true, edit: true },
      embossing: { view: true, edit: true },
      sampleSheets: { view: true, edit: true },
      grouping: { view: true, edit: true },
      splicing: { view: true, edit: true },
      exportOem: { view: true, edit: true },
      marquetry: { view: true, edit: true },
    }),
  },
  {
    userName: "Priya Desai",
    department: "Accounts Team",
    remark: "Commercial documentation and inward financial visibility.",
    createdBy: "Aarav Bansal",
    createdDate: new Date("2026-06-11"),
    updatedDate: new Date("2026-06-23"),
    isActive: true,
    permissions: buildPermissionState({
      dashboard: { view: true },
      customerMaster: { view: true },
      supplierMaster: { view: true },
      currencyMaster: { view: true },
      gstMaster: { view: true, edit: true },
      hsnMaster: { view: true, edit: true },
      dispatch: { view: true },
      placeOrder: { view: true },
    }),
  },
  {
    userName: "Dev Joshi",
    department: "Management / Admin",
    remark: "Administrative oversight across commercial and factory modules.",
    createdBy: "Vikram Mehta",
    createdDate: new Date("2026-06-09"),
    updatedDate: new Date("2026-06-27"),
    isActive: true,
    permissions: buildPermissionState({
      dashboard: { view: true },
      userManagement: { view: true, edit: true, create: true },
      rolesPermissions: { view: true, edit: true, create: true },
      colorMaster: { view: true, edit: true, create: true },
      currencyMaster: { view: true, edit: true, create: true },
      customerMaster: { view: true, edit: true, create: true },
      itemMaster: { view: true, edit: true, create: true },
      supplierMaster: { view: true, edit: true, create: true },
      warehouseA: { view: true, edit: true, create: true },
      warehouseB: { view: true, edit: true, create: true },
      warehouseC: { view: true, edit: true, create: true },
      qcPending: { view: true, edit: true, create: true },
      qcDone: { view: true, edit: true, create: true },
      placeOrder: { view: true, edit: true, create: true },
      packing: { view: true, edit: true, create: true },
      dispatch: { view: true, edit: true, create: true },
      componentLibrary: { view: true },
    }),
  },
  {
    userName: "Nisha Kapoor",
    department: "Dispatch Team",
    remark: "Dispatch documentation and packed order release workflow.",
    createdBy: "Neha Sharma",
    createdDate: new Date("2026-06-13"),
    updatedDate: new Date("2026-06-28"),
    isActive: true,
    permissions: buildPermissionState({
      dashboard: { view: true },
      warehouseC: { view: true },
      packing: { view: true },
      dispatch: { view: true, edit: true, create: true },
      placeOrder: { view: true },
    }),
  },
  {
    userName: "Ritesh Vora",
    department: "Warehouse Team",
    remark: "Warehouse B inventory and movement monitoring access.",
    createdBy: "Aarav Bansal",
    createdDate: new Date("2026-06-15"),
    updatedDate: new Date("2026-06-29"),
    isActive: true,
    permissions: buildPermissionState({
      dashboard: { view: true },
      warehouseA: { view: true, create: true },
      warehouseB: { view: true, edit: true, create: true },
      warehouseC: { view: true },
      qcDone: { view: true },
    }),
  },
  {
    userName: "Tanya Khanna",
    department: "Management / Admin",
    remark: "Executive visibility for customer, order, and dispatch flow.",
    createdBy: "Neha Sharma",
    createdDate: new Date("2026-06-16"),
    updatedDate: new Date("2026-06-30"),
    isActive: true,
    permissions: buildPermissionState({
      dashboard: { view: true },
      customerMaster: { view: true },
      supplierMaster: { view: true },
      placeOrder: { view: true },
      packing: { view: true },
      dispatch: { view: true },
      componentLibrary: { view: true },
    }),
  },
];

const userManagementDetails: UserManagementDetail[] = userManagementSeedRows.map(
  (row, index) => ({
    id: `user-${index + 1}`,
    ...row,
    statusLabel: row.isActive ? "Active" : "Inactive",
  }),
);

export const userManagementRows: UserManagementRecord[] = userManagementDetails.map(
  ({ permissions, ...row }) => row,
);

export const userNameOptions = userManagementDetails.map((row) => row.userName);

export const userManagementFormFields: readonly MasterFieldDefinition[] = [
  {
    key: "userName",
    label: "User Name",
    type: "select",
    options: userNameOptions,
    placeholder: "Select user name",
  },
  {
    key: "department",
    label: "Department",
    type: "select",
    options: [...departmentOptions],
    placeholder: "Select department",
  },
  {
    key: "remark",
    label: "Remark",
    type: "text",
    placeholder: "Enter remark",
  },
  {
    key: "isActive",
    label: "Status",
    type: "toggle",
  },
];

export const userManagementViewFields = userManagementFormFields;

export function getUserManagementPaths() {
  return {
    list: "/user-management",
    add: "/user-management/add",
    edit: (id: string) => `/user-management/edit/${id}`,
    view: (id: string) => `/user-management/view/${id}`,
  };
}

export function buildUserManagementInitialValues(
  fields: readonly MasterFieldDefinition[],
  row?: UserManagementDetail,
) {
  return fields.reduce<Record<string, MasterFieldValue>>((accumulator, field) => {
    if (field.key === "isActive") {
      accumulator[field.key] = row?.isActive ?? false;
      return accumulator;
    }

    const value = row?.[field.key as keyof UserManagementDetail];

    if (field.type === "date") {
      accumulator[field.key] = value instanceof Date ? value : null;
      return accumulator;
    }

    accumulator[field.key] = typeof value === "string" ? value : "";
    return accumulator;
  }, {});
}

export function buildDefaultUserPermissions() {
  return buildPermissionState();
}

export function getUserManagementDetail(id: string) {
  return userManagementDetails.find((row) => row.id === id);
}

export function getUserManagementDetailByName(userName: string) {
  return userManagementDetails.find((row) => row.userName === userName);
}

export function getDefaultUserManagementDetail() {
  return userManagementDetails[0];
}
