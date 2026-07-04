import { useMemo } from "react";
import { Eye, Pencil } from "lucide-react";
import { Stack } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router";

import {
  EnterpriseDataTable,
  type EnterpriseTableAction,
} from "../../../components/data-display/EnterpriseDataTable";
import { ModuleProcessTabs } from "../../../components/navigation/ModuleProcessTabs";
import { getInventoryPaths } from "../../inventory/shared";
import { MasterPageShell } from "../../masters/shared";
import {
  warehouseCInventoryConfigs,
  type WarehouseInventoryRow,
  type WarehouseInventorySlug,
} from "../shared/warehouseTableData";

const warehouseCTabs = [
  { label: "Veneer Blocks", value: "veneer-blocks" },
  { label: "Raw Veneer", value: "raw-veneer" },
  { label: "Plywood", value: "plywood" },
  { label: "MDF", value: "mdf" },
] as const satisfies readonly {
  label: string;
  value: WarehouseInventorySlug;
}[];

export function WarehouseCInventoryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeInventory = getActiveWarehouseCInventory(
    searchParams.get("inventory"),
  );
  const activeConfig = warehouseCInventoryConfigs[activeInventory];

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
            getInventoryPaths(row.inventorySlug, "issued", "warehouse-c").view(
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
            getInventoryPaths(row.inventorySlug, "issued", "warehouse-c").edit(
              row.inventoryRecordId,
            ),
          ),
      },
    ],
    [navigate],
  );

  return (
    <MasterPageShell
      breadcrumbs={[
        { label: "Warehouse C" },
        { label: activeConfig.title },
      ]}
      title="Warehouse C"
    >
      <Stack
        sx={(theme) => ({
          gap: theme.spacing(2),
        })}
      >
        <ModuleProcessTabs
          onChange={(value) => {
            setSearchParams({ inventory: value }, { replace: true });
          }}
          tabs={warehouseCTabs}
          value={activeInventory}
        />

        <EnterpriseDataTable
          key={activeInventory}
          actions={rowActions}
          columns={activeConfig.columns}
          defaultRowsPerPage={10}
          initialSort={{ key: "inwardDate", direction: "desc" }}
          rows={activeConfig.rows}
        />
      </Stack>
    </MasterPageShell>
  );
}

function getActiveWarehouseCInventory(
  value: string | null,
): WarehouseInventorySlug {
  return value && value in warehouseCInventoryConfigs
    ? (value as WarehouseInventorySlug)
    : "veneer-blocks";
}
