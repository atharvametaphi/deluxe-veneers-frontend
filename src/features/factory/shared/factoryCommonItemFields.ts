import type { MasterFieldDefinition, MasterRecord } from "../../masters/shared";
import {
  getItemMasterRecord,
  itemMasterOptions,
} from "../../masters/shared/masterDefinitions";
import {
  formatSQF,
  formatSQM,
  SQM_TO_SQF,
} from "../../shared/numberFormat";
import {
  applySlicingDerivedAreas,
  calculateSlicingSqmValue,
} from "./slicingAreaCalculation";

/**
 * Canonical Factory item structure shared by Create / Edit / View / listings.
 * Order is intentional and must stay stable across modules.
 */
export const commonFactoryItemFieldSpecs = [
  ["itemName", "Item Name"],
  ["itemSubCategory", "Sub Category"],
  ["color", "Color"],
  ["logNo", "Log No."],
  ["grade", "Grade"],
  ["length", "Length"],
  ["width", "Width"],
  ["height", "Height"],
  ["noOfLeaves", "No. of Leaves"],
  ["sqm", "SQM"],
  ["sqf", "SQF"],
  ["amount", "Amount"],
  ["remark", "Remark"],
] as const;

export const commonFactoryItemFieldKeys = commonFactoryItemFieldSpecs.map(
  ([key]) => key,
);

export const commonFactoryItemFieldKeySet = new Set<string>(
  commonFactoryItemFieldKeys,
);

const gradeOptions = ["A", "B", "C", "Premium", "Select", "Commercial", "Export"] as const;

const derivedAreaInputKeys = new Set(["length", "width", "noOfLeaves"]);

/** Inventory / source aliases used when prefilling common factory item fields. */
export const commonFactoryItemFieldAliases: Record<string, readonly string[]> = {
  itemName: ["itemName", "productName"],
  itemSubCategory: ["itemSubCategory", "subCategory"],
  color: ["color", "colour", "processColour"],
  logNo: ["logNo", "logCode"],
  grade: ["grade"],
  length: ["length"],
  width: ["width"],
  height: ["height", "thickness", "thickess"],
  noOfLeaves: [
    "noOfLeaves",
    "noOfLeavesSheets",
    "issuedLeaves",
    "noOfSheets",
    "availableSheets",
    "totalNoOfSheets",
    "availableUnits",
    "totalUnits",
    "outputNoOfSheets",
    "issuedNoOfSheets",
  ],
  sqm: [
    "sqm",
    "totalSqm",
    "availableSqm",
    "avSqm",
    "issuedSqm",
    "outputSqm",
    "consumedSqm",
    "consumeSqm",
    "finishedSqm",
  ],
  sqf: [
    "sqf",
    "totalSqf",
    "availableSqf",
    "avSqf",
    "issuedSqf",
    "outputSqf",
    "consumedSqf",
    "consumeSqf",
    "finishedSqf",
  ],
  amount: ["amount"],
  remark: ["remark", "issueRemark"],
};

export function getCommonFactoryItemFieldDefinitions(options?: {
  itemNameOptions?: readonly string[];
  /** When true, SQM/SQF stay read-only (auto-calculated / source-driven). */
  areaReadOnly?: boolean;
}): MasterFieldDefinition[] {
  const areaReadOnly = options?.areaReadOnly ?? true;
  const nameOptions = options?.itemNameOptions ?? itemMasterOptions;

  return commonFactoryItemFieldSpecs.map(([key, label]) => {
    if (key === "itemName") {
      return {
        key,
        label,
        type: "select",
        options: [...nameOptions],
      };
    }

    if (key === "grade") {
      return {
        key,
        label,
        type: "select",
        options: [...gradeOptions],
      };
    }

    return {
      key,
      label,
      type: "text",
      ...(key === "sqm" || key === "sqf"
        ? { readOnly: areaReadOnly }
        : {}),
    };
  });
}

