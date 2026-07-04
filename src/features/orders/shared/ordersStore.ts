import { useSyncExternalStore } from "react";

import type {
  EnterpriseTableColumn,
  EnterpriseTableRow,
} from "../../../components/data-display/EnterpriseDataTable";
import type { MasterFieldDefinition } from "../../masters/shared";

export interface OrderRecord extends EnterpriseTableRow {
  orderNo: string;
  orderDate: Date;
  customerName: string;
  orderType: string;
  productCategory: string;
  itemName: string;
  subCategory: string;
  series: string;
  grade: string;
  length: string;
  width: string;
  thickness: string;
  quantitySheets: string;
  totalSqm: string;
  amount: string;
  deliveryDate: Date;
  salesCoordinator: string;
  createdBy: string;
  updatedBy: string;
  createdDate: Date;
  updatedDate: Date;
  status: string;
}

export type OrderDraft = Pick<
  OrderRecord,
  | "amount"
  | "customerName"
  | "deliveryDate"
  | "grade"
  | "itemName"
  | "length"
  | "orderDate"
  | "orderNo"
  | "orderType"
  | "productCategory"
  | "quantitySheets"
  | "salesCoordinator"
  | "series"
  | "status"
  | "subCategory"
  | "thickness"
  | "totalSqm"
  | "width"
>;

export const orderListingColumns: readonly EnterpriseTableColumn<OrderRecord>[] =
  [
    { key: "orderNo", label: "Order No" },
    { key: "orderDate", label: "Order Date" },
    { key: "customerName", label: "Customer Name" },
    { key: "orderType", label: "Order Type" },
    { key: "productCategory", label: "Product Category" },
    { key: "itemName", label: "Item Name" },
    { key: "subCategory", label: "Sub Category" },
    { key: "series", label: "Series" },
    { key: "grade", label: "Grade" },
    { key: "length", label: "Length" },
    { key: "width", label: "Width" },
    { key: "thickness", label: "Thickness" },
    { key: "quantitySheets", label: "Quantity Sheets" },
    { key: "totalSqm", label: "Total SQM" },
    { key: "amount", label: "Amount" },
    { key: "deliveryDate", label: "Delivery Date" },
    { key: "salesCoordinator", label: "Sales Coordinator" },
    { key: "createdBy", label: "Created By" },
    { key: "updatedBy", label: "Updated By" },
    { key: "createdDate", label: "Created Date" },
    { key: "updatedDate", label: "Updated Date" },
    { key: "status", label: "Status" },
  ];

const orderTypeOptions = [
  "Export / OEM",
  "Domestic Project",
  "Marquetry",
  "Sample Development",
  "Splicing",
] as const;

const productCategoryOptions = [
  "Raw Veneer",
  "Veneer Blocks",
  "Plywood",
  "MDF",
] as const;

const subCategoryOptions = [
  "Crown Cut",
  "Natural",
  "Quarter Cut",
  "Rift Cut",
] as const;

const seriesOptions = [
  "DV-Architect",
  "DV-Craft",
  "DV-Prime",
  "DV-Select",
] as const;

const gradeOptions = ["A+", "A", "B+", "B"] as const;

const salesCoordinatorOptions = [
  "Aarav Bansal",
  "Neha Sharma",
  "Ritika Soni",
  "Vikram Mehta",
] as const;

const statusOptions = [
  "Draft",
  "Confirmed",
  "In Production",
  "Packing Scheduled",
  "Ready for Dispatch",
] as const;

