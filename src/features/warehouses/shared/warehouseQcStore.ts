export type WarehouseQcStatus = "pending" | "done";

const warehouseQcStatusStorageKey = "deluxe-veneers-warehouse-qc-statuses";
const warehouseQcStatusChangedEvent = "deluxe-veneers-warehouse-qc-status-changed";

type WarehouseQcRow = {
  id: string;
  inventoryRecordId?: string;
  qcStatus?: string;
  status?: string;
};

type WarehouseQcStatusMap = Record<string, WarehouseQcStatus>;

export function getWarehouseQcStatus(row: WarehouseQcRow): WarehouseQcStatus {
  const statusMap = getWarehouseQcStatusMap();
  const storedStatus =
    statusMap[row.id] ??
    (row.inventoryRecordId ? statusMap[row.inventoryRecordId] : undefined);

  if (storedStatus) {
    return storedStatus;
  }

  const normalizedQcStatus = normalizeWarehouseQcStatus(row.qcStatus);

  if (normalizedQcStatus) {
    return normalizedQcStatus;
  }

  const normalizedStatus = normalizeWarehouseQcStatus(row.status);
  return normalizedStatus ?? "pending";
}

export function markWarehouseQcDone(row: WarehouseQcRow | string) {
  const rowId = typeof row === "string" ? row : row.id;
  const inventoryRecordId =
    typeof row === "string" ? undefined : row.inventoryRecordId;
  const nextStatusMap = {
    ...getWarehouseQcStatusMap(),
    [rowId]: "done" as const,
  };

  if (inventoryRecordId) {
    nextStatusMap[inventoryRecordId] = "done";
  }

  updateWarehouseQcStatusMap(nextStatusMap);
}

export function resolveWarehouseQcRows<Row extends WarehouseQcRow>(
  rows: readonly Row[],
) {
  return rows.map((row) => ({
    ...row,
    qcStatus: getWarehouseQcStatus(row),
  }));
}

export function getWarehouseQcDoneRows<Row extends WarehouseQcRow>(
  rows: readonly Row[],
) {
  return resolveWarehouseQcRows(rows).filter(
    (row) => row.qcStatus === "done",
  );
}

export function subscribeWarehouseQcStatusUpdates(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(warehouseQcStatusChangedEvent, listener);

  return () => {
    window.removeEventListener(warehouseQcStatusChangedEvent, listener);
  };
}

function normalizeWarehouseQcStatus(
  value: string | undefined,
): WarehouseQcStatus | null {
  const normalizedValue = value?.trim().toLowerCase();

  if (!normalizedValue) {
    return null;
  }

  if (normalizedValue === "done" || normalizedValue === "qc done") {
    return "done";
  }

  if (
    normalizedValue === "pending" ||
    normalizedValue === "qc pending" ||
    normalizedValue === "pending review" ||
    normalizedValue === "on hold" ||
    normalizedValue === "qc hold"
  ) {
    return "pending";
  }

  return null;
}

function getWarehouseQcStatusMap(): WarehouseQcStatusMap {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(warehouseQcStatusStorageKey);

    if (!rawValue) {
      return {};
    }

    return JSON.parse(rawValue) as WarehouseQcStatusMap;
  } catch {
    return {};
  }
}

function updateWarehouseQcStatusMap(statusMap: WarehouseQcStatusMap) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    warehouseQcStatusStorageKey,
    JSON.stringify(statusMap),
  );
  window.dispatchEvent(new CustomEvent(warehouseQcStatusChangedEvent));
}
