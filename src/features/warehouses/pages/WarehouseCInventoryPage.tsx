import { useMemo, useState } from "react";
import { Eye, FileOutput, Pencil } from "lucide-react";
import { Button, Stack } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router";

import {
  EnterpriseDataTable,
  type EnterpriseTableAction,
} from "../../../components/data-display/EnterpriseDataTable";
import { ModuleProcessTabs } from "../../../components/navigation/ModuleProcessTabs";
import { getInventoryPaths } from "../../inventory/shared";
import { MasterPageShell } from "../../masters/shared";
import { canAccessPermission } from "../../permissions";
import { getListingToolbarOutlinedButtonSx } from "../../shared/buttonStyles";
import { ClearableSearchField } from "../../shared/ClearableSearchField";
import { exportRowsToCsv } from "../../shared/exportToCsv";
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
  const [searchValue, setSearchValue] = useState("");
  const activeInventory = getActiveWarehouseCInventory(
    searchParams.get("inventory"),
  );
  const activeInventoryConfig = warehouseCInventoryConfigs[activeInventory];
  const canEditWarehouseC = canAccessPermission("warehouseC", "edit");
  const canViewWarehouseC = canAccessPermission("warehouseC", "view");

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return activeInventoryConfig.rows;
    }

    return activeInventoryConfig.rows.filter((row) =>
      Object.values(row).some((value) =>
        String(value ?? "").toLowerCase().includes(normalizedSearch),
      ),
    );
  }, [activeInventoryConfig.rows, searchValue]);

  const inventoryRowActions = useMemo<
    ReadonlyArray<EnterpriseTableAction<WarehouseInventoryRow>>
  >(() => {
    const actions: EnterpriseTableAction<WarehouseInventoryRow>[] = [
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
    ];

    return actions;
  }, [canEditWarehouseC, canViewWarehouseC, navigate]);

  return (
    <MasterPageShell
      breadcrumbs={[
        { label: warehouseName },
        { label: "Inventory" },
        { label: activeInventoryConfig.title },
      ]}
      subtitle="Processed stock ready for Factory and fulfilment."
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

        <Stack
          direction={{ xs: "column", lg: "row" }}
          alignItems={{ xs: "stretch", lg: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <ClearableSearchField
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Search inventory..."
            sx={{
              width: { xs: "100%", sm: 300 },
              maxWidth: "100%",
            }}
          />

          <Button
            variant="outlined"
            startIcon={<FileOutput size={15} />}
            disabled={filteredRows.length === 0}
            onClick={() =>
              exportRowsToCsv(
                filteredRows,
                activeInventoryConfig.columns,
                `warehouse-c-${activeInventory}`,
              )
            }
            sx={(theme) => ({
              ...getListingToolbarOutlinedButtonSx(theme),
              alignSelf: "center",
            })}
          >
            Export
          </Button>
        </Stack>

        <EnterpriseDataTable
          key={activeInventory}
          actions={inventoryRowActions}
          columns={activeInventoryConfig.columns}
          defaultRowsPerPage={10}
          initialSort={{ key: "inwardDate", direction: "desc" }}
          rows={canViewWarehouseC ? filteredRows : []}
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
