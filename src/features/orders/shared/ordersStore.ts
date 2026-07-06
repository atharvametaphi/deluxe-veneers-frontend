import { useSyncExternalStore } from "react";

import type {
  EnterpriseTableColumn,
  EnterpriseTableRow,
} from "../../../components/data-display/EnterpriseDataTable";
import type { MasterFieldDefinition } from "../../masters/shared";

export interface OrderLineItem {
  id: string;
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
}

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

export interface OrderDraft {
  amount?: string;
  customerName?: string;
  deliveryDate?: Date;
  grade?: string;
  itemName?: string;
  length?: string;
  lineItems?: OrderLineItem[];
  orderDate?: Date;
  orderNo?: string;
  orderType?: string;
  productCategory?: string;
  quantitySheets?: string;
  salesCoordinator?: string;
  series?: string;
  status?: string;
  subCategory?: string;
  thickness?: string;
  totalSqm?: string;
  width?: string;
}

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

export const orderTypeOptions = [
  "Export / OEM",
  "Domestic Project",
  "Marquetry",
  "Sample Development",
  "Splicing",
] as const;

export const productCategoryOptions = [
  "Raw Veneer",
  "Veneer Blocks",
  "Plywood",
  "MDF",
] as const;

export const subCategoryOptions = [
  "Crown Cut",
  "Natural",
  "Quarter Cut",
  "Rift Cut",
] as const;

export const seriesOptions = [
  "DV-Architect",
  "DV-Craft",
  "DV-Prime",
  "DV-Select",
] as const;

