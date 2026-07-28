import type {
  EnterpriseTableCellValue,
  EnterpriseTableColumn,
} from "../../../components/data-display/EnterpriseDataTable";
import type { MasterFieldDefinition } from "../../masters/shared";
import {
  createFactoryRows,
  createSection,
  expandFactoryRowsForTabs,
  uniqueFactoryOptions,
} from "./factoryUtils";
import type { FactoryDefinition, FactoryRecord } from "./types";

type FactoryRowSeed = Record<string, EnterpriseTableCellValue>;

const asDate = (value: string) => new Date(value);

const column = (
  key: string,
  label: string,
): EnterpriseTableColumn<FactoryRecord> => ({
  key,
  label,
});

const textField = (
  key: string,
  label: string,
  options?: Partial<MasterFieldDefinition>,
): MasterFieldDefinition => ({
  key,
  label,
  type: "text",
  ...options,
});

const dateField = (key: string, label: string): MasterFieldDefinition => ({
  key,
  label,
  type: "date",
});

const selectField = (
  key: string,
  label: string,
  rows: readonly FactoryRecord[],
): MasterFieldDefinition => ({
  key,
  label,
  type: "select",
  options: uniqueFactoryOptions(rows, key),
});

const field = (
  key: string,
  label: string,
  rows: readonly FactoryRecord[],
): MasterFieldDefinition => {
  if (key.toLowerCase().endsWith("date")) {
    return dateField(key, label);
  }

  const selectKeys = new Set([
    "baseType",
    "color",
    "consumedFrom",
    "cut",
    "grade",
    "issuedFor",
    "itemName",
    "itemSubCategory",
    "productType",
    "shift",
  ]);

  if (selectKeys.has(key)) {
    return selectField(key, label, rows);
  }

  return textField(key, label);
};

const columns = (
  specs: readonly (readonly [key: string, label: string])[],
) => specs.map(([key, label]) => column(key, label));

const fields = (
  specs: readonly (readonly [key: string, label: string])[],
  rows: readonly FactoryRecord[],
) => specs.map(([key, label]) => field(key, label, rows));

const names = [
  "Atharva Khan",
  "Neha Shah",
  "Rohit Jain",
  "Aditi Desai",
  "Harsh Vora",
  "Vikram Mehta",
] as const;

const itemNames = [
  "Oak Veneer",
  "Walnut Veneer",
  "Teak Veneer",
  "Ash Veneer",
  "Maple Veneer",
  "Beech Veneer",
] as const;

const itemSubCategories = [
  "Quarter Cut",
  "Crown Cut",
  "Natural",
  "Rift Cut",
  "Decorative",
  "Premium",
] as const;

const colors = [
  "Natural Oak",
  "Dark Walnut",
  "Golden Brown",
  "Light Ash",
  "Maple Cream",
  "Beech Natural",
] as const;

const customers = [
  "Northwood Projects",
  "ABM Wood Decor Pvt. Ltd.",
  "Prime Habitat Studio",
  "Aura Living Concepts",
  "Woodform Spaces",
  "Urban Form Interiors",
] as const;

const productNames = [
  "Wall Panel",
  "Wardrobe Shutter",
  "Conference Table Top",
  "Decorative Sheet",
  "Fluted Panel",
  "Embossed Panel",
] as const;

const grades = ["A", "B", "Premium", "Select", "Commercial", "Export"] as const;
const cuts = ["Quarter Cut", "Crown Cut", "Rift Cut", "Natural", "Rotary", "Plain"] as const;
const shifts = ["Day", "Morning", "General", "Evening", "Night", "Second"] as const;
const SQM_TO_SQF = 10.7639;

function day(value: number) {
  return asDate(`2026-07-${String(value).padStart(2, "0")}`);
}

function amount(index: number, base = 42000) {
  return `${(base + index * 8250).toLocaleString("en-IN")}.00`;
}

function toSqf(sqm: string) {
  const value = Number.parseFloat(sqm);
  return Number.isFinite(value) ? (value * SQM_TO_SQF).toFixed(3) : "";
}

