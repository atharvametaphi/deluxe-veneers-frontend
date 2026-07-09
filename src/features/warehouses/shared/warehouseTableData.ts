import type { EnterpriseTableColumn } from "../../../components/data-display/EnterpriseDataTable";
import {
  consumablesDefinition,
  mdfDefinition,
  plywoodDefinition,
  rawVeneerDefinition,
  veneerBlocksDefinition,
} from "../../inventory/shared";

export type WarehousePageId = "warehouse-a" | "warehouse-b" | "warehouse-c";
export type WarehouseInventorySlug =
  | "raw-veneer"
  | "veneer-blocks"
  | "plywood"
  | "mdf";
export type WarehouseAInventorySlug = WarehouseInventorySlug | "consumables";
export type WarehouseARawVeneerTab = "purchase" | "production";

export type WarehouseInventoryRow = {
  id: string;
  inventoryRecordId: string;
  inventorySlug: WarehouseAInventorySlug;
  inwardSrNo: string;
  inwardType: string;
  inwardDate: Date;
  invoiceNo: string;
  referenceSrNo: string;
  supplierName: string;
  supplierItemName: string;
  supplierCode: string;
  itemName: string;
  subCategory: string;
  unitName: string;
  color: string;
  palletNo: string;
  length: string;
  width: string;
  thickness: string;
  totalUnits: string;
  availableUnits: string;
  totalSqm: string;
  availableSqm: string;
  currency: string;
  amount: string;
  remark: string;
  status?: string;
  veneerSrNo: string;
  itemSrNo: string;
  mdfSrNo: string;
  timberCode: string;
  logCode: string;
  bundleNumber: string;
  palletNumber: string;
  noOfLeaves: string;
  processName: string;
  processColor: string;
  cutName: string;
  seriesName: string;
  grade: string;
  expenseAmount: string;
  totalNoOfSheets: string;
  avSheets: string;
  avSqm: string;
  plywoodType: string;
  mdfType: string;
};

type WarehouseTableConfig = {
  columns: readonly EnterpriseTableColumn<WarehouseInventoryRow>[];
  rows: readonly WarehouseInventoryRow[];
  title: string;
};

type WarehouseInventoryTabConfig = {
  columns: readonly EnterpriseTableColumn<WarehouseInventoryRow>[];
  rows: readonly WarehouseInventoryRow[];
  title: string;
};

export type WarehouseAInventoryConfig = WarehouseInventoryTabConfig & {
  rawTabs?: Record<WarehouseARawVeneerTab, WarehouseInventoryTabConfig>;
};

const warehouseBaseColumns: readonly EnterpriseTableColumn<WarehouseInventoryRow>[] =
  [
    { key: "inwardSrNo", label: "Inward Sr No" },
    { key: "inwardType", label: "Inward Type" },
    { key: "inwardDate", label: "Inward Date" },
    { key: "invoiceNo", label: "Invoice No" },
    { key: "referenceSrNo", label: "Item / Veneer Sr No" },
    { key: "supplierName", label: "Supplier Name" },
    { key: "supplierItemName", label: "Supplier Item Name" },
    { key: "itemName", label: "Item Name" },
    { key: "subCategory", label: "Sub Category" },
    { key: "color", label: "Color" },
    { key: "palletNo", label: "Pallet No" },
    { key: "length", label: "Length" },
    { key: "width", label: "Width" },
    { key: "thickness", label: "Thickness" },
    { key: "totalUnits", label: "Total No of Sheets / Leaves" },
    { key: "availableUnits", label: "Available No of Sheets / Leaves" },
    { key: "totalSqm", label: "Total SQM" },
    { key: "availableSqm", label: "Available SQM" },
    { key: "currency", label: "Currency" },
    { key: "amount", label: "Amount" },
    { key: "remark", label: "Remark" },
  ];

const warehouseBColumns: readonly EnterpriseTableColumn<WarehouseInventoryRow>[] =
  [...warehouseBaseColumns, { key: "status", label: "Status" }];

