import { useSyncExternalStore } from "react";

import type { EnterpriseTableColumn, EnterpriseTableRow } from "../../../components/data-display/EnterpriseDataTable";

export type PackingTabValue = "done" | "issued";
export type PackingRecordState = "dispatched" | "done" | "issued" | "reverted";

export const packingOrderTypeOptions = [
  "Raw Order",
  "Marquetry",
] as const;

export interface PackingRecord extends EnterpriseTableRow {
  issuedFrom: string;
  orderNo: string;
  customerName: string;
  orderType: string;
  productCategory: string;
  itemName: string;
  length: string;
  width: string;
  thickness: string;
  series: string;
  grade: string;
  amount: string;
  remark: string;
  packingDate: Date | null;
  dispatchDate: Date | null;
  createdBy: string;
  updatedBy: string;
  createdDate: Date;
  updatedDate: Date;
  packingState: PackingRecordState;
}

export const packingListingColumns: readonly EnterpriseTableColumn<PackingRecord>[] =
  [
    { key: "issuedFrom", label: "Issued From" },
    { key: "orderNo", label: "Order No" },
    { key: "customerName", label: "Customer Name" },
    { key: "orderType", label: "Order Type" },
    { key: "productCategory", label: "Product Category" },
    { key: "itemName", label: "Item Name" },
    { key: "length", label: "Length" },
    { key: "width", label: "Width" },
    { key: "thickness", label: "Thickness" },
    { key: "series", label: "Series" },
    { key: "grade", label: "Grade" },
    { key: "amount", label: "Amount" },
    { key: "createdBy", label: "Created By" },
    { key: "updatedBy", label: "Updated By" },
    { key: "createdDate", label: "Created Date" },
    { key: "updatedDate", label: "Updated Date" },
  ];

const packingListeners = new Set<() => void>();
let packingRecords = createPackingRecords();

export function usePackingRecords() {
  return useSyncExternalStore(
    subscribeToPackingStore,
    getPackingRecordsSnapshot,
    getPackingRecordsSnapshot,
  );
}

export function getPackingRecord(recordId: string) {
  return packingRecords.find((record) => record.id === recordId);
}

export function getPackingRecordsByTab(tab: PackingTabValue) {
  return packingRecords.filter((record) =>
    tab === "issued"
      ? record.packingState === "issued"
      : record.packingState === "done",
  );
}

export function updatePackingRecord(
  recordId: string,
  updates: Partial<PackingRecord>,
) {
  updatePackingRecords((records) =>
    records.map((record) =>
      record.id === recordId
        ? {
            ...record,
            ...updates,
          }
        : record,
    ),
  );
}

export function revertPackingRecord(recordId: string) {
  const timestamp = new Date();

  updatePackingRecords((records) =>
    records.map((record) =>
      record.id === recordId
        ? {
            ...record,
            packingState: "reverted",
            updatedBy: "Packing Supervisor",
            updatedDate: timestamp,
          }
        : record,
    ),
  );
}

export function dispatchPackingRecord(recordId: string) {
  const timestamp = new Date();

  updatePackingRecords((records) =>
    records.map((record) =>
      record.id === recordId
        ? {
            ...record,
            packingState: "dispatched",
            updatedBy: "Dispatch Coordinator",
            updatedDate: timestamp,
          }
        : record,
    ),
  );
}

export function revertDispatchEntry(recordId: string) {
  const timestamp = new Date();

  updatePackingRecords((records) =>
    records.map((record) =>
      record.id === recordId
        ? {
            ...record,
            dispatchDate: null,
            packingState: "done",
            updatedBy: "Dispatch Coordinator",
            updatedDate: timestamp,
          }
        : record,
    ),
  );
}

export function createPackingEntry(
  recordId: string | undefined,
  payload: {
    customerName?: string;
    amount?: string;
    issuedFrom?: string;
    itemName?: string;
    length?: string;
    orderNo?: string;
    orderType?: string;
    packingDate?: Date | null;
    productCategory?: string;
    remark?: string;
    thickness?: string;
    width?: string;
  },
) {
  const timestamp = payload.packingDate instanceof Date
    ? payload.packingDate
    : new Date();

  if (!recordId) {
    const nextRecordNumber = packingRecords.length + 1;

    updatePackingRecords((records) => [
      {
        id: `packing-${nextRecordNumber}`,
        issuedFrom: normalizeString(payload.issuedFrom, "Manual Entry"),
        orderNo: normalizeString(
          payload.orderNo,
          `ORD-PK-${String(1000 + nextRecordNumber).padStart(4, "0")}`,
        ),
        customerName: normalizeString(payload.customerName, "New Customer"),
        orderType: normalizeString(payload.orderType, "Raw Order"),
        productCategory: normalizeString(
          payload.productCategory,
          "Raw Veneer",
        ),
        itemName: normalizeString(payload.itemName, "Packing Item"),
        length: normalizeString(payload.length, "2440 mm"),
        width: normalizeString(payload.width, "1220 mm"),
        thickness: normalizeString(payload.thickness, "0.60 mm"),
        series: "DV-Prime",
        grade: "A",
        amount: normalizeString(payload.amount, "18,500.00"),
        remark: normalizeString(payload.remark, ""),
        packingDate: payload.packingDate instanceof Date ? payload.packingDate : timestamp,
        dispatchDate: null,
        createdBy: "Packing Supervisor",
        updatedBy: "Packing Supervisor",
        createdDate: timestamp,
        updatedDate: timestamp,
        packingState: "done",
      },
      ...records,
    ]);

    return;
  }

  updatePackingRecords((records) =>
    records.map((record) =>
      record.id === recordId
        ? {
            ...record,
            customerName: normalizeString(payload.customerName, record.customerName),
            orderType: normalizeString(payload.orderType, record.orderType),
            productCategory: normalizeString(
              payload.productCategory,
              record.productCategory,
            ),
            remark: normalizeString(payload.remark, record.remark),
            packingDate: payload.packingDate instanceof Date ? payload.packingDate : timestamp,
            packingState: "done",
            updatedBy: "Packing Supervisor",
            updatedDate: timestamp,
          }
        : record,
    ),
  );
}

