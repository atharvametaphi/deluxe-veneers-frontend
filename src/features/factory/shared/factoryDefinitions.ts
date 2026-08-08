import type {
  EnterpriseTableCellValue,
  EnterpriseTableColumn,
} from "../../../components/data-display/EnterpriseDataTable";
import type { MasterFieldDefinition } from "../../masters/shared";
import {
  formatAmount,
  formatMeasurement,
  formatSQM,
  formatSqfFromSqm,
} from "../../shared/numberFormat";
import {
  createFactoryRows,
  createSection,
  expandFactoryRowsForTabs,
  uniqueFactoryOptions,
} from "./factoryUtils";
import {
  commonFactoryItemFieldSpecs,
  withCommonFactoryListingColumns,
} from "./factoryCommonItemFields";
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
    "character",
    "color",
    "consumedFrom",
    "cut",
    "grade",
    "issuedFor",
    "itemName",
    "itemSubCategory",
    "pattern",
    "productType",
    "series",
    "shift",
  ]);

  if (selectKeys.has(key)) {
    return selectField(key, label, rows);
  }

  if (key === "groupNo") {
    return textField(key, label, { readOnly: true });
  }

  return textField(key, label);
};

const columns = (
  specs: readonly (readonly [key: string, label: string])[],
) => specs.map(([key, label]) => column(key, label));

const listingColumns = (
  specs: readonly (readonly [key: string, label: string])[],
) => columns(withCommonFactoryListingColumns(specs));

const fields = (
  specs: readonly (readonly [key: string, label: string])[],
  rows: readonly FactoryRecord[],
) => specs.map(([key, label]) => field(key, label, rows));

const names = [
  "Kunal Kamra",
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

const grades = ["A", "B", "Premium", "Select", "Commercial", "Export"] as const;
const characters = ["Olive", "Curly", "Flaky", "Pomelle"] as const;
const patterns = [
  "Multi Colour",
  "Natural",
  "Quarter Cut",
  "Crown Cut",
] as const;
const seriesValues = ["ACCO", "Reganto", "Marvel", "Canvas"] as const;
const cuts = ["Quarter Cut", "Crown Cut", "Rift Cut", "Natural", "Rotary", "Plain"] as const;
const shifts = ["Day", "Morning", "General", "Evening", "Night", "Second"] as const;

function day(value: number) {
  return asDate(`2026-07-${String(value).padStart(2, "0")}`);
}

function amount(index: number, base = 42000) {
  return formatAmount(base + index * 8250);
}

function toSqf(sqm: string) {
  return formatSqfFromSqm(sqm);
}

function commonRow(index: number, warehouseName: "Warehouse B" | "Warehouse C") {
  const sequence = index + 1;
  const sqm = formatSQM(95.25 + index * 8.4);
  const consumedSqm = formatSQM(54.2 + index * 4.4);
  const consumeSqm = formatSQM(42.1 + index * 3.3);
  const issuedSqm = formatSQM(72.4 + index * 6.2);
  const outputSqm = formatSQM(64.8 + index * 5.8);
  const itemName = itemNames[index % itemNames.length];

  return {
    issuedFrom: warehouseName,
    issuedDate: day(2 + index),
    orderDate: day(1 + index),
    itemName,
    // Same value as itemName — portal shows Item Name only; productName kept for source aliases.
    productName: itemName,
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
      "Fluting",
      "Finishing",
    ][index],
    customerName: customers[index % customers.length],
    orderNo: `ORD-2026-${String(1200 + sequence)}`,
    orderItemNo: `ITEM-${String(sequence).padStart(3, "0")}`,
    logNo: `LOG-${String(3000 + sequence)}`,
    cmt: formatMeasurement(1.18 + index * 0.16),
    noOfSheets: String(18 + index * 2),
    noOfLeaves: String(42 + index * 3),
    cut: cuts[index % cuts.length],
    cutColor: `${cuts[index % cuts.length]} / ${colors[index % colors.length]}`,
    character: characters[index % characters.length],
    pattern: patterns[index % patterns.length],
    series: seriesValues[index % seriesValues.length],
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
    orderDetails: `Order item ${sequence} for ${itemName}`,
  };
}

function factoryRows(
  prefix: string,
  warehouseName: "Warehouse B" | "Warehouse C",
  override?: (row: FactoryRowSeed, index: number) => FactoryRowSeed,
) {
  return createFactoryRows<FactoryRecord>(
    prefix,
    Array.from({ length: 2 }, (_, index) => {
      const row = commonRow(index, warehouseName) as FactoryRowSeed;
      return override ? override(row, index) : row;
    }),
  );
}

