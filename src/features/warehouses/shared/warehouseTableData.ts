import type { EnterpriseTableColumn } from "../../../components/data-display/EnterpriseDataTable";
import {
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

export type WarehouseInventoryRow = {
  id: string;
  inventoryRecordId: string;
  inventorySlug: WarehouseInventorySlug;
  inwardSrNo: string;
  inwardType: string;
  inwardDate: Date;
  invoiceNo: string;
  referenceSrNo: string;
  supplierName: string;
  supplierItemName: string;
  itemName: string;
  subCategory: string;
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
    itemName: String(row.itemName ?? ""),
    subCategory: String(row.subCategory ?? ""),
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
    itemName: String(row.itemName ?? ""),
    subCategory: String(row.subCategory ?? ""),
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

const warehouseARows: readonly WarehouseInventoryRow[] = [
  ...rawRows.slice(0, 4),
  ...veneerBlockRows.slice(0, 4),
  ...plywoodRows.slice(0, 4),
  ...mdfRows.slice(0, 4),
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
  ...rawRows
    .filter((row) => row.status === "QC Done")
    .slice(4, 6),
  ...veneerBlockRows.slice(4, 7),
  ...plywoodRows.slice(4, 8),
  ...mdfRows.slice(4, 7),
];

export const warehouseAInventoryConfigs: Record<
  WarehouseInventorySlug,
  WarehouseInventoryTabConfig
> = {
  "veneer-blocks": {
    title: "Veneer Blocks",
    columns: warehouseBaseColumns,
    rows: veneerBlockRows,
  },
  "raw-veneer": {
    title: "Raw Veneer",
    columns: warehouseBaseColumns,
    rows: rawRows,
  },
  plywood: {
    title: "Plywood",
    columns: warehouseBaseColumns,
    rows: plywoodRows,
  },
  mdf: {
    title: "MDF",
    columns: warehouseBaseColumns,
    rows: mdfRows,
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
    rows: rawRows
      .filter((row) => row.status === "QC Done")
      .slice(4, 6),
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