/**
 * Ensure Process Details include the full common item structure first,
 * then append any process-specific columns (without dropping them).
 */
export function mergeCommonFactoryItemFields(
  fields: readonly MasterFieldDefinition[],
): MasterFieldDefinition[] {
  const commonFields = getCommonFactoryItemFieldDefinitions();
  const byKey = new Map<string, MasterFieldDefinition>();

  for (const field of commonFields) {
    byKey.set(field.key, field);
  }

  for (const field of fields) {
    // Prefer richer process field when it already exists, but keep common label/order.
    const existing = byKey.get(field.key);
    if (!existing) {
      byKey.set(normalizeCommonFieldKey(field.key), {
        ...field,
        key: normalizeCommonFieldKey(field.key),
        label:
          field.key === "processColour" || field.key === "colour"
            ? "Color"
            : field.key === "itemSubCategory"
              ? "Sub Category"
              : field.label,
      });
      continue;
    }

    const mergedField: MasterFieldDefinition = {
      ...existing,
      ...field,
      key: existing.key,
      label: existing.label,
    };

    const mergedOptions = field.options?.length ? field.options : existing.options;
    if (mergedOptions?.length) {
      mergedField.options = mergedOptions;
    }

    const mergedReadOnly =
      field.key === "sqm" || field.key === "sqf"
        ? existing.readOnly
        : field.readOnly ?? existing.readOnly;
    if (mergedReadOnly !== undefined) {
      mergedField.readOnly = mergedReadOnly;
    }

    byKey.set(field.key, mergedField);
  }

  // Map legacy colour / thickness into the common keys when only legacy exists.
  if (!byKey.has("color") && byKey.has("processColour")) {
    const colourField = byKey.get("processColour")!;
    byKey.set("color", { ...colourField, key: "color", label: "Color" });
  }
  if (!byKey.has("height") && byKey.has("thickness")) {
    const thicknessField = byKey.get("thickness")!;
    byKey.set("height", { ...thicknessField, key: "height", label: "Height" });
  }

  const ordered: MasterFieldDefinition[] = [];
  const seen = new Set<string>();

  const pushKey = (key: string) => {
    const field = byKey.get(key);
    if (!field || seen.has(key)) {
      return;
    }
    ordered.push(field);
    seen.add(key);
  };

  for (const [key] of commonFactoryItemFieldSpecs) {
    pushKey(key);
  }

  for (const field of fields) {
    const key = normalizeCommonFieldKey(field.key);
    if (key === "processColour" || key === "colour" || key === "thickness") {
      // Represented by color / height in the common block.
      continue;
    }
    pushKey(key);
  }

  return ordered;
}

function normalizeCommonFieldKey(key: string) {
  if (key === "processColour" || key === "colour") {
    return "color";
  }
  if (key === "thickess") {
    return "height";
  }
  return key;
}

/**
 * Insert missing common item columns into a listing column spec list.
 * Existing keys/labels are preserved.
 */
export function withCommonFactoryListingColumns(
  specs: readonly (readonly [string, string])[],
): (readonly [string, string])[] {
  const result: (readonly [string, string])[] = specs.map(
    (spec) => [...spec] as [string, string],
  );
  const keys = new Set(result.map(([key]) => key));

  let insertAt = result.findIndex(
    ([key]) => key === "remark" || key === "Remarks",
  );
  if (insertAt < 0) {
    insertAt = result.findIndex(([key]) => key === "createdBy");
  }
  if (insertAt < 0) {
    insertAt = result.length;
  }

  for (const spec of commonFactoryItemFieldSpecs) {
    if (keys.has(spec[0])) {
      continue;
    }

    result.splice(insertAt, 0, spec);
    insertAt += 1;
    keys.add(spec[0]);
  }

  return result;
}

/**
 * Apply Item Master metadata for empty fields only (source values win).
 */
