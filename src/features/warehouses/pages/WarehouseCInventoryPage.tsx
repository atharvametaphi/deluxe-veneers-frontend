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
import { canAccessPermission } from "../../permissions";
import {
  warehouseCInventoryConfigs,
  type WarehouseCInventorySlug,
  type WarehouseInventoryRow,
} from "../shared/warehouseTableData";

const warehouseCInventoryTabs = [
  { label: "Raw Veneer", value: "raw-veneer" },
  { label: "Plywood", value: "plywood" },
  { label: "MDF", value: "mdf" },
] as const satisfies readonly {
  label: string;
  value: WarehouseCInventorySlug;
}[];

export function WarehouseCInventoryPage() {
  return <WarehouseCInventoryModulePage />;
}

interface WarehouseCInventoryModulePageProps {
  warehouseName?: string;
}

export function WarehouseCInventoryModulePage({
  warehouseName = "Warehouse C",
}: WarehouseCInventoryModulePageProps = {}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeInventory = getActiveWarehouseCInventory(
    searchParams.get("inventory"),
  );
  const activeInventoryConfig = warehouseCInventoryConfigs[activeInventory];
  const canEditWarehouseC = canAccessPermission("warehouseC", "edit");
  const canViewWarehouseC = canAccessPermission("warehouseC", "view");

  const inventoryRowActions = useMemo<
    ReadonlyArray<EnterpriseTableAction<WarehouseInventoryRow>>
  >(
    () => [
      ...(canViewWarehouseC
        ? [
            {
              id: "view",
              label: "View",
              icon: Eye,
              onSelect: (row: WarehouseInventoryRow) =>
                navigate(
                  getInventoryPaths(row.inventorySlug, "issued", "warehouse-c").view(
                    row.inventoryRecordId,
                  ),
                ),
            },
          ]
        : []),
      ...(canEditWarehouseC
        ? [
            {
              id: "edit",
              label: "Edit",
              icon: Pencil,
              onSelect: (row: WarehouseInventoryRow) =>
                navigate(
                  getInventoryPaths(row.inventorySlug, "issued", "warehouse-c").edit(
                    row.inventoryRecordId,
                  ),
                ),
            },
          ]
        : []),
    ],
    [canEditWarehouseC, canViewWarehouseC, navigate],
  );

  return (
    <MasterPageShell
      breadcrumbs={[
        { label: warehouseName },
        { label: "Inventory" },
        { label: activeInventoryConfig.title },
      ]}
      title={warehouseName}
    >
      <Stack
        sx={(theme) => ({
          gap: theme.spacing(2),
        })}
      >
        <ModuleProcessTabs
          onChange={(value) => {
            setSearchParams(
              {
                section: "inventory",
                inventory: value,
              },
              { replace: true },
            );
          }}
          tabs={warehouseCInventoryTabs}
          value={activeInventory}
        />

        <EnterpriseDataTable
          key={activeInventory}
          actions={inventoryRowActions}
          columns={activeInventoryConfig.columns}
          defaultRowsPerPage={10}
          initialSort={{ key: "inwardDate", direction: "desc" }}
          rows={canViewWarehouseC ? activeInventoryConfig.rows : []}
        />
      </Stack>
    </MasterPageShell>
  );
}

function getActiveWarehouseCInventory(
  value: string | null,
): WarehouseCInventorySlug {
  return value && value in warehouseCInventoryConfigs
    ? (value as WarehouseCInventorySlug)
    : "raw-veneer";
}
