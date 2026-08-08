import { useSyncExternalStore } from "react";

import type { FactoryRecord } from "./types";

const STORAGE_KEY = "deluxe-veneers-grouped-stock-sample-issues";

export type GroupedStockSampleIssue = {
  createdAt: string;
  groupingRowId: string;
  id: string;
  issueDate: string;
  issueSheets: number;
  sourceSnapshot: Record<string, unknown>;
};

type GroupedStockIssueStore = {
  issues: GroupedStockSampleIssue[];
};

let memoryStore: GroupedStockIssueStore | null = null;
const listeners = new Set<() => void>();

function getLocalStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function readStore(): GroupedStockIssueStore {
  if (memoryStore) {
    return memoryStore;
  }

  const storage = getLocalStorage();
  if (!storage) {
    memoryStore = { issues: [] };
    return memoryStore;
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    memoryStore = { issues: [] };
    return memoryStore;
  }

  try {
    const parsed = JSON.parse(raw) as GroupedStockIssueStore;
    memoryStore =
      parsed && Array.isArray(parsed.issues)
        ? { issues: parsed.issues }
        : { issues: [] };
  } catch {
    memoryStore = { issues: [] };
  }

  return memoryStore;
}

function writeStore(next: GroupedStockIssueStore) {
  memoryStore = next;
  const storage = getLocalStorage();
  if (storage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return readStore();
}

export function getGroupedStockSampleIssues() {
  return [...readStore().issues];
}

export function getGroupedStockIssuesForRow(groupingRowId: string) {
  return getGroupedStockSampleIssues().filter(
    (issue) => issue.groupingRowId === groupingRowId,
  );
}

export function getIssuedGroupedSheetsTotal(groupingRowId: string) {
  return getGroupedStockIssuesForRow(groupingRowId).reduce(
    (total, issue) => total + issue.issueSheets,
    0,
  );
}

export function getOriginalGroupedSheets(row: FactoryRecord) {
  const value = getFactoryRowSheetValue(row, [
    "originalSheets",
    "totalNoOfSheets",
    "noOfSheets",
    "outputNoOfSheets",
    "issuedNoOfSheets",
  ]);

  return value;
}

export function getAvailableGroupedSheets(row: FactoryRecord) {
  const original = getOriginalGroupedSheets(row);
  const issued = getIssuedGroupedSheetsTotal(String(row.id));
  return Math.max(0, original - issued);
}

export function appendGroupedStockSampleIssue(input: {
  groupingRowId: string;
  issueDate: Date | null;
  issueSheets: number;
  sourceRow: FactoryRecord;
}): GroupedStockSampleIssue {
  const store = readStore();
  const issueDate =
    input.issueDate instanceof Date
      ? input.issueDate.toISOString()
      : new Date().toISOString();

  const nextIssue: GroupedStockSampleIssue = {
    id: `grouped-sample-issue-${Date.now()}-${store.issues.length + 1}`,
    groupingRowId: input.groupingRowId,
    issueSheets: input.issueSheets,
    issueDate,
    createdAt: new Date().toISOString(),
    sourceSnapshot: { ...input.sourceRow },
  };

  writeStore({
    issues: [nextIssue, ...store.issues],
  });

  return nextIssue;
}

export function buildSampleSheetSourceRowFromIssue(
  issue: GroupedStockSampleIssue,
): FactoryRecord {
  const snapshot = issue.sourceSnapshot;
  const sheets = String(issue.issueSheets);

  return {
    ...snapshot,
    id: String(snapshot.id ?? issue.groupingRowId),
    noOfSheets: sheets,
    sampleSheets: sheets,
    issuedNoOfSheets: sheets,
    availableSheets: sheets,
    issuedDate: new Date(issue.issueDate),
    sampleDate: new Date(issue.issueDate),
    groupingDate:
      snapshot.groupingDate instanceof Date
        ? snapshot.groupingDate
        : typeof snapshot.groupingDate === "string"
          ? new Date(snapshot.groupingDate)
          : snapshot.groupingDate,
    issuedFrom: "Grouping",
    issuedFor: typeof snapshot.issuedFor === "string" ? snapshot.issuedFor : "",
    remark:
      typeof snapshot.remark === "string"
        ? snapshot.remark
        : `Issued from grouped stock (${issue.issueSheets} sheets)`,
  } as FactoryRecord;
}

export function useGroupedStockSampleIssues() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return [...store.issues];
}

function getFactoryRowSheetValue(row: FactoryRecord, keys: readonly string[]) {
  for (const key of keys) {
    const raw = row[key];
    if (typeof raw === "number" && Number.isFinite(raw)) {
      return Math.max(0, Math.floor(raw));
    }

    if (typeof raw === "string" && raw.trim()) {
      const parsed = Number(raw.replace(/[^\d.]/g, ""));
      if (Number.isFinite(parsed)) {
        return Math.max(0, Math.floor(parsed));
      }
    }
  }

  return 0;
}