export const orderFormFields: readonly MasterFieldDefinition[] = [
  {
    key: "orderNo",
    label: "Order No",
    type: "text",
    placeholder: "Enter order number",
  },
  {
    key: "orderDate",
    label: "Order Date",
    type: "date",
    placeholder: "Select order date",
  },
  {
    key: "customerName",
    label: "Customer Name",
    type: "text",
    placeholder: "Enter customer name",
  },
  {
    key: "orderType",
    label: "Order Type",
    type: "select",
    options: [...orderTypeOptions],
    placeholder: "Select order type",
  },
  {
    key: "productCategory",
    label: "Product Category",
    type: "select",
    options: [...productCategoryOptions],
    placeholder: "Select product category",
  },
  {
    key: "itemName",
    label: "Item Name",
    type: "text",
    placeholder: "Enter item name",
  },
  {
    key: "subCategory",
    label: "Sub Category",
    type: "select",
    options: [...subCategoryOptions],
    placeholder: "Select sub category",
  },
  {
    key: "series",
    label: "Series",
    type: "select",
    options: [...seriesOptions],
    placeholder: "Select series",
  },
  {
    key: "grade",
    label: "Grade",
    type: "select",
    options: [...gradeOptions],
    placeholder: "Select grade",
  },
  {
    key: "length",
    label: "Length",
    type: "text",
    placeholder: "Enter length",
  },
  {
    key: "width",
    label: "Width",
    type: "text",
    placeholder: "Enter width",
  },
  {
    key: "thickness",
    label: "Thickness",
    type: "text",
    placeholder: "Enter thickness",
  },
  {
    key: "quantitySheets",
    label: "Quantity Sheets",
    type: "text",
    placeholder: "Enter quantity sheets",
  },
  {
    key: "totalSqm",
    label: "Total SQM",
    type: "text",
    placeholder: "Enter total sqm",
  },
  {
    key: "amount",
    label: "Amount",
    type: "text",
    placeholder: "Enter amount",
  },
  {
    key: "deliveryDate",
    label: "Delivery Date",
    type: "date",
    placeholder: "Select delivery date",
  },
  {
    key: "salesCoordinator",
    label: "Sales Coordinator",
    type: "select",
    options: [...salesCoordinatorOptions],
    placeholder: "Select sales coordinator",
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [...statusOptions],
    placeholder: "Select status",
  },
];

export const orderViewFields: readonly MasterFieldDefinition[] = [
  ...orderFormFields,
  {
    key: "createdBy",
    label: "Created By",
    type: "text",
  },
  {
    key: "updatedBy",
    label: "Updated By",
    type: "text",
  },
  {
    key: "createdDate",
    label: "Created Date",
    type: "date",
  },
  {
    key: "updatedDate",
    label: "Updated Date",
    type: "date",
  },
];

const orderListeners = new Set<() => void>();
let orderRecords = createOrderRecords();

export function useOrderRecords() {
  return useSyncExternalStore(
    subscribeToOrdersStore,
    getOrdersSnapshot,
    getOrdersSnapshot,
  );
}

export function getOrderRecord(recordId: string) {
  return orderRecords.find((record) => record.id === recordId);
}

export function createOrderRecord(order: Partial<OrderDraft>) {
  const timestamp = new Date();
  const recordCount = orderRecords.length + 1;
  const salesCoordinator = normalizeString(
    order.salesCoordinator,
    "Aarav Bansal",
  );
  const record: OrderRecord = {
    id: `order-${recordCount}`,
    orderNo: normalizeString(
      order.orderNo,
      `ORD-DV-${String(2000 + recordCount).padStart(4, "0")}`,
    ),
    orderDate: order.orderDate instanceof Date ? order.orderDate : timestamp,
    customerName: normalizeString(order.customerName, "New Customer"),
    orderType: normalizeString(order.orderType, "Domestic Project"),
    productCategory: normalizeString(order.productCategory, "Raw Veneer"),
    itemName: normalizeString(order.itemName, "Oak Veneer Panel"),
    subCategory: normalizeString(order.subCategory, "Quarter Cut"),
    series: normalizeString(order.series, "DV-Prime"),
    grade: normalizeString(order.grade, "A"),
    length: normalizeString(order.length, "2440 mm"),
    width: normalizeString(order.width, "1220 mm"),
    thickness: normalizeString(order.thickness, "0.60 mm"),
    quantitySheets: normalizeString(order.quantitySheets, "24"),
    totalSqm: normalizeString(order.totalSqm, "78.400"),
    amount: normalizeCurrency(order.amount, 185000 + recordCount * 2500),
    deliveryDate:
      order.deliveryDate instanceof Date
        ? order.deliveryDate
        : new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate() + 12),
    salesCoordinator,
    createdBy: salesCoordinator,
    updatedBy: salesCoordinator,
    createdDate: timestamp,
    updatedDate: timestamp,
    status: normalizeString(order.status, "Draft"),
  };

  orderRecords = [record, ...orderRecords];
  emitOrdersChange();

  return record.id;
}

