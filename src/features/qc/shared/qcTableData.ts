import {
  warehouseAInventoryConfigs,
  type WarehouseInventoryRow,
  type WarehouseInventorySlug,
} from "../../warehouses/shared/warehouseTableData";

export type QcStage = "pending" | "done";

type QcInventoryConfig = {
  columns: readonly { key: keyof WarehouseInventoryRow & string; label: string }[];
  rows: readonly WarehouseInventoryRow[];
  title: string;
};

export const qcStageTitles: Record<QcStage, string> = {
  pending: "QC Pending",
  done: "QC Done",
};

export const qcInventoryTabs = [
  { label: "Veneer Blocks", value: "veneer-blocks" },
  { label: "Raw Veneer", value: "raw-veneer" },
  { label: "Plywood", value: "plywood" },
  { label: "MDF", value: "mdf" },
] as const satisfies readonly {
  label: string;
  value: WarehouseInventorySlug;
}[];

export const qcTableConfigs: Record<
  QcStage,
  Record<WarehouseInventorySlug, QcInventoryConfig>
> = {
  pending: {
    "veneer-blocks": {
      title: "Veneer Blocks",
      columns: warehouseAInventoryConfigs["veneer-blocks"].columns,
      rows: cloneRows(
        takeRows(warehouseAInventoryConfigs["veneer-blocks"].rows, 0, 10),
        "QC Pending",
      ),
    },
    "raw-veneer": {
      title: "Raw Veneer",
      columns: warehouseAInventoryConfigs["raw-veneer"].columns,
      rows: cloneRows(
        preferRows(
          warehouseAInventoryConfigs["raw-veneer"].rows.filter(
            (row) => row.status !== "QC Done",
          ),
          warehouseAInventoryConfigs["raw-veneer"].rows,
        ),
        "QC Pending",
      ),
    },
    plywood: {
      title: "Plywood",
      columns: warehouseAInventoryConfigs.plywood.columns,
      rows: cloneRows(
        takeRows(warehouseAInventoryConfigs.plywood.rows, 0, 10),
        "QC Pending",
      ),
    },
    mdf: {
      title: "MDF",
      columns: warehouseAInventoryConfigs.mdf.columns,
      rows: cloneRows(
        takeRows(warehouseAInventoryConfigs.mdf.rows, 0, 10),
        "QC Pending",
      ),
    },
  },
  done: {
    "veneer-blocks": {
      title: "Veneer Blocks",
      columns: warehouseAInventoryConfigs["veneer-blocks"].columns,
      rows: cloneRows(
        takeRows(warehouseAInventoryConfigs["veneer-blocks"].rows, 10, 20),
        "QC Done",
      ),
    },
    "raw-veneer": {
      title: "Raw Veneer",
      columns: warehouseAInventoryConfigs["raw-veneer"].columns,
      rows: cloneRows(
        preferRows(
          warehouseAInventoryConfigs["raw-veneer"].rows.filter(
            (row) => row.status === "QC Done",
          ),
          warehouseAInventoryConfigs["raw-veneer"].rows,
          10,
          20,
        ),
        "QC Done",
      ),
    },
    plywood: {
      title: "Plywood",
      columns: warehouseAInventoryConfigs.plywood.columns,
      rows: cloneRows(
        takeRows(warehouseAInventoryConfigs.plywood.rows, 10, 20),
        "QC Done",
      ),
    },
    mdf: {
      title: "MDF",
      columns: warehouseAInventoryConfigs.mdf.columns,
      rows: cloneRows(
        takeRows(warehouseAInventoryConfigs.mdf.rows, 10, 20),
        "QC Done",
      ),
    },
  },
};

function takeRows(
  rows: readonly WarehouseInventoryRow[],
  start: number,
  end: number,
) {
  const windowedRows = rows.slice(start, end);

  return windowedRows.length > 0 ? windowedRows : rows.slice(0, 10);
}

function preferRows(
  preferredRows: readonly WarehouseInventoryRow[],
  fallbackRows: readonly WarehouseInventoryRow[],
  start = 0,
  end = 10,
) {
  const windowedRows = preferredRows.slice(start, end);

  if (windowedRows.length > 0) {
    return windowedRows;
  }

  return fallbackRows.slice(0, 10);
}

function cloneRows(
  rows: readonly WarehouseInventoryRow[],
  status: "QC Pending" | "QC Done",
) {
  return rows.map((row) => ({
    ...row,
    status,
  }));
}