const slicingRows = factoryRows("slicing", "Warehouse B", (row, index) => ({
  ...row,
  issuedFor: "Drying",
  // Slicing dimensions are stored/displayed in metres for SQM calculation.
  length: `${(2.44 + index * 0.02).toFixed(2)} m`,
  width: `${(1.22 + index * 0.01).toFixed(2)} m`,
  height: `${(0.004 + index * 0.001).toFixed(3)} m`,
}));

const dryingRows = factoryRows("drying", "Warehouse B", (row) => ({
  ...row,
  issuedFor: "Inspection",
}));

const groupingRows = factoryRows("grouping", "Warehouse C", (row, index) => ({
  ...row,
  issuedFor: "Splicing",
  groupNo: `GRP-2026-${String(index + 1).padStart(4, "0")}`,
}));

const sampleSheetProcessTypes = [
  "Fluting",
  "Embossing",
  "Finishing",
  "Decorative",
  "Marquetry",
  "Fluting",
] as const;

const sampleSheetRows = factoryRows("sample-sheets", "Warehouse C", (row, index) => {
  const sampleProcessType =
    sampleSheetProcessTypes[index % sampleSheetProcessTypes.length]!;

  return {
    ...row,
    issuedFrom: "Grouping",
    issuedFor: "",
    groupNo: `GRP-2026-${String(index + 1).padStart(4, "0")}`,
    sampleProcessType,
    finishType: sampleProcessType,
    purpose: `${sampleProcessType} Sample Sheet`,
  };
});

const withCarriedGroupNo = (row: FactoryRowSeed, index: number) => ({
  ...row,
  groupNo: `GRP-2026-${String(index + 1).padStart(4, "0")}`,
});

const splicingRows = factoryRows("splicing", "Warehouse C", (row, index) => ({
  ...withCarriedGroupNo(row, index),
  issuedFor: ["Marquetry", "Decorative", "Fluted", "Embossed"][
    Number(row.orderItemNo?.toString().replace(/\D/g, "") || "1") % 4
  ],
}));

const pressingRows = factoryRows("pressing", "Warehouse C", (row, index) => ({
  ...withCarriedGroupNo(row, index),
  issuedFor: ["Marquetry", "Decorative", "Fluted", "Embossed"][
    Number(row.orderItemNo?.toString().replace(/\D/g, "") || "1") % 4
  ],
}));

const cncFlutingRows = factoryRows("cnc-fluting", "Warehouse C", (row, index) => ({
  ...withCarriedGroupNo(row, index),
  issuedFor: "Finishing",
}));

const embossingRows = factoryRows("embossing", "Warehouse C", (row, index) => ({
  ...withCarriedGroupNo(row, index),
  issuedFor: "Finishing",
}));

const finishingRows = factoryRows("finishing", "Warehouse C", (row, index) => ({
  ...withCarriedGroupNo(row, index),
  issuedFor: "Packing",
}));

const marquetryRows = factoryRows("marquetry", "Warehouse C", (row, index) => ({
  ...withCarriedGroupNo(row, index),
  issuedFor: "Pressing",
}));

const exportOemRows = factoryRows("export-oem", "Warehouse C", (row) => ({
  ...row,
  issuedFor: "Dispatch",
}));

