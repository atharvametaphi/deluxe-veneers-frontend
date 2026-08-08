import { useSyncExternalStore } from "react";

import type { FactoryProcessTab } from "./factoryUtils";
import type { FactoryRecord } from "./types";

const STORAGE_KEY = "deluxe-veneers-factory-issued-work";

export type FactoryWorkPurpose = "ORDER" | "SAMPLE";

export type FactoryIssuedWorkRecord = {
  completedAt?: string;
  createdAt: string;
  destinationSlug: string;
  id: string;
  listingState: "issued" | "done";
  orderItemNo?: string;
  orderNo?: string;
  purpose: FactoryWorkPurpose;
  sampleNo?: string;
  sourceRowId: string;
  sourceSlug: string;
  sourceSnapshot: Record<string, unknown>;
};

type FactoryIssuedWorkStore = {
  items: FactoryIssuedWorkRecord[];
};

const processLabelToSlug: Record<string, string> = {
  Drying: "drying",
  Embossing: "embossing",
  Finishing: "finishing",
  Fluting: "cnc-fluting",
  Grouping: "grouping",
  Marquetry: "marquetry",
  Pressing: "pressing",
  Splicing: "splicing",
  "CNC / Fluting": "cnc-fluting",
  "CNC/Fluting": "cnc-fluting",
};

const slugToProcessLabel: Record<string, string> = {
  drying: "Drying",
  embossing: "Embossing",
  finishing: "Finishing",
  "cnc-fluting": "Fluting",
  grouping: "Grouping",
  marquetry: "Marquetry",
  pressing: "Pressing",
  splicing: "Splicing",
};

let memoryStore: FactoryIssuedWorkStore | null = null;
const listeners = new Set<() => void>();

function getLocalStorage() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
}

function readStore(): FactoryIssuedWorkStore {
  if (memoryStore) {
    return memoryStore;
  }

  const storage = getLocalStorage();
  if (!storage) {
    memoryStore = { items: [] };
    return memoryStore;
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    memoryStore = { items: [] };
    return memoryStore;
  }

  try {
    const parsed = JSON.parse(raw) as FactoryIssuedWorkStore;
    memoryStore =
      parsed && Array.isArray(parsed.items) ? { items: parsed.items } : { items: [] };
  } catch {
    memoryStore = { items: [] };
  }

  return memoryStore;
}

function writeStore(next: FactoryIssuedWorkStore) {
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

export function resolveFactoryProcessSlug(processOrSlug: string) {
  if (processOrSlug in slugToProcessLabel) {
    return processOrSlug;
  }
  return processLabelToSlug[processOrSlug] ?? processOrSlug.toLowerCase();
}

export function resolveFactoryProcessLabel(slugOrProcess: string) {
  if (slugOrProcess in processLabelToSlug) {
    return slugOrProcess;
  }
  return slugToProcessLabel[slugOrProcess] ?? slugOrProcess;
}

export function getFactoryListPathForProcess(processOrSlug: string) {
  const slug = resolveFactoryProcessSlug(processOrSlug);
  if (slug === "packing") {
    return "/packing";
  }
  return `/factory/${slug}`;
}

export function getFactoryIssuedWorkItems() {
  return [...readStore().items];
}

export function getFactoryIssuedWorkById(id: string) {
  return readStore().items.find((item) => item.id === id) ?? null;
}

export function useFactoryIssuedWorkItems() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return [...store.items];
}

export function issueFactoryWork(input: {
  destinationProcess: string;
  orderItemNo?: string;
  orderNo?: string;
  purpose?: FactoryWorkPurpose;
  sampleNo?: string;
  sourceRow: FactoryRecord;
  sourceSlug: string;
}): FactoryIssuedWorkRecord {
  const store = readStore();
  const destinationSlug = resolveFactoryProcessSlug(input.destinationProcess);
  const purpose: FactoryWorkPurpose =
    input.purpose ??
    (input.sampleNo ||
    input.sourceRow.purpose === "SAMPLE" ||
    input.sourceRow.for === "Sample" ||
    input.sourceRow.forLabel === "Sample"
      ? "SAMPLE"
      : "ORDER");

  const nextItem: FactoryIssuedWorkRecord = {
    id: `factory-work-${Date.now()}-${store.items.length + 1}`,
    destinationSlug,
    listingState: "issued",
    sourceSlug: input.sourceSlug,
    sourceRowId: String(input.sourceRow.id),
    purpose,
    sourceSnapshot: { ...input.sourceRow },
    createdAt: new Date().toISOString(),
    ...(input.sampleNo ? { sampleNo: input.sampleNo } : {}),
    ...(input.orderNo ? { orderNo: input.orderNo } : {}),
    ...(input.orderItemNo ? { orderItemNo: input.orderItemNo } : {}),
  };

  writeStore({
    items: [nextItem, ...store.items],
  });

  return nextItem;
}

export function completeFactoryIssuedWork(
  workItemId: string,
  resultSnapshot?: Record<string, unknown>,
) {
  const store = readStore();
  const index = store.items.findIndex((item) => item.id === workItemId);
  if (index < 0) {
    return null;
  }

  const current = store.items[index]!;
  const nextItem: FactoryIssuedWorkRecord = {
    ...current,
    listingState: "done",
    completedAt: new Date().toISOString(),
    sourceSnapshot: resultSnapshot
      ? { ...current.sourceSnapshot, ...resultSnapshot }
      : current.sourceSnapshot,
  };
  const items = [...store.items];
  items[index] = nextItem;
  writeStore({ items });
  return nextItem;
}

export function getFactoryIssuedWorkForListing(
  destinationSlug: string,
  tab: FactoryProcessTab,
) {
  if (tab !== "issued" && tab !== "done") {
    return [] as FactoryIssuedWorkRecord[];
  }

  return getFactoryIssuedWorkItems().filter(
    (item) =>
      item.destinationSlug === destinationSlug && item.listingState === tab,
  );
}

export function factoryIssuedWorkToRow(
  item: FactoryIssuedWorkRecord,
): FactoryRecord {
  const processLabel = resolveFactoryProcessLabel(item.destinationSlug);
  const snapshot = item.sourceSnapshot;
  const isSample = item.purpose === "SAMPLE";

  return {
    ...snapshot,
    id: item.id,
    workItemId: item.id,
    listingState: item.listingState,
    issuedFrom: resolveFactoryProcessLabel(item.sourceSlug),
    issuedFor: processLabel,
    issuedDate: new Date(item.createdAt),
    purpose: isSample ? "SAMPLE" : "ORDER",
    for: isSample ? "Sample" : "Order",
    forLabel: isSample ? "Sample" : "Order",
    ...(item.sampleNo
      ? {
          sampleNo: item.sampleNo,
          customerName: item.sampleNo,
          orderNo: item.sampleNo,
          isSample: true,
        }
      : {}),
    ...(item.orderNo ? { orderNo: item.orderNo } : {}),
    ...(item.orderItemNo ? { orderItemNo: item.orderItemNo } : {}),
    remark:
      typeof snapshot.remark === "string" && snapshot.remark.trim()
        ? snapshot.remark
        : isSample
          ? `Sample ${item.sampleNo ?? ""}`.trim()
          : typeof snapshot.orderNo === "string"
            ? `Order ${snapshot.orderNo}`
            : "",
  } as FactoryRecord;
}