export function createDispatchEntry(
  recordId: string,
  payload: {
    customerName?: string;
    dispatchDate?: Date | null;
    orderType?: string;
    productCategory?: string;
    remark?: string;
  },
) {
  const timestamp = payload.dispatchDate instanceof Date
    ? payload.dispatchDate
    : new Date();

  updatePackingRecords((records) =>
    records.map((record) =>
      record.id === recordId
        ? {
            ...record,
            customerName: normalizeString(payload.customerName, record.customerName),
            orderType: normalizeString(payload.orderType, record.orderType),
            productCategory: normalizeString(
              payload.productCategory,
              record.productCategory,
            ),
            remark: normalizeString(payload.remark, record.remark),
            dispatchDate:
              payload.dispatchDate instanceof Date ? payload.dispatchDate : timestamp,
            packingState: "dispatched",
            updatedBy: "Dispatch Coordinator",
            updatedDate: timestamp,
          }
        : record,
    ),
  );
}

export function getPackingPaths() {
  return {
    list: "/packing",
    add: (id?: string) => (id ? `/packing/add/${id}` : "/packing/add"),
    edit: (id: string) => `/packing/edit/${id}`,
    view: (id: string) => `/packing/view/${id}`,
  };
}

function subscribeToPackingStore(listener: () => void) {
  packingListeners.add(listener);

  return () => {
    packingListeners.delete(listener);
  };
}

function getPackingRecordsSnapshot() {
  return packingRecords;
}

function updatePackingRecords(
  updater: (records: PackingRecord[]) => PackingRecord[],
) {
  packingRecords = updater(packingRecords);
  packingListeners.forEach((listener) => listener());
}

function normalizeString(value: string | undefined, fallback: string) {
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

function createPackingRecords(): PackingRecord[] {
  const issuedFromValues = [
    "Pressing",
    "Finishing",
    "Finish",
    "Warehouse C",
  ] as const;
  const orderTypes = [...packingOrderTypeOptions];
  const productCategories = [
    "Raw Veneer",
    "Veneer Blocks",
    "Plywood",
    "MDF",
  ] as const;
  const itemNames = [
    "Oak Veneer Panel",
    "Walnut Decorative Sheet",
    "Teak Feature Board",
    "Ash Crown Cut Panel",
    "Smoked Oak Veneer",
    "Natural Walnut Sheet",
  ] as const;
  const seriesValues = [
    "DV-Prime",
    "DV-Select",
    "DV-Architect",
    "DV-Craft",
  ] as const;
  const gradeValues = ["A+", "A", "B+", "B"] as const;
  const customerNames = [
    "Aster Interior Studio",
    "Northwood Projects",
    "Urban Craft Furnishings",
    "Heritage Office Systems",
    "Maple Edge Exports",
    "Royal Habitat",
  ] as const;
  const pickValue = <Value,>(values: readonly Value[], index: number) =>
    values[index % values.length]!;

  return Array.from({ length: 75 }, (_, index) => {
    const rowNumber = index + 1;
    const createdDate = new Date(2026, 5, 1 + (index % 25));
    const updatedDate = new Date(2026, 5, 3 + (index % 25));
    const packingState: PackingRecordState =
      index < 25 ? "issued" : index < 50 ? "done" : "dispatched";
    const updatedBy =
      packingState === "issued"
        ? "Packing Supervisor"
        : packingState === "done"
          ? "Quality Coordinator"
          : "Dispatch Coordinator";

    return {
      id: `packing-${rowNumber}`,
      issuedFrom: pickValue(issuedFromValues, index),
      orderNo: `ORD-PK-${String(1000 + rowNumber).padStart(4, "0")}`,
      customerName: pickValue(customerNames, index),
      orderType: pickValue(orderTypes, index),
      productCategory: pickValue(productCategories, index),
      itemName: pickValue(itemNames, index),
      length: `${2400 + (index % 6) * 50} mm`,
      width: `${1200 + (index % 4) * 25} mm`,
      thickness: `${(0.5 + (index % 5) * 0.1).toFixed(2)} mm`,
      series: pickValue(seriesValues, index),
      grade: pickValue(gradeValues, index),
      amount: `${(18500 + index * 875).toLocaleString("en-IN")}.00`,
      remark: "",
      packingDate: packingState === "issued" ? null : updatedDate,
      dispatchDate: packingState === "dispatched" ? updatedDate : null,
      createdBy: index < 25 ? "Packing Planner" : "Packing Operator",
      updatedBy,
      createdDate,
      updatedDate,
      packingState,
    } satisfies PackingRecord;
  });
}