const warehouseAVeneerColumns: readonly EnterpriseTableColumn<WarehouseInventoryRow>[] =
  [
    { key: "inwardSrNo", label: "Inward Sr No" },
    { key: "inwardDate", label: "Inward Date" },
    { key: "invoiceNo", label: "Invoice No" },
    { key: "veneerSrNo", label: "Veneer Sr No" },
    { key: "supplierName", label: "Supplier Name" },
    { key: "supplierItemName", label: "Supplier Item Name" },
    { key: "supplierCode", label: "Supplier Code" },
    { key: "subCategory", label: "Sub Category" },
    { key: "itemName", label: "Item Name" },
    { key: "timberCode", label: "Timber Code" },
    { key: "logCode", label: "Log Code" },
    { key: "bundleNumber", label: "Bundle Number" },
    { key: "palletNumber", label: "Pallet Number" },
    { key: "length", label: "Length" },
    { key: "width", label: "Width" },
    { key: "thickness", label: "Thickness" },
    { key: "noOfLeaves", label: "No of Leaves" },
    { key: "totalSqm", label: "Total SQM" },
    { key: "processName", label: "Process Name" },
    { key: "processColor", label: "Process Color" },
    { key: "cutName", label: "Cut Name" },
    { key: "seriesName", label: "Series Name" },
    { key: "grade", label: "Grade" },
    { key: "currency", label: "Currency" },
    { key: "amount", label: "Amount" },
    { key: "expenseAmount", label: "Expense Amount" },
    { key: "remark", label: "Remark" },
  ];

const warehouseARawProductionColumns: readonly EnterpriseTableColumn<WarehouseInventoryRow>[] =
  warehouseAVeneerColumns.filter(
    (column) =>
      column.key !== "invoiceNo" &&
      column.key !== "supplierName" &&
      column.key !== "supplierItemName" &&
      column.key !== "supplierCode",
  );

const warehouseAPlywoodColumns: readonly EnterpriseTableColumn<WarehouseInventoryRow>[] =
  [
    { key: "inwardSrNo", label: "Inward Sr No" },
    { key: "inwardDate", label: "Inward Date" },
    { key: "invoiceNo", label: "Invoice No" },
    { key: "itemSrNo", label: "Item Sr No" },
    { key: "supplierName", label: "Supplier Name" },
    { key: "supplierItemName", label: "Supplier Item Name" },
    { key: "itemName", label: "Item Name" },
    { key: "subCategory", label: "Sub Category" },
    { key: "color", label: "Color" },
    { key: "plywoodType", label: "Plywood Type" },
    { key: "palletNumber", label: "Pallet No" },
    { key: "length", label: "Length" },
    { key: "width", label: "Width" },
    { key: "thickness", label: "Thickness" },
    { key: "totalNoOfSheets", label: "Total No of Sheets" },
    { key: "avSheets", label: "Av Sheets" },
    { key: "totalSqm", label: "Total SQM" },
    { key: "avSqm", label: "Av SQM" },
    { key: "currency", label: "Currency" },
    { key: "amount", label: "Amount" },
    { key: "expenseAmount", label: "Expense Amount" },
    { key: "remark", label: "Remark" },
  ];

const warehouseAMdfColumns: readonly EnterpriseTableColumn<WarehouseInventoryRow>[] =
  [
    { key: "inwardSrNo", label: "Inward Sr No" },
    { key: "inwardDate", label: "Inward Date" },
    { key: "invoiceNo", label: "Invoice No" },
    { key: "mdfSrNo", label: "MDF Sr No" },
    { key: "supplierItemName", label: "Supplier Item Name" },
    { key: "supplierName", label: "Supplier Name" },
    { key: "itemName", label: "Item Name" },
    { key: "mdfType", label: "MDF Type" },
    { key: "length", label: "Length" },
    { key: "width", label: "Width" },
    { key: "thickness", label: "Thickness" },
    { key: "totalNoOfSheets", label: "No of Sheets" },
    { key: "avSheets", label: "Av Sheets" },
    { key: "totalSqm", label: "Total SQM" },
    { key: "avSqm", label: "Av SQM" },
    { key: "palletNumber", label: "Pallet No" },
    { key: "currency", label: "Currency" },
    { key: "amount", label: "Amount" },
    { key: "expenseAmount", label: "Expense Amount" },
    { key: "remark", label: "Remark" },
  ];