function commonRow(index: number, warehouseName: "Warehouse B" | "Warehouse C") {
  const sequence = index + 1;
  const sqm = (95.25 + index * 8.4).toFixed(3);
  const consumedSqm = (54.2 + index * 4.4).toFixed(3);
  const consumeSqm = (42.1 + index * 3.3).toFixed(3);
  const issuedSqm = (72.4 + index * 6.2).toFixed(3);
  const outputSqm = (64.8 + index * 5.8).toFixed(3);

  return {
    issuedFrom: warehouseName,
    issuedDate: day(2 + index),
    orderDate: day(1 + index),
    itemName: itemNames[index % itemNames.length],
    itemSubCategory: itemSubCategories[index % itemSubCategories.length],
    color: colors[index % colors.length],
    length: `${2440 + index * 20} mm`,
    width: `${1220 + index * 10} mm`,
    height: `${4 + index} mm`,
    thickness: `${0.6 + index * 0.1}`,
    sqm,
    sqf: toSqf(sqm),
    sqmSqf: sqm,
    amount: amount(index),
    remark: [
      "Production batch aligned for next process.",
      "Priority lot for customer order.",
      "Checked and released by supervisor.",
      "Held for dimensional verification.",
      "Processed under standard workflow.",
      "Ready for downstream planning.",
    ][index],
    createdBy: names[index % names.length],
    createdAt: day(4 + index),
    updatedBy: names[(index + 1) % names.length],
    updatedAt: day(5 + index),
    issuedFor: [
      "Drying",
      "Pressing",
      "Splicing",
      "CNC / Fluting",
      "Finishing",
    ][index],
    customerName: customers[index % customers.length],
    orderNo: `ORD-2026-${String(1200 + sequence)}`,
    orderItemNo: `ITEM-${String(sequence).padStart(3, "0")}`,
    productName: productNames[index % productNames.length],
    logNo: `LOG-${String(3000 + sequence)}`,
    cmt: (1.18 + index * 0.16).toFixed(3),
    noOfSheets: String(18 + index * 2),
    noOfLeaves: String(42 + index * 3),
    cut: cuts[index % cuts.length],
    cutColor: `${cuts[index % cuts.length]} / ${colors[index % colors.length]}`,
    grade: grades[index % grades.length],
    shift: shifts[index % shifts.length],
    workers: String(8 + index),
    noOfWorkers: String(10 + index),
    noOfWorkingHours: `${7 + (index % 3) * 0.5}`,
    noOfTotalHours: `${8 + (index % 3) * 0.5}`,
    groupingDate: day(7 + index),
    pressingDate: day(8 + index),
    cncDate: day(9 + index),
    finishingDate: day(10 + index),
    productType: ["Raw", "Marquetry", "Decorative", "Fluted", "Embossed", "Raw"][index],
    instructions: "Follow production tolerance sheet.",
    pressingId: `PRS-${String(900 + sequence)}`,
    baseThickness: `${12 + index} mm`,
    veneerThickness: `${0.6 + index * 0.1}`,
    baseType: ["Plywood", "MDF", "Veneer Block", "Plywood", "MDF", "Plywood"][index],
    consumedFrom: ["Warehouse C", "Pressing Stock", "Raw Veneer", "MDF", "Plywood", "Warehouse C"][index],
    consumedLength: `${2400 + index * 20} mm`,
    consumedWidth: `${1200 + index * 10} mm`,
    consumedThickness: `${10 + index} mm`,
    consumedNoOfSheets: String(10 + index),
    consumeSheets: String(6 + index),
    consumedSqm,
    consumedSqf: toSqf(consumedSqm),
    consumedSqmSqf: consumedSqm,
    consumeSqm,
    consumeSqf: toSqf(consumeSqm),
    consumeSqmSqf: consumeSqm,
    consumedAmount: amount(index, 26000),
    issuedNoOfSheets: String(16 + index),
    issuedSqm,
    issuedSqf: toSqf(issuedSqm),
    issuedSqmSqf: issuedSqm,
    issueRemark: "Issued material verified before process.",
    outputNoOfSheets: String(14 + index),
    outputSqm,
    outputSqf: toSqf(outputSqm),
    outputSqmSqf: outputSqm,
    orderDetails: `Order item ${sequence} for ${productNames[index % productNames.length]}`,
  };
}