export const gradeOptions = ["A+", "A", "B+", "B"] as const;

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
    placeholder: "Enter Order Number",
  },
  {
    key: "orderDate",
    label: "Order Date",
    type: "date",
    placeholder: "Select Order Date",
  },
  {
    key: "customerName",
    label: "Customer Name",
    type: "text",
    placeholder: "Enter Customer Name",
  },
  {
    key: "orderType",
    label: "Order Type",
    type: "select",
    options: [...orderTypeOptions],
    placeholder: "Select Order Type",
  },
  {
    key: "productCategory",
    label: "Product Category",
    type: "select",
    options: [...productCategoryOptions],
    placeholder: "Select Product Category",
  },
  {
    key: "itemName",
    label: "Item Name",
    type: "text",
    placeholder: "Enter Item Name",
  },
  {
    key: "subCategory",
    label: "Sub Category",
    type: "select",
    options: [...subCategoryOptions],
    placeholder: "Select Sub Category",
  },
  {
    key: "series",
    label: "Series",
    type: "select",
    options: [...seriesOptions],
    placeholder: "Select Series",
  },
  {
    key: "grade",
    label: "Grade",
    type: "select",
    options: [...gradeOptions],
    placeholder: "Select Grade",
  },
  {
    key: "length",
    label: "Length",
    type: "text",
    placeholder: "Enter Length",
  },
  {
    key: "width",
    label: "Width",
    type: "text",
    placeholder: "Enter Width",
  },
  {
    key: "thickness",
    label: "Thickness",
    type: "text",
    placeholder: "Enter Thickness",
  },
  {
    key: "quantitySheets",
    label: "Quantity Sheets",
    type: "text",
    placeholder: "Enter Quantity Sheets",
  },
  {
    key: "totalSqm",
    label: "Total SQM",
    type: "text",
    placeholder: "Enter Total SQM",
  },
  {
    key: "amount",
    label: "Amount",
    type: "text",
    placeholder: "Enter Amount",
  },
  {
    key: "deliveryDate",
    label: "Delivery Date",
    type: "date",
    placeholder: "Select Delivery Date",
  },
  {
    key: "salesCoordinator",
    label: "Sales Coordinator",
    type: "select",
    options: [...salesCoordinatorOptions],
    placeholder: "Select Sales Coordinator",
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [...statusOptions],
    placeholder: "Select Status",
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
const initialOrderState = createInitialOrderState();
let orderRecords = initialOrderState.records;
const orderLineItemsById = initialOrderState.lineItemsById;

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

export function getOrderLineItems(recordId: string) {
  return [...(orderLineItemsById.get(recordId) ?? [])];
}

export function createOrderRecord(order: Partial<OrderDraft>) {
  const timestamp = new Date();
  const recordCount = orderRecords.length + 1;
  const salesCoordinator = normalizeString(
    order.salesCoordinator,
    "Aarav Bansal",
  );
  const lineItems = normalizeLineItems(order.lineItems);
  const record = applyOrderLineItemSummary(
    {
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
          : new Date(
              timestamp.getFullYear(),
              timestamp.getMonth(),
              timestamp.getDate() + 12,
            ),
      salesCoordinator,
      createdBy: salesCoordinator,
      updatedBy: salesCoordinator,
      createdDate: timestamp,
      updatedDate: timestamp,
      status: normalizeString(order.status, "Draft"),
    },
    lineItems,
  );

  orderRecords = [record, ...orderRecords];
  orderLineItemsById.set(record.id, lineItems);
  emitOrdersChange();

  return record.id;
}

export function updateOrderRecord(
  recordId: string,
  updates: Partial<OrderDraft>,
) {
  const timestamp = new Date();
  const existingLineItems = orderLineItemsById.get(recordId) ?? [];
  const nextLineItems = updates.lineItems
    ? normalizeLineItems(updates.lineItems)
    : existingLineItems;

  orderRecords = orderRecords.map((record) =>
    record.id === recordId
      ? applyOrderLineItemSummary(
          {
            ...record,
            ...sanitizeOrderDraft(updates),
            updatedBy: normalizeString(
              updates.salesCoordinator,
              record.salesCoordinator || record.updatedBy,
            ),
            updatedDate: timestamp,
          },
          nextLineItems,
        )
      : record,
  );

  orderLineItemsById.set(recordId, nextLineItems);
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
  const { lineItems: _lineItems, ...recordUpdates } = updates;

  return {
    ...recordUpdates,
    amount: normalizeCurrency(updates.amount),
  };
}

function normalizeLineItems(
  lineItems: readonly OrderLineItem[] | undefined,
): OrderLineItem[] {
  if (!Array.isArray(lineItems)) {
    return [];
  }

  return lineItems.map((item, index) => ({
    id: item.id || `order-line-item-${index + 1}`,
    productCategory: normalizeString(item.productCategory, "Raw Veneer"),
    itemName: normalizeString(item.itemName, "Oak Veneer Panel"),
    subCategory: normalizeString(item.subCategory, "Quarter Cut"),
    series: normalizeString(item.series, "DV-Prime"),
    grade: normalizeString(item.grade, "A"),
    length: normalizeString(item.length, "2440 mm"),
    width: normalizeString(item.width, "1220 mm"),
    thickness: normalizeString(item.thickness, "0.60 mm"),
    quantitySheets: normalizeString(item.quantitySheets, "24"),
    totalSqm: normalizeString(item.totalSqm, "78.400"),
    amount: normalizeCurrency(item.amount, 185000),
  }));
}

function applyOrderLineItemSummary(
  record: OrderRecord,
  lineItems: readonly OrderLineItem[],
) {
  if (lineItems.length === 0) {
    return record;
  }

  const firstItem = lineItems[0]!;
  const totalQuantitySheets = lineItems.reduce(
    (sum, item) => sum + parseNumberValue(item.quantitySheets),
    0,
  );
  const totalSqm = lineItems.reduce(
    (sum, item) => sum + parseNumberValue(item.totalSqm),
    0,
  );
  const totalAmount = lineItems.reduce(
    (sum, item) => sum + parseNumberValue(item.amount),
    0,
  );

  return {
    ...record,
    productCategory: firstItem.productCategory,
    itemName: firstItem.itemName,
    subCategory: firstItem.subCategory,
    series: firstItem.series,
    grade: firstItem.grade,
    length: firstItem.length,
    width: firstItem.width,
    thickness: firstItem.thickness,
    quantitySheets:
      totalQuantitySheets > 0
        ? String(totalQuantitySheets)
        : firstItem.quantitySheets,
    totalSqm:
      totalSqm > 0
        ? totalSqm.toLocaleString("en-US", {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
          })
        : firstItem.totalSqm,
    amount:
      totalAmount > 0
        ? normalizeCurrency(String(totalAmount), totalAmount)
        : firstItem.amount,
  };
}

function normalizeString(value: string | undefined, fallback: string) {
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeCurrency(value: string | undefined, fallback = 185000) {
  if (!value || value.trim().length === 0) {
    return `â‚¹ ${fallback.toLocaleString("en-IN")}.00`;
  }

  const numericCandidate = Number(value.replace(/[^0-9.]/g, ""));

  if (Number.isNaN(numericCandidate)) {
    return value;
  }

  return `â‚¹ ${numericCandidate.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function parseNumberValue(value: string | undefined) {
  if (!value) {
    return 0;
  }

  const numericValue = Number(value.replace(/[^0-9.]/g, ""));

  return Number.isNaN(numericValue) ? 0 : numericValue;
}

function createInitialOrderState() {
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
  const records: OrderRecord[] = [];
  const lineItemsById = new Map<string, OrderLineItem[]>();
  const pickValue = <Value,>(values: readonly Value[], index: number) =>
    values[index % values.length]!;

  Array.from({ length: 30 }, (_, index) => {
    const recordNumber = index + 1;
    const orderDate = new Date(2026, 5, 1 + (index % 25));
    const deliveryDate = new Date(2026, 6, 4 + (index % 20));
    const createdDate = new Date(2026, 5, 1 + (index % 25));
    const updatedDate = new Date(2026, 5, 3 + (index % 25));
    const salesCoordinator = pickValue(coordinators, index);
    const quantitySheets = 18 + (index % 8) * 3;
    const totalSqm = 52.4 + (index % 7) * 6.35;
    const amount = 142500 + index * 6850;
    const productCategory = pickValue(productCategoryOptions, index);
    const itemName = pickValue(itemNames, index);
    const subCategory = pickValue(subCategoryOptions, index);
    const series = pickValue(seriesOptions, index);
    const grade = pickValue(gradeOptions, index);
    const length = `${2400 + (index % 5) * 60} mm`;
    const width = `${1200 + (index % 4) * 25} mm`;
    const thickness = `${(0.5 + (index % 5) * 0.1).toFixed(2)} mm`;
    const recordId = `order-${recordNumber}`;
    const lineItem: OrderLineItem = {
      id: `order-line-item-${recordNumber}-1`,
      productCategory,
      itemName,
      subCategory,
      series,
      grade,
      length,
      width,
      thickness,
      quantitySheets: String(quantitySheets),
      totalSqm: totalSqm.toFixed(3),
      amount: `â‚¹ ${amount.toLocaleString("en-IN")}.00`,
    };
    const record: OrderRecord = {
      id: recordId,
      orderNo: `ORD-DV-${String(2000 + recordNumber).padStart(4, "0")}`,
      orderDate,
      customerName: pickValue(customerNames, index),
      orderType: pickValue(orderTypeOptions, index),
      productCategory,
      itemName,
      subCategory,
      series,
      grade,
      length,
      width,
      thickness,
      quantitySheets: String(quantitySheets),
      totalSqm: totalSqm.toFixed(3),
      amount: `â‚¹ ${amount.toLocaleString("en-IN")}.00`,
      deliveryDate,
      salesCoordinator,
      createdBy: salesCoordinator,
      updatedBy: index % 3 === 0 ? "Order Desk" : salesCoordinator,
      createdDate,
      updatedDate,
      status: pickValue(statusOptions, index),
    };

    records.push(record);
    lineItemsById.set(recordId, [lineItem]);
  });

  return { records, lineItemsById };
}