export function applyFactoryItemMasterDefaults(
  values: Record<string, string>,
  itemName: string,
): Record<string, string> {
  const item = getItemMasterRecord(itemName);
  if (!item) {
    return values;
  }

  const nextValues = { ...values };
  fillIfEmpty(nextValues, "itemSubCategory", masterString(item, "subCategory"));
  fillIfEmpty(nextValues, "color", masterString(item, "color"));
  fillIfEmpty(nextValues, "grade", masterString(item, "grade"));
  fillIfEmpty(nextValues, "remark", masterString(item, "remark"));

  return nextValues;
}

function masterString(item: MasterRecord, key: string) {
  const value = item[key];
  return typeof value === "string" ? value.trim() : "";
}

function fillIfEmpty(
  values: Record<string, string>,
  key: string,
  nextValue: string,
) {
  if (!nextValue) {
    return;
  }
  if ((values[key] ?? "").trim().length > 0) {
    return;
  }
  values[key] = nextValue;
}

/**
 * Prefer source values; never overwrite a non-empty source with blanks.
 * Then fill remaining blanks from Item Master when Item Name is known.
 */
export function buildFactoryItemPrefillValues(
  fields: readonly MasterFieldDefinition[],
  sourceRow: Record<string, unknown> | undefined,
  getPreferredValue: (key: string) => string,
) {
  const blankOnPrefillKeys = new Set([
    "noOfBundle",
    "consumeSheets",
    "consumedNoOfSheets",
    "issuedNoOfSheets",
    "outputNoOfSheets",
    "sampleSheets",
    "finishedSheets",
  ]);

  const values = fields.reduce<Record<string, string>>((accumulator, field) => {
    if (blankOnPrefillKeys.has(field.key)) {
      accumulator[field.key] = "";
      return accumulator;
    }

    // Keep remark blank for operator notes on new process runs unless source has one.
    if (field.key === "remark") {
      const remark = getPreferredValue("remark");
      accumulator.remark = remark;
      return accumulator;
    }

    accumulator[field.key] = getPreferredValue(field.key);
    return accumulator;
  }, {});

  // Ensure height is filled from thickness when height alias missed.
  if (!(values.height ?? "").trim() && sourceRow) {
    const thickness = getPreferredValue("height");
    if (thickness) {
      values.height = thickness;
    }
  }

  const itemName = (values.itemName ?? "").trim();
  if (itemName) {
    return applyFactoryItemMasterDefaults(values, itemName);
  }

  return values;
}

export function applyFactoryLineItemValueChange(
  values: Record<string, string>,
  key: string,
  value: string,
): Record<string, string> {
  let nextValues = {
    ...values,
    [key]: value,
  };

  if (key === "itemName") {
    nextValues = applyFactoryItemMasterDefaults(nextValues, value);
  }

  if (derivedAreaInputKeys.has(key)) {
    const derivedSqm = calculateSlicingSqmValue(
      nextValues.length,
      nextValues.width,
      nextValues.noOfLeaves,
    );
    if (derivedSqm > 0) {
      nextValues = applySlicingDerivedAreas(nextValues);
    }
    return nextValues;
  }

  const conversionPair = (
    [
      ["sqm", "sqf"],
      ["consumedSqm", "consumedSqf"],
      ["consumeSqm", "consumeSqf"],
      ["issuedSqm", "issuedSqf"],
      ["outputSqm", "outputSqf"],
    ] as const
  ).find(([sqmKey, sqfKey]) => key === sqmKey || key === sqfKey);

  if (!conversionPair) {
    return nextValues;
  }

  const numericValue = Number.parseFloat(value);
  if (!Number.isFinite(numericValue)) {
    return nextValues;
  }

  const [sqmKey, sqfKey] = conversionPair;
  if (key === sqmKey) {
    nextValues[sqfKey] = formatSQF(numericValue * SQM_TO_SQF);
  } else {
    nextValues[sqmKey] = formatSQM(numericValue / SQM_TO_SQF);
  }

  return nextValues;
}