function factoryRows(
  prefix: string,
  warehouseName: "Warehouse B" | "Warehouse C",
  override?: (row: FactoryRowSeed, index: number) => FactoryRowSeed,
) {
  return createFactoryRows<FactoryRecord>(
    prefix,
    Array.from({ length: 6 }, (_, index) => {
      const row = commonRow(index, warehouseName) as FactoryRowSeed;
      return override ? override(row, index) : row;
    }),
  );
}

const slicingRows = factoryRows("slicing", "Warehouse B", (row) => ({
  ...row,
  issuedFor: "Drying",
}));

const dryingRows = factoryRows("drying", "Warehouse B", (row) => ({
  ...row,
  issuedFor: "Inspection",
}));

const groupingRows = factoryRows("grouping", "Warehouse C", (row) => ({
  ...row,
  issuedFor: "Splicing",
}));

const sampleSheetRows = factoryRows("sample-sheets", "Warehouse C", (row) => ({
  ...row,
  issuedFor: "Finishing",
}));

const splicingRows = factoryRows("splicing", "Warehouse C", (row) => ({
  ...row,
  issuedFor: "Pressing",
}));

const pressingRows = factoryRows("pressing", "Warehouse C", (row) => ({
  ...row,
  issuedFor: "CNC / Fluting",
}));

const cncFlutingRows = factoryRows("cnc-fluting", "Warehouse C", (row) => ({
  ...row,
  issuedFor: "Finishing",
}));

const embossingRows = factoryRows("embossing", "Warehouse C", (row) => ({
  ...row,
  issuedFor: "Finishing",
}));

const finishingRows = factoryRows("finishing", "Warehouse C", (row) => ({
  ...row,
  issuedFor: "Packing",
}));

const marquetryRows = factoryRows("marquetry", "Warehouse C", (row) => ({
  ...row,
  issuedFor: "Pressing",
}));

const exportOemRows = factoryRows("export-oem", "Warehouse C", (row) => ({
  ...row,
  issuedFor: "Dispatch",
}));

const slicingListingColumns = columns([
  ["issuedFrom", "Issued From"],
  ["issuedDate", "Issued Date"],
  ["itemName", "Item Name"],
  ["itemSubCategory", "Item Sub Category"],
  ["color", "Color"],
  ["length", "Length"],
  ["width", "Width"],
  ["height", "Height"],
  ["sqm", "SQM"],
  ["sqf", "SQF"],
  ["amount", "Amount"],
  ["remark", "Remark"],
  ["createdBy", "Created By"],
  ["createdAt", "Created At"],
  ["updatedBy", "Updated By"],
  ["updatedAt", "Updated At"],
] as const);

const splicingListingColumns = columns([
  ["issuedFor", "Issued For"],
  ["orderDate", "Order Date"],
  ["issuedDate", "Issued Date"],
  ["customerName", "Customer Name"],
  ["orderNo", "Order No"],
  ["orderItemNo", "Order Item No"],
  ["productName", "Product Name"],
  ["itemName", "Item Name"],
  ["itemSubCategory", "Item Sub Category"],
  ["length", "Length"],
  ["width", "Width"],
  ["thickness", "Thickness"],
  ["noOfSheets", "No of Sheets"],
  ["sqm", "SQM"],
  ["sqf", "SQF"],
  ["cut", "Cut"],
  ["color", "Color"],
  ["amount", "Amount"],
  ["remark", "Remark"],
  ["createdBy", "Created By"],
  ["createdAt", "Created At"],
  ["updatedBy", "Updated By"],
  ["updatedAt", "Updated At"],
] as const);

const productionListingColumns = columns([
  ["issuedFrom", "Issued From"],
  ["issuedFor", "Issued For"],
  ["orderDate", "Order Date"],
  ["issuedDate", "Issued Date"],
  ["customerName", "Customer Name"],
  ["orderNo", "Order No"],
  ["orderItemNo", "Order Item No"],
  ["productName", "Product Name"],
  ["itemName", "Item Name"],
  ["itemSubCategory", "Item Sub Category"],
  ["length", "Length"],
  ["width", "Width"],
  ["thickness", "Thickness"],
  ["noOfSheets", "No of Sheets"],
  ["sqm", "SQM"],
  ["sqf", "SQF"],
  ["amount", "Amount"],
  ["cutColor", "Cut Color"],
  ["grade", "Grade"],
  ["remark", "Remark"],
  ["createdBy", "Created By"],
  ["createdAt", "Created At"],
  ["updatedBy", "Updated By"],
  ["updatedAt", "Updated At"],
] as const);

