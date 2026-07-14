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
  userType: string;
  department: string;
  approver: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  state: string;
  city: string;
  address: string;
  pincode: string;
  gender: string;
  bloodGroup: string;
  dateOfBirth: Date;
  age: string;
  phoneNo: string;
  remarks: string;
  createdBy: string;
  createdDate: Date;
  isActive: boolean;
  permissions: Record<string, UserPermissionFlags>;
  updatedDate: Date;
}

export interface UserManagementRecord extends EnterpriseTableRow {
  id: string;
  userName: string;
  userType: string;
  department: string;
  approver: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  state: string;
  city: string;
  address: string;
  pincode: string;
  gender: string;
  bloodGroup: string;
  dateOfBirth: Date;
  age: string;
  phoneNo: string;
  remarks: string;
  createdBy: string;
  createdDate: Date;
  isActive: boolean;
  statusLabel: string;
  updatedDate: Date;
}

export interface UserManagementDetail extends UserManagementSeedRow {
  id: string;
  statusLabel: string;
}

export const userManagementColumns: readonly EnterpriseTableColumn<UserManagementRecord>[] =
  [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "userName", label: "User Name" },
    { key: "userType", label: "User Type" },
    { key: "department", label: "Department" },
    { key: "role", label: "Role" },
    { key: "email", label: "Email" },
    { key: "phoneNo", label: "Phone No" },
    { key: "dateOfBirth", label: "Date Of Birth" },
    { key: "age", label: "Age" },
    { key: "bloodGroup", label: "Blood Group" },
    { key: "address", label: "Address" },
    { key: "city", label: "City" },
    { key: "pincode", label: "Pincode" },
    { key: "state", label: "State" },
    { key: "country", label: "Country" },
    { key: "remarks", label: "Remarks" },
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

export const userTypeOptions = [
  "Admin",
  "Manager",
  "Supervisor",
  "Executive",
] as const;

export const roleOptions = [
  "System Administrator",
  "Executive Approver",
  "Warehouse Supervisor",
  "Warehouse Executive",
  "QC Analyst",
  "Production Supervisor",
  "Sales Coordinator",
  "Sales Executive",
  "Accounts Executive",
  "Dispatch Coordinator",
] as const;

export const countryOptions = ["India"] as const;

export const stateOptions = [
  "Gujarat",
  "Maharashtra",
  "Rajasthan",
  "Delhi",
  "Karnataka",
  "West Bengal",
] as const;

export const cityOptions = [
  "Ahmedabad",
  "Surat",
  "Mumbai",
  "Pune",
  "Jaipur",
  "New Delhi",
  "Bengaluru",
  "Kolkata",
] as const;

export const genderOptions = ["Male", "Female", "Other"] as const;

