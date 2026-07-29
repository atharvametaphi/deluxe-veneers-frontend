import {
  getCurrentUser,
  getUserDisplayName,
} from "../../auth";
import type {
  MasterDefinition,
  MasterFieldValue,
  MasterFilterDefinition,
  MasterRecord,
} from "./types";

const LOCAL_MASTER_RECORDS_STORAGE_KEY = "deluxe-veneers-local-master-records";
const LOCAL_MASTER_RECORD_ID_PREFIX = "local-master-record-";

type SerializedMasterRecord = Record<
  string,
  string | boolean | null | undefined
>;

type StoredMasterRecords = Record<string, SerializedMasterRecord[]>;

function getLocalStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function readStoredMasterRecords(): StoredMasterRecords {
  const storage = getLocalStorage();

  if (!storage) {
    return {};
  }

  const rawValue = storage.getItem(LOCAL_MASTER_RECORDS_STORAGE_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(rawValue) as StoredMasterRecords;
    return parsedValue && typeof parsedValue === "object" ? parsedValue : {};
  } catch {
    return {};
  }
}

function writeStoredMasterRecords(records: StoredMasterRecords) {
  const storage = getLocalStorage();

  if (!storage) {
    return;
  }

  storage.setItem(LOCAL_MASTER_RECORDS_STORAGE_KEY, JSON.stringify(records));
}

function serializeMasterRecord(record: MasterRecord): SerializedMasterRecord {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key,
      value instanceof Date ? value.toISOString() : value,
    ]),
  );
}

function parseMasterRecord(record: SerializedMasterRecord): MasterRecord {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => {
      if (
        typeof value === "string" &&
        (key.toLowerCase().includes("date") || key.toLowerCase().endsWith("at"))
      ) {
        const parsedDate = new Date(value);
        return [key, Number.isNaN(parsedDate.getTime()) ? value : parsedDate];
      }

      return [key, value];
    }),
  ) as MasterRecord;
}

function getStoredMasterRows(slug: string) {
  return (readStoredMasterRecords()[slug] ?? []).map(parseMasterRecord);
}

function toTextValue(value: MasterFieldValue) {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (value && typeof value === "object" && "name" in value) {
    return value.name;
  }

  return typeof value === "string" ? value.trim() : "";
}

function getCreatedTime(row: MasterRecord) {
  const value = row.createdDate ?? row.createdAt ?? row.createdEditedDate;

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "string") {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  return 0;
}

function getUniqueFilterOptions(
  rows: ReadonlyArray<MasterRecord>,
  key: string,
) {
  return Array.from(
    new Set(
      rows
        .map((row) => row[key])
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function buildFilterDefinitions(
  filters: readonly MasterFilterDefinition[],
  rows: ReadonlyArray<MasterRecord>,
) {
  return filters.map((filter) => ({
    ...filter,
    options: getUniqueFilterOptions(rows, filter.key),
  }));
}

function buildLocalMasterRecord(
  definition: MasterDefinition,
  values: Record<string, MasterFieldValue>,
  currentRecord?: MasterRecord,
) {
  const currentUser = getCurrentUser();
  const userDisplayName = getUserDisplayName(currentUser);
  const now = new Date();
  const nextRecord: MasterRecord = {
    ...(currentRecord ?? {}),
    id:
      currentRecord?.id ??
      `${LOCAL_MASTER_RECORD_ID_PREFIX}${definition.slug}-${Date.now()}`,
    createdBy: currentRecord?.createdBy ?? userDisplayName,
    editedBy: userDisplayName,
    createdDate: currentRecord?.createdDate ?? now,
    updatedDate: now,
    status:
      typeof currentRecord?.status === "string"
        ? currentRecord.status
        : "Active",
  };

  definition.fields.forEach((field) => {
    nextRecord[field.key] = toTextValue(values[field.key] ?? "");
  });

  return nextRecord;
}

export function buildLocalMasterDefinition(
  definition: MasterDefinition,
): MasterDefinition {
  const rowsById = new Map<string, MasterRecord>();

  definition.rows.forEach((row) => {
    rowsById.set(row.id, row);
  });

  getStoredMasterRows(definition.slug).forEach((row) => {
    rowsById.set(row.id, row);
  });

  const mergedRows = Array.from(rowsById.values())
    .slice()
    .sort((left, right) => getCreatedTime(right) - getCreatedTime(left))
    .map((row, index) => ({
      ...row,
      srNo: String(index + 1),
    }));

  return {
    ...definition,
    rows: mergedRows,
    filters: buildFilterDefinitions(definition.filters, mergedRows),
  };
}

export function createLocalMasterRecord(
  definition: MasterDefinition,
  values: Record<string, MasterFieldValue>,
) {
  const storedRecords = readStoredMasterRecords();
  const nextRecord = buildLocalMasterRecord(definition, values);
  const currentRows = (storedRecords[definition.slug] ?? []).map(parseMasterRecord);
  const nextRows = [...currentRows, nextRecord].map(serializeMasterRecord);

  writeStoredMasterRecords({
    ...storedRecords,
    [definition.slug]: nextRows,
  });

  return nextRecord;
}

export function updateLocalMasterRecord(
  definition: MasterDefinition,
  row: MasterRecord,
  values: Record<string, MasterFieldValue>,
) {
  const storedRecords = readStoredMasterRecords();
  const currentRows = (storedRecords[definition.slug] ?? []).map(parseMasterRecord);

  if (!row.id.startsWith(LOCAL_MASTER_RECORD_ID_PREFIX)) {
    const nextRecord = buildLocalMasterRecord(definition, values, row);
    writeStoredMasterRecords({
      ...storedRecords,
      [definition.slug]: [...currentRows, nextRecord].map(serializeMasterRecord),
    });
    return nextRecord;
  }

  const nextRecord = buildLocalMasterRecord(definition, values, row);
  writeStoredMasterRecords({
    ...storedRecords,
    [definition.slug]: currentRows
      .map((record) => (record.id === row.id ? nextRecord : record))
      .map(serializeMasterRecord),
  });

  return nextRecord;
}