const cncListingColumns = columns([
  ["issuedFrom", "Issued From"],
  ["issuedFor", "Issued For"],
  ["orderDate", "Order Date"],
  ["issuedDate", "Issued Date"],
  ["customerName", "Customer Name"],
  ["orderNo", "Order No"],
  ["orderItemNo", "Order Item No"],
  ["productName", "Product Name"],
  ["itemName", "Item Name"],
  ["itemSubCategory", "Item Sub Category"],
  ["length", "Length"],
  ["width", "Width"],
  ["thickness", "Thickness"],
  ["noOfSheets", "No of Sheets"],
  ["sqm", "SQM"],
  ["sqf", "SQF"],
  ["amount", "Amount"],
  ["remark", "Remarks"],
  ["createdBy", "Created By"],
  ["createdAt", "Created At"],
  ["updatedBy", "Updated By"],
  ["updatedAt", "Updated At"],
] as const);

const finishingListingColumns = columns([
  ["issuedFrom", "Issued From"],
  ["issuedFor", "Issued For"],
  ["orderDate", "Order Date"],
  ["issuedDate", "Issued Date"],
  ["customerName", "Customer Name"],
  ["orderNo", "Order No"],
  ["orderItemNo", "Order Item No"],
  ["productName", "Product Name"],
  ["itemName", "Item Name"],
  ["itemSubCategory", "Item Sub Category"],
  ["length", "Length"],
  ["width", "Width"],
  ["thickness", "Thickness"],
  ["noOfSheets", "No of Sheets"],
  ["sqm", "SQM"],
  ["sqf", "SQF"],
  ["amount", "Amount"],
  ["remark", "Remark"],
  ["createdBy", "Created By"],
  ["createdAt", "Created At"],
  ["updatedBy", "Updated By"],
  ["updatedAt", "Updated At"],
] as const);

const slicingCreateFields = [
  ["itemName", "Item Name"],
  ["itemSubCategory", "Item Sub Category"],
  ["color", "Color"],
  ["length", "Length"],
  ["width", "Width"],
  ["height", "Height"],
  ["sqm", "SQM"],
  ["sqf", "SQF"],
  ["amount", "Amount"],
  ["remark", "Remarks"],
] as const;

const slicingAddItemFields = [
  ["itemName", "Item Name"],
  ["itemSubCategory", "Item Sub Category"],
  ["color", "Color"],
  ["thickness", "Thickness"],
  ["noOfLeaves", "No of Leaves"],
  ["grade", "Grade"],
  ["remark", "Remark"],
] as const;

const groupingCreateFields = [
  ["itemSubCategory", "Item Sub Category"],
  ["itemName", "Item Name"],
  ["sqm", "SQM"],
  ["sqf", "SQF"],
  ["amount", "Amount"],
  ["groupingDate", "Grouping Date"],
  ["shift", "Shift"],
  ["workers", "Workers"],
  ["noOfWorkingHours", "No of Working Hours"],
  ["noOfTotalHours", "No of Total Hours"],
] as const;

const groupingAddItemFields = [
  ["length", "Length"],
  ["width", "Width"],
  ["thickness", "Thickness"],
  ["noOfSheets", "No of Sheets"],
  ["sqm", "SQM"],
  ["sqf", "SQF"],
  ["grade", "Grade"],
  ["cut", "Cut"],
  ["remark", "Remark"],
] as const;

const splicingCreateFields = [
  ["issuedFor", "Issued For"],
  ["orderNo", "Order No"],
  ["orderItemNo", "Order Item No"],
  ["itemName", "Item Name"],
  ["itemSubCategory", "Item Sub Category"],
  ["length", "Length"],
  ["width", "Width"],
  ["thickness", "Thickness"],
  ["noOfSheets", "No of Sheets"],
  ["sqm", "SQM"],
  ["sqf", "SQF"],
  ["amount", "Amount"],
  ["remark", "Remark"],
] as const;

