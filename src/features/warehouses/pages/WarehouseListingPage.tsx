import { useMemo } from "react";
import { Eye, Pencil } from "lucide-react";
import { useNavigate } from "react-router";

import {
  EnterpriseDataTable,
  type EnterpriseTableAction,
} from "../../../components/data-display/EnterpriseDataTable";
import { getInventoryPaths } from "../../inventory/shared";
import { MasterPageShell } from "../../masters/shared";
import {
  warehouseTableConfigs,
  type WarehouseInventoryRow,
  type WarehousePageId,
} from "../shared/warehouseTableData";

interface WarehouseListingPageProps {
  warehouseId: Exclude<WarehousePageId, "warehouse-b">;
}

export function WarehouseListingPage({
  warehouseId,
}: WarehouseListingPageProps) {
  const navigate = useNavigate();
  const config = warehouseTableConfigs[warehouseId];

  const rowActions = useMemo<
    ReadonlyArray<EnterpriseTableAction<WarehouseInventoryRow>>
  >(
    () => [
      {
        id: "view",
        label: "View",
        icon: Eye,
        onSelect: (row) =>
          navigate(
            getInventoryPaths(row.inventorySlug, "issued", warehouseId).view(
              row.inventoryRecordId,
            ),
          ),
      },
      {
        id: "edit",
        label: "Edit",
        icon: Pencil,
        onSelect: (row) =>
          navigate(
            getInventoryPaths(row.inventorySlug, "issued", warehouseId).edit(
              row.inventoryRecordId,
            ),
          ),
      },
    ],
    [navigate, warehouseId],
  );

  return (
    <MasterPageShell
      breadcrumbs={[{ label: config.title }]}
      title={config.title}
    >
      <EnterpriseDataTable
        actions={rowActions}
        columns={config.columns}
        defaultRowsPerPage={10}
        initialSort={{ key: "inwardDate", direction: "desc" }}
        rows={config.rows}
      />
    </MasterPageShell>
  );
}
