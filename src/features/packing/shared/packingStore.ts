import { useSyncExternalStore } from "react";

import type { EnterpriseTableColumn, EnterpriseTableRow } from "../../../components/data-display/EnterpriseDataTable";

export type PackingTabValue = "done" | "issued";
export type PackingRecordState = "dispatched" | "done" | "issued" | "reverted";

export const packingOrderTypeOptions = [
  "Raw",
  "Finished",
] as const;

export interface PackingRecord extends EnterpriseTableRow {
  packingId: string;
  issuedFrom: string;
  orderNo: string;
  orderItemNo: string;
  customerName: string;
  orderType: string;
  productCategory: string;
  preparedBy: string;
  checkedBy: string;
  itemName: string;
  length: string;
  width: string;
  thickness: string;
  noOfSheets: string;
  sqm: string;
  sqf: string;
  series: string;
  grade: string;
  amount: string;
  remark: string;
  dispatchBuyerAddress?: string;
  dispatchSellerAddress?: string;
  dispatchTransactionType?: string;
  dispatchTransporter?: string;
  dispatchTransportMode?: string;
  dispatchTotalQuantity?: string;
  dispatchTotalSqf?: string;
  dispatchGrandTotal?: string;
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
    { key: "packingId", label: "Packing ID" },
    { key: "orderNo", label: "Order No" },
    { key: "orderItemNo", label: "Order Item Number" },
    { key: "customerName", label: "Customer Name" },
    { key: "orderType", label: "Order Type" },
    { key: "productCategory", label: "Product Type" },
    { key: "length", label: "Length" },
    { key: "width", label: "Width" },
    { key: "thickness", label: "Thickness" },
    { key: "noOfSheets", label: "No of Sheets" },
    { key: "sqm", label: "SQM" },
    { key: "sqf", label: "SQF" },
    { key: "amount", label: "Amount" },
    { key: "remark", label: "Remark" },
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
    checkedBy?: string;
    issuedFrom?: string;
    itemName?: string;
    length?: string;
    noOfSheets?: string;
    orderNo?: string;
    orderItemNo?: string;
    orderType?: string;
    packingDate?: Date | null;
    preparedBy?: string;
    productCategory?: string;
    remark?: string;
    sqf?: string;
    sqm?: string;
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
        packingId: `PKG-${String(nextRecordNumber).padStart(4, "0")}`,
        issuedFrom: normalizeString(payload.issuedFrom, "Manual Entry"),
        orderNo: normalizeString(
          payload.orderNo,
          `ORD-PK-${String(1000 + nextRecordNumber).padStart(4, "0")}`,
        ),
        orderItemNo: normalizeString(payload.orderItemNo, "1"),
        customerName: normalizeString(payload.customerName, "New Customer"),
        orderType: normalizeString(payload.orderType, "Raw Order"),
        productCategory: normalizeString(
          payload.productCategory,
          "Raw",
        ),
        preparedBy: normalizeString(payload.preparedBy, "Packing Supervisor"),
        checkedBy: normalizeString(payload.checkedBy, "Quality Coordinator"),
        itemName: normalizeString(payload.itemName, "Packing Item"),
        length: normalizeString(payload.length, "2440 mm"),
        width: normalizeString(payload.width, "1220 mm"),
        thickness: normalizeString(payload.thickness, "0.60 mm"),
        noOfSheets: normalizeString(payload.noOfSheets, "0"),
        sqm: normalizeString(payload.sqm, "0.000"),
        sqf: normalizeString(payload.sqf, "0.000"),
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
            orderNo: normalizeString(payload.orderNo, record.orderNo),
            orderItemNo: normalizeString(payload.orderItemNo, record.orderItemNo),
            orderType: normalizeString(payload.orderType, record.orderType),
            productCategory: normalizeString(
              payload.productCategory,
              record.productCategory,
            ),
            preparedBy: normalizeString(payload.preparedBy, record.preparedBy),
            checkedBy: normalizeString(payload.checkedBy, record.checkedBy),
            noOfSheets: normalizeString(payload.noOfSheets, record.noOfSheets),
            sqm: normalizeString(payload.sqm, record.sqm),
            sqf: normalizeString(payload.sqf, record.sqf),
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
    dispatchGrandTotal?: string;
    dispatchTotalQuantity?: string;
    dispatchTotalSqf?: string;
    dispatchBuyerAddress?: string;
    dispatchSellerAddress?: string;
    dispatchTransactionType?: string;
    dispatchTransporter?: string;
    dispatchTransportMode?: string;
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
            dispatchBuyerAddress: normalizeString(
              payload.dispatchBuyerAddress,
              record.dispatchBuyerAddress ?? "",
            ),
            dispatchSellerAddress: normalizeString(
              payload.dispatchSellerAddress,
              record.dispatchSellerAddress ?? "",
            ),
            dispatchTransactionType: normalizeString(
              payload.dispatchTransactionType,
              record.dispatchTransactionType ?? "",
            ),
            dispatchTransporter: normalizeString(
              payload.dispatchTransporter,
              record.dispatchTransporter ?? "",
            ),
            dispatchTransportMode: normalizeString(
              payload.dispatchTransportMode,
              record.dispatchTransportMode ?? "",
            ),
            dispatchTotalQuantity: normalizeString(
              payload.dispatchTotalQuantity,
              record.dispatchTotalQuantity ?? record.noOfSheets,
            ),
            dispatchTotalSqf: normalizeString(
              payload.dispatchTotalSqf,
              record.dispatchTotalSqf ?? record.sqf,
            ),
            dispatchGrandTotal: normalizeString(
              payload.dispatchGrandTotal,
              record.dispatchGrandTotal ?? record.amount,
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
  const rawProductCategories = [
    "Veneer",
    "Plywood",
    "MDF",
  ] as const;
  const finishedProductCategories = [
    "Marquetry",
    "Fluted",
    "Embossed",
    "Decorative",
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
  const dispatchTransporters = [
    "Amardeep Cargo Logistic",
    "National Freight Carrier",
    "Deluxe Transport Services",
    "Blue Sky Air Cargo",
  ] as const;
  const dispatchTransportModes = ["Road", "Air", "Rail", "Ship"] as const;
  const dispatchTransactionTypes = [
    "REGULAR",
    "BILL TO SHIP TO",
    "BILL FORM DISPATCH FROM",
    "BILL TO SHIP TO AND BILL FROM DISPATCH FROM",
  ] as const;
  const dispatchBuyerAddresses = [
    "At Bhatpore",
    "Corporate Office, SG Highway",
    "Factory Billing Address",
    "Northwood Projects Registered Office",
  ] as const;
  const dispatchSellerAddresses = [
    "Plot No 317 325, Vill Karoli",
    "Deluxe Veneers Factory",
    "Deluxe Veneers Warehouse",
    "Deluxe Veneers Dispatch Office",
  ] as const;
  const pickValue = <Value,>(values: readonly Value[], index: number) =>
    values[index % values.length]!;

  return Array.from({ length: 75 }, (_, index) => {
    const rowNumber = index + 1;
    const createdDate = new Date(2026, 5, 1 + (index % 25));
    const updatedDate = new Date(2026, 5, 3 + (index % 25));
    const lengthMm = 2400 + (index % 6) * 50;
    const widthMm = 1200 + (index % 4) * 25;
    const noOfSheets = 20 + (index % 8) * 4;
    const sqm = (lengthMm / 1000) * (widthMm / 1000) * noOfSheets;
    const sqf = sqm * 10.7639;
    const packingState: PackingRecordState =
      index < 25 ? "issued" : index < 50 ? "done" : "dispatched";
    const orderType = pickValue(orderTypes, index);
    const isRawOrder = orderType === "Raw";
    const updatedBy =
      packingState === "issued"
        ? "Packing Supervisor"
        : packingState === "done"
          ? "Quality Coordinator"
          : "Dispatch Coordinator";

    return {
      id: `packing-${rowNumber}`,
      packingId:
        packingState === "issued"
          ? ""
          : `PKG-2026-${String(rowNumber).padStart(4, "0")}`,
      issuedFrom: pickValue(issuedFromValues, index),
      orderNo: `ORD-PK-${String(1000 + rowNumber).padStart(4, "0")}`,
      orderItemNo: String((index % 5) + 1),
      customerName: pickValue(customerNames, index),
      orderType,
      productCategory: isRawOrder
        ? pickValue(rawProductCategories, index)
        : pickValue(finishedProductCategories, index),
      preparedBy: "Packing Supervisor",
      checkedBy: "Quality Coordinator",
      itemName: pickValue(itemNames, index),
      length: `${lengthMm} mm`,
      width: `${widthMm} mm`,
      thickness: `${(0.5 + (index % 5) * 0.1).toFixed(2)} mm`,
      noOfSheets: String(noOfSheets),
      sqm: sqm.toFixed(3),
      sqf: sqf.toFixed(3),
      series: pickValue(seriesValues, index),
      grade: pickValue(gradeValues, index),
      amount: `${(18500 + index * 875).toLocaleString("en-IN")}.00`,
      remark: "",
      ...(packingState === "dispatched"
        ? {
            dispatchBuyerAddress: pickValue(dispatchBuyerAddresses, index),
            dispatchSellerAddress: pickValue(dispatchSellerAddresses, index),
            dispatchTransactionType: pickValue(dispatchTransactionTypes, index),
            dispatchTransporter: pickValue(dispatchTransporters, index),
            dispatchTransportMode: pickValue(dispatchTransportModes, index),
          }
        : {}),
      packingDate: createdDate,
      dispatchDate: packingState === "dispatched" ? updatedDate : null,
      createdBy: index < 25 ? "Packing Planner" : "Packing Operator",
      updatedBy,
      createdDate,
      updatedDate,
      packingState,
    } satisfies PackingRecord;
  });
}