const warehouseAConsumablesColumns: readonly EnterpriseTableColumn<WarehouseInventoryRow>[] =
  [
    { key: "inwardSrNo", label: "Inward Sr No" },
    { key: "inwardType", label: "Inward Type" },
    { key: "inwardDate", label: "Inward Date" },
    { key: "subCategory", label: "Category" },
    { key: "totalUnits", label: "Quantity" },
    { key: "availableUnits", label: "Available Quantity" },
    { key: "currency", label: "Currency" },
    { key: "amount", label: "Amount" },
    { key: "remark", label: "Remark" },
  ];

const processNames = [
  "Slicing Ready",
  "Drying Ready",
  "Grouping Ready",
  "Pressing Ready",
  "Finishing Ready",
] as const;
const seriesNames = [
  "Reganto Classic",
  "Reganto Premier",
  "Marvel",
  "Canvas",
  "Bunito",
] as const;
const grades = ["A", "A+", "B+", "Premium", "Export"] as const;
const cuts = ["Quarter Cut", "Crown Cut", "Rift Cut", "Natural", "Flaky"] as const;

function pickCycledValue<const TValue extends string>(
  values: readonly TValue[],
  index: number,
): TValue {
  const fallback = values[0];
  return (values[index % values.length] ?? fallback)!;
}