const splicingAddItemFields = [
  ["itemSubCategory", "Item Sub Category"],
  ["itemName", "Item Name"],
  ["length", "Length"],
  ["width", "Width"],
  ["thickness", "Thickness"],
  ["noOfSheets", "No of Sheets"],
  ["sqm", "SQM"],
  ["sqf", "SQF"],
  ["remark", "Remark"],
] as const;

const pressingCreateFields = [
  ["pressingDate", "Pressing Date"],
  ["shift", "Shift"],
  ["noOfWorkers", "No of Workers"],
  ["noOfWorkingHours", "No of Working Hours"],
  ["noOfTotalHours", "No of Total Hours"],
] as const;

const pressingAddItemFields = [
  ["productType", "Product Type"],
  ["instructions", "Instructions"],
  ["pressingId", "Pressing Id"],
  ["length", "Length"],
  ["width", "Width"],
  ["baseThickness", "Base Thickness"],
  ["veneerThickness", "Veneer Thickness"],
  ["sqm", "SQM"],
  ["sqf", "SQF"],
  ["amount", "Amount"],
  ["remark", "Remark"],
  ["baseType", "Base Type"],
  ["consumedFrom", "Consumed From"],
  ["consumedLength", "Length"],
  ["consumedWidth", "Width"],
  ["consumedThickness", "Thickness"],
  ["consumedNoOfSheets", "No of Sheets"],
  ["consumeSheets", "Consume Sheets"],
  ["consumedSqm", "SQM"],
  ["consumedSqf", "SQF"],
  ["consumeSqm", "Consume SQM"],
  ["consumeSqf", "Consume SQF"],
  ["consumedAmount", "Amount"],
] as const;

const cncCreateFields = [
  ["issuedFor", "Issued For"],
  ["customerName", "Customer Name"],
  ["orderNo", "Order No"],
  ["itemName", "Item Name"],
  ["length", "Length"],
  ["width", "Width"],
  ["thickness", "Thickness"],
  ["issuedNoOfSheets", "No of Sheets"],
  ["issuedSqm", "SQM"],
  ["issuedSqf", "SQF"],
  ["issueRemark", "Remark"],
  ["cncDate", "CNC Date"],
  ["shift", "Shift"],
  ["workers", "Workers"],
  ["noOfWorkingHours", "No of Working Hours"],
  ["noOfTotalHours", "No of Total Hours"],
  ["outputNoOfSheets", "No of Sheets"],
  ["outputSqm", "SQM"],
  ["outputSqf", "SQF"],
  ["amount", "Amount"],
  ["remark", "Remark"],
] as const;

const finishingCreateFields = [
  ["issuedFor", "Issued For"],
  ["customerName", "Customer Name"],
  ["orderNo", "Order No"],
  ["orderDetails", "Order Details"],
  ["itemName", "Item Name"],
  ["length", "Length"],
  ["width", "Width"],
  ["thickness", "Thickness"],
  ["issuedNoOfSheets", "No of Sheets"],
  ["issuedSqm", "SQM"],
  ["issuedSqf", "SQF"],
  ["issueRemark", "Remarks"],
  ["finishingDate", "Finishing Date"],
  ["shift", "Shift"],
  ["workers", "Workers"],
  ["noOfWorkingHours", "No of Working Hours"],
  ["noOfTotalHours", "No of Total Hours"],
  ["outputNoOfSheets", "No of Sheets"],
  ["outputSqm", "SQM"],
  ["outputSqf", "SQF"],
  ["amount", "Amount"],
  ["remark", "Remark"],
] as const;

const sectionSet = (
  rows: readonly FactoryRecord[],
  createFields: readonly (readonly [key: string, label: string])[],
  addItemFields?: readonly (readonly [key: string, label: string])[],
) => [
  createSection("Create", fields(createFields, rows)),
  ...(addItemFields
    ? [createSection("Add Item", fields(addItemFields, rows))]
    : []),
] as const;