export function updateOrderRecord(
  recordId: string,
  updates: Partial<OrderDraft>,
) {
  const timestamp = new Date();

  orderRecords = orderRecords.map((record) =>
    record.id === recordId
      ? {
          ...record,
          ...sanitizeOrderDraft(updates),
          updatedBy: normalizeString(
            updates.salesCoordinator,
            record.salesCoordinator || record.updatedBy,
          ),
          updatedDate: timestamp,
        }
      : record,
  );

  emitOrdersChange();
}

export function getOrdersPaths() {
  return {
    list: "/orders",
    add: "/orders/add",
    edit: (id: string) => `/orders/edit/${id}`,
    view: (id: string) => `/orders/view/${id}`,
  };
}

function subscribeToOrdersStore(listener: () => void) {
  orderListeners.add(listener);

  return () => {
    orderListeners.delete(listener);
  };
}

function getOrdersSnapshot() {
  return orderRecords;
}

function emitOrdersChange() {
  orderListeners.forEach((listener) => listener());
}

function sanitizeOrderDraft(updates: Partial<OrderDraft>): Partial<OrderRecord> {
  return {
    ...updates,
    amount: normalizeCurrency(updates.amount),
  };
}

function normalizeString(value: string | undefined, fallback: string) {
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeCurrency(value: string | undefined, fallback = 185000) {
  if (!value || value.trim().length === 0) {
    return `₹ ${fallback.toLocaleString("en-IN")}.00`;
  }

  const numericCandidate = Number(value.replace(/[^0-9.]/g, ""));

  if (Number.isNaN(numericCandidate)) {
    return value;
  }

  return `₹ ${numericCandidate.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function createOrderRecords(): OrderRecord[] {
  const customerNames = [
    "Aster Interior Studio",
    "Heritage Office Systems",
    "Maple Edge Exports",
    "Northwood Projects",
    "Royal Habitat",
    "Urban Craft Furnishings",
  ] as const;
  const itemNames = [
    "Ash Crown Cut Panel",
    "Oak Veneer Panel",
    "Smoked Oak Veneer",
    "Teak Feature Board",
    "Walnut Decorative Sheet",
    "Walnut Feature Slab",
  ] as const;
  const coordinators = [...salesCoordinatorOptions];
  const pickValue = <Value,>(values: readonly Value[], index: number) =>
    values[index % values.length]!;

  return Array.from({ length: 30 }, (_, index) => {
    const recordNumber = index + 1;
    const orderDate = new Date(2026, 5, 1 + (index % 25));
    const deliveryDate = new Date(2026, 6, 4 + (index % 20));
    const createdDate = new Date(2026, 5, 1 + (index % 25));
    const updatedDate = new Date(2026, 5, 3 + (index % 25));
    const salesCoordinator = pickValue(coordinators, index);
    const quantitySheets = 18 + (index % 8) * 3;
    const totalSqm = 52.4 + (index % 7) * 6.35;
    const amount = 142500 + index * 6850;

    return {
      id: `order-${recordNumber}`,
      orderNo: `ORD-DV-${String(2000 + recordNumber).padStart(4, "0")}`,
      orderDate,
      customerName: pickValue(customerNames, index),
      orderType: pickValue(orderTypeOptions, index),
      productCategory: pickValue(productCategoryOptions, index),
      itemName: pickValue(itemNames, index),
      subCategory: pickValue(subCategoryOptions, index),
      series: pickValue(seriesOptions, index),
      grade: pickValue(gradeOptions, index),
      length: `${2400 + (index % 5) * 60} mm`,
      width: `${1200 + (index % 4) * 25} mm`,
      thickness: `${(0.5 + (index % 5) * 0.1).toFixed(2)} mm`,
      quantitySheets: String(quantitySheets),
      totalSqm: totalSqm.toFixed(3),
      amount: `₹ ${amount.toLocaleString("en-IN")}.00`,
      deliveryDate,
      salesCoordinator,
      createdBy: salesCoordinator,
      updatedBy: index % 3 === 0 ? "Order Desk" : salesCoordinator,
      createdDate,
      updatedDate,
      status: pickValue(statusOptions, index),
    } satisfies OrderRecord;
  });
}