/** Drying keeps the prior shared column set (not the Slicing field standard). */
const dryingListingColumns = listingColumns([
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

const slicingListingColumns = listingColumns([
  ["issuedFrom", "Issued From"],
  ["issuedDate", "Issued Date"],
  ["itemName", "Item Name"],
  ["itemSubCategory", "Sub Category"],
  ["color", "Color"],
  ["logNo", "Log No."],
  ["length", "Length (m)"],
  ["width", "Width (m)"],
  ["height", "Height (m)"],
  ["noOfLeaves", "No. of Leaves"],
  ["sqm", "SQM"],
  ["sqf", "SQF"],
  ["amount", "Amount"],
  ["remark", "Remark"],
] as const);

const splicingListingColumns = listingColumns([
  ["issuedFor", "Issued For"],
  ["groupNo", "Group No."],
  ["orderDate", "Order Date"],
  ["issuedDate", "Issued Date"],
  ["customerName", "Customer Name"],
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
  ["cut", "Cut"],
  ["color", "Color"],
  ["amount", "Amount"],
  ["remark", "Remark"],
  ["createdBy", "Created By"],
  ["createdAt", "Created At"],
  ["updatedBy", "Updated By"],
  ["updatedAt", "Updated At"],
] as const);

const productionListingColumns = listingColumns([
  ["issuedFrom", "Issued From"],
  ["issuedFor", "Issued For"],
  ["groupNo", "Group No."],
  ["orderDate", "Order Date"],
  ["issuedDate", "Issued Date"],
  ["customerName", "Customer Name"],
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
  ["cutColor", "Cut Color"],
  ["grade", "Grade"],
  ["remark", "Remark"],
  ["createdBy", "Created By"],
  ["createdAt", "Created At"],
  ["updatedBy", "Updated By"],
  ["updatedAt", "Updated At"],
] as const);

/** Grouping is stock/process focused — no order or customer columns. */
const groupingListingColumns = listingColumns([
  ["issuedFrom", "Issued From"],
  ["issuedDate", "Issued Date"],
  ["groupNo", "Group No."],
  ["groupingDate", "Grouping Date"],
  ["itemName", "Item Name"],
  ["itemSubCategory", "Sub Category"],
  ["color", "Color"],
  ["logNo", "Log No."],
  ["character", "Character"],
  ["pattern", "Pattern"],
  ["series", "Series"],
  ["grade", "Grade"],
  ["length", "Length"],
  ["width", "Width"],
  ["height", "Height"],
  ["noOfLeaves", "No. of Leaves"],
  ["sqm", "SQM"],
  ["sqf", "SQF"],
  ["amount", "Amount"],
  ["remark", "Remark"],
  ["createdBy", "Created By"],
  ["createdAt", "Created At"],
  ["updatedBy", "Updated By"],
  ["updatedAt", "Updated At"],
] as const);

const cncListingColumns = listingColumns([
  ["issuedFrom", "Issued From"],
  ["issuedFor", "Issued For"],
  ["groupNo", "Group No."],
  ["orderDate", "Order Date"],
  ["issuedDate", "Issued Date"],
  ["customerName", "Customer Name"],
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
  ["remark", "Remarks"],
  ["createdBy", "Created By"],
  ["createdAt", "Created At"],
  ["updatedBy", "Updated By"],
  ["updatedAt", "Updated At"],
] as const);

const finishingListingColumns = listingColumns([
  ["issuedFrom", "Issued From"],
  ["issuedFor", "Issued For"],
  ["groupNo", "Group No."],
  ["orderDate", "Order Date"],
  ["issuedDate", "Issued Date"],
  ["customerName", "Customer Name"],
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
  ["createdBy", "Created By"],
  ["createdAt", "Created At"],
  ["updatedBy", "Updated By"],
  ["updatedAt", "Updated At"],
] as const);

/** Drying keeps the prior shared create/add-item fields. */
const dryingCreateFields = [
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

const dryingAddItemFields = [
  ["itemName", "Item Name"],
  ["itemSubCategory", "Item Sub Category"],
  ["color", "Color"],
  ["thickness", "Thickness"],
  ["noOfLeaves", "No of Leaves"],
  ["grade", "Grade"],
  ["remark", "Remark"],
] as const;

const slicingProcessDetailFields = [
  ["itemName", "Item Name"],
  ["itemSubCategory", "Sub Category"],
  ["color", "Color"],
  ["logNo", "Log No."],
  ...commonFactoryItemFieldSpecs.map(([key, label]) =>
    key === "length"
      ? (["length", "Length (m)"] as const)
      : key === "width"
        ? (["width", "Width (m)"] as const)
        : key === "height"
          ? (["height", "Height (m)"] as const)
          : ([key, label] as const),
  ),
  ["remark", "Remark"],
] as const;


const slicingDerivedAreaKeys = new Set(["sqm", "sqf"]);

function buildSlicingFormSections(rows: readonly FactoryRecord[]) {
  return [
    createSection(
      "Process Details",
      fields(slicingProcessDetailFields, rows).map((fieldDefinition) =>
        slicingDerivedAreaKeys.has(fieldDefinition.key)
          ? { ...fieldDefinition, readOnly: true }
          : fieldDefinition,
      ),
    ),
  ] as const;
}

const groupingCreateFields = [
  ["groupNo", "Group No."],
  ["groupingDate", "Grouping Date"],
] as const;

const groupingAddItemFields = [
  ...commonFactoryItemFieldSpecs,
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
  ["cncDate", "Fluting Date"],
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
  formSections: buildSlicingFormSections(slicingRows),
  rows: expandFactoryRowsForTabs("slicing", slicingRows),
  initialSort: { key: "issuedDate", direction: "desc" },
};

export const dryingDefinition: FactoryDefinition = {
  slug: "drying",
  title: "Drying",
  listColumns: dryingListingColumns,
  formSections: sectionSet(dryingRows, dryingCreateFields, dryingAddItemFields),
  rows: expandFactoryRowsForTabs("drying", dryingRows),
  initialSort: { key: "issuedDate", direction: "desc" },
};

/** Confirmed Slicing item field keys (listing + process details). */
export const slicingItemTableFieldKeys = [
  "itemName",
  "itemSubCategory",
  "color",
  "logNo",
  "length",
  "width",
  "height",
  "noOfLeaves",
  "sqm",
  "sqf",
  "amount",
  "remark",
] as const;


export const groupingDefinition: FactoryDefinition = {
  slug: "grouping",
  title: "Grouping",
  listColumns: groupingListingColumns,
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
  title: "Fluting",
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