export const bloodGroupOptions = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
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
      { key: "cutMaster", label: "Cut Master" },
      { key: "customerMaster", label: "Customer Master" },
      { key: "departmentMaster", label: "Department Master" },
      { key: "gstMaster", label: "GST Master" },
      { key: "hsnMaster", label: "HSN Master" },
      { key: "itemCategoryMaster", label: "Category" },
      { key: "itemMaster", label: "Item Master" },
      { key: "itemSubCategoryMaster", label: "Sub Category" },
      { key: "supplierMaster", label: "Supplier Master" },
      { key: "transporterMaster", label: "Transporter Master" },
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
    userType: "Executive",
    department: "Warehouse Team",
    approver: "Dev Joshi",
    role: "Warehouse Executive",
    firstName: "Rohan",
    lastName: "Patel",
    email: "rohan.patel@deluxeveneers.com",
    country: "India",
    state: "Gujarat",
    city: "Ahmedabad",
    address: "Warehouse Campus, Sarkhej Road",
    pincode: "380051",
    gender: "Male",
    bloodGroup: "B+",
    dateOfBirth: new Date("1995-03-14"),
    age: "31",
    phoneNo: "+91 9876501201",
    remarks: "Warehouse stock visibility and inward coordination.",
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
    userType: "Manager",
    department: "Sales Team",
    approver: "Tanya Khanna",
    role: "Sales Coordinator",
    firstName: "Ananya",
    lastName: "Saxena",
    email: "ananya.saxena@deluxeveneers.com",
    country: "India",
    state: "Delhi",
    city: "New Delhi",
    address: "Corporate Office, Connaught Place",
    pincode: "110001",
    gender: "Female",
    bloodGroup: "A+",
    dateOfBirth: new Date("1992-08-22"),
    age: "33",
    phoneNo: "+91 9876501202",
    remarks: "Sales coordination, order intake, and dispatch visibility.",
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
    userType: "Executive",
    department: "Sales Team",
    approver: "Ananya Saxena",
    role: "Sales Executive",
    firstName: "Karan",
    lastName: "Gupta",
    email: "karan.gupta@deluxeveneers.com",
    country: "India",
    state: "Rajasthan",
    city: "Jaipur",
    address: "Regional Sales Office, Tonk Road",
    pincode: "302018",
    gender: "Male",
    bloodGroup: "O+",
    dateOfBirth: new Date("1996-01-09"),
    age: "30",
    phoneNo: "+91 9876501203",
    remarks: "Client coordination for orders and dispatch updates.",
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
    userType: "Executive",
    department: "QC Team",
    approver: "Dev Joshi",
    role: "QC Analyst",
    firstName: "Meera",
    lastName: "Iyer",
    email: "meera.iyer@deluxeveneers.com",
    country: "India",
    state: "Maharashtra",
    city: "Pune",
    address: "Quality Block, Plant 2",
    pincode: "411045",
    gender: "Female",
    bloodGroup: "AB+",
    dateOfBirth: new Date("1994-11-03"),
    age: "31",
    phoneNo: "+91 9876501204",
    remarks: "QC pending review and approval movement access.",
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
    userType: "Supervisor",
    department: "Production Team",
    approver: "Dev Joshi",
    role: "Production Supervisor",
    firstName: "Samar",
    lastName: "Singh",
    email: "samar.singh@deluxeveneers.com",
    country: "India",
    state: "Gujarat",
    city: "Surat",
    address: "Factory Unit 1, Kamrej",
    pincode: "394185",
    gender: "Male",
    bloodGroup: "A-",
    dateOfBirth: new Date("1989-06-17"),
    age: "37",
    phoneNo: "+91 9876501205",
    remarks: "Factory process execution across active production stages.",
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
    userType: "Executive",
    department: "Accounts Team",
    approver: "Tanya Khanna",
    role: "Accounts Executive",
    firstName: "Priya",
    lastName: "Desai",
    email: "priya.desai@deluxeveneers.com",
    country: "India",
    state: "Gujarat",
    city: "Ahmedabad",
    address: "Accounts Office, SG Highway",
    pincode: "380015",
    gender: "Female",
    bloodGroup: "O-",
    dateOfBirth: new Date("1993-02-26"),
    age: "32",
    phoneNo: "+91 9876501206",
    remarks: "Commercial documentation and inward financial visibility.",
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
    userType: "Admin",
    department: "Management / Admin",
    approver: "Tanya Khanna",
    role: "System Administrator",
    firstName: "Dev",
    lastName: "Joshi",
    email: "dev.joshi@deluxeveneers.com",
    country: "India",
    state: "Delhi",
    city: "New Delhi",
    address: "Head Office, Barakhamba Road",
    pincode: "110001",
    gender: "Male",
    bloodGroup: "B-",
    dateOfBirth: new Date("1988-12-05"),
    age: "38",
    phoneNo: "+91 9876501207",
    remarks: "Administrative oversight across commercial and factory modules.",
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
    userType: "Executive",
    department: "Dispatch Team",
    approver: "Tanya Khanna",
    role: "Dispatch Coordinator",
    firstName: "Nisha",
    lastName: "Kapoor",
    email: "nisha.kapoor@deluxeveneers.com",
    country: "India",
    state: "West Bengal",
    city: "Kolkata",
    address: "Dispatch Block, Unit 3",
    pincode: "700091",
    gender: "Female",
    bloodGroup: "A+",
    dateOfBirth: new Date("1995-09-30"),
    age: "30",
    phoneNo: "+91 9876501208",
    remarks: "Dispatch documentation and packed order release workflow.",
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
    userType: "Supervisor",
    department: "Warehouse Team",
    approver: "Dev Joshi",
    role: "Warehouse Supervisor",
    firstName: "Ritesh",
    lastName: "Vora",
    email: "ritesh.vora@deluxeveneers.com",
    country: "India",
    state: "Gujarat",
    city: "Surat",
    address: "Warehouse B, Ring Road",
    pincode: "395002",
    gender: "Male",
    bloodGroup: "AB-",
    dateOfBirth: new Date("1991-05-11"),
    age: "35",
    phoneNo: "+91 9876501209",
    remarks: "Warehouse B inventory and movement monitoring access.",
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
    userType: "Manager",
    department: "Management / Admin",
    approver: "Dev Joshi",
    role: "Executive Approver",
    firstName: "Tanya",
    lastName: "Khanna",
    email: "tanya.khanna@deluxeveneers.com",
    country: "India",
    state: "Maharashtra",
    city: "Mumbai",
    address: "Executive Office, BKC",
    pincode: "400051",
    gender: "Female",
    bloodGroup: "O+",
    dateOfBirth: new Date("1990-07-19"),
    age: "36",
    phoneNo: "+91 9876501210",
    remarks: "Executive visibility for customer, order, and dispatch flow.",
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