function parseAmount(value: string) {
  const numeric = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function buildExpenseAmount(amount: string, multiplier: number) {
  return formatAmount(parseAmount(amount) * multiplier);
}

function buildTimberCode(prefix: string, index: number) {
  return `${prefix}-${String(index + 1).padStart(3, "0")}`;
}

function normalizeRawVeneerRow(
  row: Record<string, unknown>,
  idPrefix: string,
): WarehouseInventoryRow {
  const totalUnits = String(row.noOfLeavesSheets ?? "");
  const totalSqm = String(row.totalSqm ?? "");
  const approvalStatus = String(row.approvalStatus ?? "");

  return {
    id: `${idPrefix}-${String(row.id ?? "")}`,
    inventoryRecordId: String(row.id ?? ""),
    inventorySlug: "raw-veneer",
    inwardSrNo: String(row.inwardSrNo ?? ""),
    inwardType: String(row.inwardType ?? ""),
    inwardDate: row.inwardDate instanceof Date ? row.inwardDate : new Date(),
    invoiceNo: String(row.invoiceNo ?? ""),
    referenceSrNo: String(row.veneerSrNo ?? ""),
    supplierName: String(row.supplierName ?? ""),
    supplierItemName: String(row.supplierItemName ?? ""),
    supplierCode: String(row.supplierCode ?? ""),
    itemName: String(row.itemName ?? ""),
    subCategory: String(row.subCategory ?? ""),
    unitName: "",
    color: String(row.timberColor ?? ""),
    palletNo: String(row.palletNo ?? ""),
    length: String(row.length ?? ""),
    width: String(row.width ?? ""),
    thickness: String(row.thickness ?? ""),
    totalUnits,
    availableUnits:
      approvalStatus === "Approved" ? totalUnits : `Hold ${totalUnits}`,
    totalSqm,
    availableSqm: approvalStatus === "Approved" ? totalSqm : "0.000",
    currency: String(row.currency ?? ""),
    amount: String(row.amount ?? ""),
    remark: String(row.remark ?? ""),
    status:
      approvalStatus === "Approved"
        ? "QC Done"
        : approvalStatus === "On Hold"
          ? "QC Hold"
          : "QC Pending",
    veneerSrNo: String(row.veneerSrNo ?? ""),
    itemSrNo: "",
    mdfSrNo: "",
    timberCode: "",
    logCode: "",
    bundleNumber: String(row.bundleNumber ?? ""),
    palletNumber: String(row.palletNo ?? ""),
    noOfLeaves: totalUnits,
    processName: "",
    processColor: String(row.timberColor ?? ""),
    cutName: "",
    seriesName: "",
    grade: "",
    expenseAmount: "",
    totalNoOfSheets: "",
    avSheets: "",
    avSqm: "",
    plywoodType: "",
    mdfType: "",
  };
}

function normalizeStockRow(
  row: Record<string, unknown>,
  idPrefix: string,
  status = "QC Done",
): WarehouseInventoryRow {
  return {
    id: `${idPrefix}-${String(row.id ?? "")}`,
    inventoryRecordId: String(row.id ?? ""),
    inventorySlug:
      idPrefix === "veneer-blocks"
        ? "veneer-blocks"
        : idPrefix === "plywood"
          ? "plywood"
          : "mdf",
    inwardSrNo: String(row.inwardSrNo ?? ""),
    inwardType: String(row.inwardType ?? ""),
    inwardDate: row.inwardDate instanceof Date ? row.inwardDate : new Date(),
    invoiceNo: String(row.invoiceNo ?? ""),
    referenceSrNo: String(row.itemSrNo ?? ""),
    supplierName: String(row.supplierName ?? ""),
    supplierItemName: String(row.supplierItemName ?? ""),
    supplierCode: "",
    itemName: String(row.itemName ?? ""),
    subCategory: String(row.subCategory ?? ""),
    unitName: "",
    color: String(row.color ?? ""),
    palletNo: String(row.palletNo ?? ""),
    length: String(row.length ?? ""),
    width: String(row.width ?? ""),
    thickness: String(row.thickness ?? ""),
    totalUnits: String(row.totalNoOfSheets ?? ""),
    availableUnits: String(row.availableNoOfSheets ?? ""),
    totalSqm: String(row.totalSqm ?? ""),
    availableSqm: String(row.availableSqm ?? ""),
    currency: String(row.currency ?? ""),
    amount: String(row.amount ?? ""),
    remark: String(row.remark ?? ""),
    status,
    veneerSrNo: "",
    itemSrNo: String(row.itemSrNo ?? ""),
    mdfSrNo: "",
    timberCode: "",
    logCode: "",
    bundleNumber: "",
    palletNumber: String(row.palletNo ?? ""),
    noOfLeaves: "",
    processName: "",
    processColor: String(row.color ?? ""),
    cutName: "",
    seriesName: "",
    grade: "",
    expenseAmount: "",
    totalNoOfSheets: String(row.totalNoOfSheets ?? ""),
    avSheets: String(row.availableNoOfSheets ?? ""),
    avSqm: String(row.availableSqm ?? ""),
    plywoodType: String(row.plywoodType ?? ""),
    mdfType: String(row.plywoodType ?? ""),
  };
}

function mapWarehouseVeneerRow(
  row: Record<string, unknown>,
  index: number,
  options?: {
    dropSupplierFields?: boolean;
    dropInvoice?: boolean;
    idPrefix?: string;
    status?: string;
  },
): WarehouseInventoryRow {
  const base = normalizeRawVeneerRow(
    row,
    options?.idPrefix ?? "warehouse-a-raw-veneer",
  );

  return {
    ...base,
    id: `${base.id}-${index + 1}`,
    inventoryRecordId: options?.dropSupplierFields
      ? `${base.inventoryRecordId}-production`
      : base.inventoryRecordId,
    invoiceNo: options?.dropInvoice ? "" : base.invoiceNo,
    supplierName: options?.dropSupplierFields ? "" : base.supplierName,
    supplierItemName: options?.dropSupplierFields ? "" : base.supplierItemName,
    supplierCode: options?.dropSupplierFields ? "" : base.supplierCode,
    timberCode: buildTimberCode("TMB", index),
    logCode: `LOG-${String(index + 1).padStart(4, "0")}`,
    bundleNumber: base.bundleNumber || `BDL-${String(index + 1).padStart(4, "0")}`,
    palletNumber: base.palletNumber || `PAL-${String(index + 1).padStart(2, "0")}`,
    processName: pickCycledValue(processNames, index),
    processColor: base.color,
    cutName: pickCycledValue(cuts, index),
    seriesName: pickCycledValue(seriesNames, index),
    grade: pickCycledValue(grades, index),
    expenseAmount: buildExpenseAmount(base.amount, 0.075),
    status: options?.status ?? base.status ?? "",
  };
}

function mapWarehousePlywoodRow(
  row: Record<string, unknown>,
  index: number,
): WarehouseInventoryRow {
  const base = normalizeStockRow(row, "warehouse-a-plywood");

  return {
    ...base,
    id: `${base.id}-${index + 1}`,
    inventorySlug: "plywood",
    itemSrNo: base.itemSrNo || `ITM-PLY-${String(index + 1).padStart(3, "0")}`,
    palletNumber: base.palletNo,
    expenseAmount: buildExpenseAmount(base.amount, 0.0825),
    plywoodType: String(row.plywoodType ?? ""),
  };
}

function mapWarehouseMdfRow(
  row: Record<string, unknown>,
  index: number,
): WarehouseInventoryRow {
  const base = normalizeStockRow(row, "warehouse-a-mdf");

  return {
    ...base,
    id: `${base.id}-${index + 1}`,
    inventorySlug: "mdf",
    mdfSrNo: base.itemSrNo || `MDF-${String(index + 1).padStart(3, "0")}`,
    palletNumber: base.palletNo,
    expenseAmount: buildExpenseAmount(base.amount, 0.08),
    mdfType: String(row.plywoodType ?? ""),
  };
}

function mapWarehouseConsumableRow(
  row: Record<string, unknown>,
  index: number,
): WarehouseInventoryRow {
  return {
    id: `warehouse-a-consumables-${String(row.id ?? "")}-${index + 1}`,
    inventoryRecordId: String(row.id ?? ""),
    inventorySlug: "consumables",
    inwardSrNo: String(row.inwardSrNo ?? ""),
    inwardType: String(row.inwardType ?? ""),
    inwardDate: row.inwardDate instanceof Date ? row.inwardDate : new Date(),
    invoiceNo: String(row.invoiceNo ?? ""),
    referenceSrNo: String(row.itemSrNo ?? ""),
    supplierName: String(row.supplierName ?? ""),
    supplierItemName: String(row.supplierItemName ?? ""),
    supplierCode: "",
    itemName: String(row.itemName ?? ""),
    subCategory: String(row.subCategory ?? ""),
    unitName: String(row.unitName ?? ""),
    color: "",
    palletNo: "",
    length: "",
    width: "",
    thickness: "",
    totalUnits: String(row.quantity ?? ""),
    availableUnits: String(row.availableQuantity ?? ""),
    totalSqm: "",
    availableSqm: "",
    currency: String(row.currency ?? ""),
    amount: String(row.amount ?? ""),
    remark: String(row.remark ?? ""),
    status: "",
    veneerSrNo: "",
    itemSrNo: String(row.itemSrNo ?? ""),
    mdfSrNo: "",
    timberCode: "",
    logCode: "",
    bundleNumber: "",
    palletNumber: "",
    noOfLeaves: "",
    processName: "",
    processColor: "",
    cutName: "",
    seriesName: "",
    grade: "",
    expenseAmount: "",
    totalNoOfSheets: "",
    avSheets: "",
    avSqm: "",
    plywoodType: "",
    mdfType: "",
  };
}

const rawRows = rawVeneerDefinition.rows.map((row) =>
  normalizeRawVeneerRow(row as Record<string, unknown>, "raw-veneer"),
);
const veneerBlockRows = veneerBlocksDefinition.rows.map((row) =>
  normalizeStockRow(row as Record<string, unknown>, "veneer-blocks"),
);
const plywoodRows = plywoodDefinition.rows.map((row) =>
  normalizeStockRow(row as Record<string, unknown>, "plywood"),
);
const mdfRows = mdfDefinition.rows.map((row) =>
  normalizeStockRow(row as Record<string, unknown>, "mdf"),
);

const warehouseAVeneerBlockRows = rawVeneerDefinition.rows.map((row, index) =>
  mapWarehouseVeneerRow(
    {
      ...row,
      veneerSrNo:
        (row as Record<string, unknown>).veneerSrNo ??
        `VNR-${String(index + 1).padStart(5, "0")}`,
    } as Record<string, unknown>,
    index,
    { idPrefix: "warehouse-a-veneer-blocks" },
  ),
);

const warehouseARawPurchaseRows = rawVeneerDefinition.rows.map((row, index) =>
  mapWarehouseVeneerRow(row as Record<string, unknown>, index, {
    idPrefix: "warehouse-a-raw-purchase",
  }),
);

const warehouseARawProductionRows = rawVeneerDefinition.rows.map((row, index) =>
  mapWarehouseVeneerRow(
    {
      ...row,
      inwardType: "Production",
      invoiceNo: "",
      supplierName: "",
      supplierItemName: "",
      supplierCode: "",
      remark: `Issued from ${pickCycledValue(processNames, index)}.`,
    } as Record<string, unknown>,
    index,
    {
      dropSupplierFields: true,
      dropInvoice: true,
      idPrefix: "warehouse-a-raw-production",
    },
  ),
);

const warehouseAPlywoodRows = plywoodDefinition.rows.map((row, index) =>
  mapWarehousePlywoodRow(row as Record<string, unknown>, index),
);

const warehouseAMdfRows = mdfDefinition.rows.map((row, index) =>
  mapWarehouseMdfRow(row as Record<string, unknown>, index),
);
const warehouseAConsumablesRows = consumablesDefinition.rows.map((row, index) =>
  mapWarehouseConsumableRow(row as Record<string, unknown>, index),
);

const warehouseARows: readonly WarehouseInventoryRow[] = [
  ...warehouseAVeneerBlockRows.slice(0, 4),
  ...warehouseARawPurchaseRows.slice(0, 4),
  ...warehouseAPlywoodRows.slice(0, 4),
  ...warehouseAMdfRows.slice(0, 4),
  ...warehouseAConsumablesRows.slice(0, 4),
];

const warehouseBRows: readonly WarehouseInventoryRow[] = [
  ...rawRows
    .filter((row) => row.status === "QC Done")
    .slice(0, 4)
    .map((row) => ({ ...row, status: "QC Done" })),
  ...veneerBlockRows.slice(0, 3).map((row) => ({ ...row, status: "QC Done" })),
  ...plywoodRows.slice(0, 3).map((row) => ({ ...row, status: "QC Done" })),
  ...mdfRows.slice(0, 2).map((row) => ({ ...row, status: "QC Done" })),
];

const warehouseCRows: readonly WarehouseInventoryRow[] = [
  ...rawRows.filter((row) => row.status === "QC Done").slice(4, 6),
  ...veneerBlockRows.slice(4, 7),
  ...plywoodRows.slice(4, 8),
  ...mdfRows.slice(4, 7),
];

export const warehouseAInventoryConfigs: Record<
  WarehouseAInventorySlug,
  WarehouseAInventoryConfig
> = {
  "veneer-blocks": {
    title: "Veneer Blocks",
    columns: warehouseAVeneerColumns,
    rows: warehouseAVeneerBlockRows,
  },
  "raw-veneer": {
    title: "Raw Veneer",
    columns: warehouseAVeneerColumns,
    rows: warehouseARawPurchaseRows,
  },
  plywood: {
    title: "Plywood",
    columns: warehouseAPlywoodColumns,
    rows: warehouseAPlywoodRows,
  },
  mdf: {
    title: "MDF",
    columns: warehouseAMdfColumns,
    rows: warehouseAMdfRows,
  },
  consumables: {
    title: "Consumables",
    columns: warehouseAConsumablesColumns,
    rows: warehouseAConsumablesRows,
  },
};

export const warehouseRawVeneerTabConfigs: Record<
  WarehouseARawVeneerTab,
  WarehouseInventoryTabConfig
> = {
  purchase: {
    title: "Purchase",
    columns: warehouseAVeneerColumns,
    rows: warehouseARawPurchaseRows,
  },
  production: {
    title: "Production",
    columns: warehouseARawProductionColumns,
    rows: warehouseARawProductionRows,
  },
};

export const warehouseCInventoryConfigs: Record<
  WarehouseInventorySlug,
  WarehouseInventoryTabConfig
> = {
  "veneer-blocks": {
    title: "Veneer Blocks",
    columns: warehouseBaseColumns,
    rows: veneerBlockRows.slice(4, 7),
  },
  "raw-veneer": {
    title: "Raw Veneer",
    columns: warehouseBaseColumns,
    rows: rawRows.filter((row) => row.status === "QC Done").slice(4, 6),
  },
  plywood: {
    title: "Plywood",
    columns: warehouseBaseColumns,
    rows: plywoodRows.slice(4, 8),
  },
  mdf: {
    title: "MDF",
    columns: warehouseBaseColumns,
    rows: mdfRows.slice(4, 7),
  },
};

export const warehouseTableConfigs: Record<
  WarehousePageId,
  WarehouseTableConfig
> = {
  "warehouse-a": {
    title: "Warehouse A",
    columns: warehouseBaseColumns,
    rows: warehouseARows,
  },
  "warehouse-b": {
    title: "Warehouse B",
    columns: warehouseBColumns,
    rows: warehouseBRows,
  },
  "warehouse-c": {
    title: "Warehouse C",
    columns: warehouseBaseColumns,
    rows: warehouseCRows,
  },
};
