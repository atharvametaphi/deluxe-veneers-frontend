import type {
  MasterDefinition,
  MasterFieldDefinition,
  MasterFieldValue,
  MasterRecord,
} from "./types";

function toDateDisplay(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

export function createMasterRows(
  prefix: string,
  rows: ReadonlyArray<Omit<MasterRecord, "id"> & Partial<Pick<MasterRecord, "id">>>,
) {
  return rows.map((row, index) => ({
    id: row.id ?? `${prefix}-${index + 1}`,
    srNo: String(index + 1),
    ...row,
  }));
}

export function formatMasterValue(value: MasterRecord[string]) {
  if (value instanceof Date) {
    return toDateDisplay(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (value === null || typeof value === "undefined") {
    return "";
  }

  return String(value);
}

export function normalizeMasterSortValue(value: MasterRecord[string]) {
  if (value instanceof Date) {
    return value.getTime();
  }

  const textValue = formatMasterValue(value);
  const parsedDate = Date.parse(textValue);

  if (!Number.isNaN(parsedDate) && /[A-Za-z]{3}|\d{4}/.test(textValue)) {
    return parsedDate;
  }

  const numericCandidate = textValue.replace(/[^0-9.-]/g, "");

  if (numericCandidate && !Number.isNaN(Number(numericCandidate))) {
    return Number(numericCandidate);
  }

  return textValue.toLowerCase();
}

export function buildMasterInitialValues(
  definition: Pick<MasterDefinition, "fields">,
  row?: MasterRecord,
) {
  return definition.fields.reduce<Record<string, MasterFieldValue>>(
    (accumulator, field) => {
      accumulator[field.key] = getDefaultFieldValue(field, row?.[field.key]);
      return accumulator;
    },
    {},
  );
}

function getDefaultFieldValue(
  field: MasterFieldDefinition,
  value: MasterRecord[string],
) {
  if (field.type === "date") {
    return value instanceof Date ? value : null;
  }

  if (field.type === "checkbox" || field.type === "toggle") {
    return typeof value === "boolean" ? value : false;
  }

  return typeof value === "string" ? value : "";
}

export function getMasterPaths(slug: string) {
  return {
    list: `/masters/${slug}`,
    add: `/masters/${slug}/add`,
    edit: (id: string) => `/masters/${slug}/edit/${id}`,
    view: (id: string) => `/masters/${slug}/view/${id}`,
  };
}

export function getMasterPageTitle(
  definition: MasterDefinition,
  mode: "list" | "add" | "edit" | "view",
) {
  if (mode === "list") {
    return definition.title;
  }

  const verb =
    mode === "add" ? "Add" : mode === "edit" ? "Edit" : "View";

  return `${verb} ${definition.title}`;
}