export const userManagementDetails: UserManagementDetail[] = userManagementSeedRows.map(
  (row, index) => ({
    id: `user-${index + 1}`,
    ...row,
    statusLabel: row.isActive ? "Active" : "Inactive",
  }),
);

export const approverOptions = userManagementDetails.map((row) => row.userName);

export const userManagementRows: UserManagementRecord[] = userManagementDetails.map(
  ({ permissions, ...row }) => row,
);

export const userManagementFormFields: readonly MasterFieldDefinition[] = [
  {
    key: "firstName",
    label: "First Name",
    type: "text",
    placeholder: "Enter First Name",
  },
  {
    key: "lastName",
    label: "Last Name",
    type: "text",
    placeholder: "Enter Last Name",
  },
  {
    key: "userName",
    label: "User Name",
    type: "text",
    placeholder: "Enter User Name",
  },
  {
    key: "userType",
    label: "User Type",
    type: "select",
    options: [...userTypeOptions],
    placeholder: "Select User Type",
  },
  {
    key: "department",
    label: "Department",
    type: "select",
    options: [...departmentOptions],
    placeholder: "Select Department",
  },
  {
    key: "role",
    label: "Role",
    type: "select",
    options: [...roleOptions],
    placeholder: "Select Role",
  },
  {
    key: "email",
    label: "Email",
    type: "text",
    placeholder: "Enter Email",
  },
  {
    key: "phoneNo",
    label: "Phone No",
    type: "text",
    placeholder: "Enter Phone No",
  },
  {
    key: "dateOfBirth",
    label: "Date Of Birth",
    type: "date",
    placeholder: "Select Date Of Birth",
  },
  {
    key: "age",
    label: "Age",
    type: "text",
    placeholder: "Enter Age",
  },
  {
    key: "bloodGroup",
    label: "Blood Group",
    type: "select",
    options: [...bloodGroupOptions],
    placeholder: "Select Blood Group",
  },
  {
    key: "address",
    label: "Address",
    type: "text",
    placeholder: "Enter Address",
  },
  {
    key: "city",
    label: "City",
    type: "select",
    options: [...cityOptions],
    placeholder: "Select City",
  },
  {
    key: "pincode",
    label: "Pincode",
    type: "text",
    placeholder: "Enter Pincode",
  },
  {
    key: "state",
    label: "State",
    type: "select",
    options: [...stateOptions],
    placeholder: "Select State",
  },
  {
    key: "country",
    label: "Country",
    type: "select",
    options: [...countryOptions],
    placeholder: "Select Country",
  },
  {
    key: "remarks",
    label: "Remarks",
    type: "text",
    placeholder: "Enter Remarks",
  },
];

export const userManagementConfigureFields: readonly MasterFieldDefinition[] = [
  {
    key: "userName",
    label: "User Name",
    type: "text",
    placeholder: "Selected User",
  },
  {
    key: "department",
    label: "Department",
    type: "select",
    options: [...departmentOptions],
    placeholder: "Select Department",
  },
  {
    key: "role",
    label: "Role",
    type: "select",
    options: [...roleOptions],
    placeholder: "Select Role",
  },
  {
    key: "remarks",
    label: "Remarks",
    type: "text",
    placeholder: "Enter Remarks",
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

export function getUserManagementSearchValues(row: UserManagementRecord) {
  return [
    ...userManagementColumns.map(
      (column) => row[column.key as keyof UserManagementRecord],
    ),
    row.statusLabel,
    row.createdBy,
    row.createdDate,
    row.updatedDate,
  ];
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