export const slicingDefinition: FactoryDefinition = {
  slug: "slicing",
  title: "Slicing",
  listColumns: slicingListingColumns,
  formSections: sectionSet(slicingRows, slicingCreateFields, slicingAddItemFields),
  rows: expandFactoryRowsForTabs("slicing", slicingRows),
  initialSort: { key: "issuedDate", direction: "desc" },
};

export const dryingDefinition: FactoryDefinition = {
  slug: "drying",
  title: "Drying",
  listColumns: slicingListingColumns,
  formSections: sectionSet(dryingRows, slicingCreateFields, slicingAddItemFields),
  rows: expandFactoryRowsForTabs("drying", dryingRows),
  initialSort: { key: "issuedDate", direction: "desc" },
};

export const groupingDefinition: FactoryDefinition = {
  slug: "grouping",
  title: "Grouping",
  listColumns: productionListingColumns,
  formSections: sectionSet(groupingRows, groupingCreateFields, groupingAddItemFields),
  rows: expandFactoryRowsForTabs("grouping", groupingRows),
  initialSort: { key: "issuedDate", direction: "desc" },
};

export const sampleSheetsDefinition: FactoryDefinition = {
  slug: "sample-sheets",
  title: "Sample Sheets",
  listColumns: productionListingColumns,
  formSections: sectionSet(
    sampleSheetRows,
    groupingCreateFields,
    groupingAddItemFields,
  ),
  rows: expandFactoryRowsForTabs("sample-sheets", sampleSheetRows),
  initialSort: { key: "issuedDate", direction: "desc" },
};

export const splicingDefinition: FactoryDefinition = {
  slug: "splicing",
  title: "Splicing",
  listColumns: splicingListingColumns,
  formSections: sectionSet(splicingRows, splicingCreateFields, splicingAddItemFields),
  rows: expandFactoryRowsForTabs("splicing", splicingRows),
  initialSort: { key: "issuedDate", direction: "desc" },
};

export const pressingDefinition: FactoryDefinition = {
  slug: "pressing",
  title: "Pressing",
  listColumns: productionListingColumns,
  formSections: sectionSet(pressingRows, pressingCreateFields, pressingAddItemFields),
  rows: expandFactoryRowsForTabs("pressing", pressingRows),
  initialSort: { key: "issuedDate", direction: "desc" },
};

export const cncFlutingDefinition: FactoryDefinition = {
  slug: "cnc-fluting",
  title: "CNC / Fluting",
  listColumns: cncListingColumns,
  formSections: sectionSet(cncFlutingRows, cncCreateFields),
  rows: expandFactoryRowsForTabs("cnc-fluting", cncFlutingRows),
  initialSort: { key: "issuedDate", direction: "desc" },
};

export const embossingDefinition: FactoryDefinition = {
  slug: "embossing",
  title: "Embossing",
  listColumns: cncListingColumns,
  formSections: sectionSet(embossingRows, cncCreateFields),
  rows: expandFactoryRowsForTabs("embossing", embossingRows),
  initialSort: { key: "issuedDate", direction: "desc" },
};

export const finishingDefinition: FactoryDefinition = {
  slug: "finishing",
  title: "Finishing",
  listColumns: finishingListingColumns,
  formSections: sectionSet(finishingRows, finishingCreateFields),
  rows: expandFactoryRowsForTabs("finishing", finishingRows),
  initialSort: { key: "issuedDate", direction: "desc" },
};

export const exportOemDefinition: FactoryDefinition = {
  slug: "export-oem",
  title: "Export / OEM",
  listColumns: finishingListingColumns,
  formSections: sectionSet(exportOemRows, finishingCreateFields),
  rows: expandFactoryRowsForTabs("export-oem", exportOemRows),
  initialSort: { key: "issuedDate", direction: "desc" },
};

export const marquetryDefinition: FactoryDefinition = {
  slug: "marquetry",
  title: "Marquetry",
  listColumns: productionListingColumns,
  formSections: sectionSet(marquetryRows, groupingCreateFields, groupingAddItemFields),
  rows: expandFactoryRowsForTabs("marquetry", marquetryRows),
  initialSort: { key: "issuedDate", direction: "desc" },
};
