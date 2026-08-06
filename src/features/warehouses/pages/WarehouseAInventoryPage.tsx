import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Eye,
  FileOutput,
  Pencil,
  Plus,
} from "lucide-react";
import {
  Button,
  Stack,
} from "@mui/material";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router";

import {
  EnterpriseDataTable,
  type EnterpriseTableAction,
  type EnterpriseTableCellValue,
} from "../../../components/data-display/EnterpriseDataTable";
import { ModuleProcessTabs } from "../../../components/navigation/ModuleProcessTabs";
import { MasterPageShell } from "../../masters/shared";
import {
  getInventoryPaths,
  inventoryToolbarButtonSx,
} from "../../inventory/shared";
import { canAccessPermission } from "../../permissions";
import { ClearableSearchField } from "../../shared/ClearableSearchField";
import {
  warehouseAInventoryConfigs,
  type WarehouseInventoryRow,
  type WarehouseAInventorySlug,
} from "../shared/warehouseTableData";
import {
  getWarehouseQcStatus,
  markWarehouseQcDone,
  resolveWarehouseQcRows,
  subscribeWarehouseQcStatusUpdates,
} from "../shared/warehouseQcStore";

type WarehouseAVisibleInventorySlug = Exclude<
  WarehouseAInventorySlug,
  "consumables"
>;

const warehouseATabs = [
  { label: "Veneer Blocks", value: "veneer-blocks" },
  { label: "Raw Veneer", value: "raw-veneer" },
  { label: "Plywood", value: "plywood" },
  { label: "MDF", value: "mdf" },
] as const satisfies readonly {
  label: string;
  value: WarehouseAVisibleInventorySlug;
}[];

const visibleWarehouseAInventorySlugs = new Set<WarehouseAInventorySlug>(
  warehouseATabs.map((tab) => tab.value),
);

export function WarehouseAInventoryPage() {
  return <WarehouseAInventoryModulePage />;
}

interface WarehouseAInventoryModulePageProps {
  warehouseName?: string;
  warehouseRootPath?: string;
}

export function WarehouseAInventoryModulePage({
  warehouseName = "Warehouse A",
  warehouseRootPath = "/warehouse-a",
}: WarehouseAInventoryModulePageProps = {}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState("");
  const [qcStatusRevision, setQcStatusRevision] = useState(0);
  const activeInventory = getActiveWarehouseAInventory(
    searchParams.get("inventory"),
  );
  const activeConfig = warehouseAInventoryConfigs[activeInventory];
  const canCreate = canAccessPermission("warehouseA", "create");
  const canEdit = canAccessPermission("warehouseA", "edit");
  const canView = canAccessPermission("warehouseA", "view");
  const activeInventoryListPath = `${warehouseRootPath}?inventory=${activeInventory}`;
  const resolvedRows = useMemo(
    () => resolveWarehouseQcRows(activeConfig.rows),
    [activeConfig.rows, qcStatusRevision],
  );

  useEffect(
    () =>
      subscribeWarehouseQcStatusUpdates(() =>
        setQcStatusRevision((current) => current + 1),
      ),
    [],
  );

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return resolvedRows;
    }

    return resolvedRows.filter((row) =>
      Object.values(row).some((value) =>
        formatInventorySearchValue(value).includes(normalizedSearch),
      ),
    );
  }, [resolvedRows, searchValue]);

  const getRowActions = useMemo(
    () => (row: WarehouseInventoryRow) => {
      const actions: EnterpriseTableAction<WarehouseInventoryRow>[] = [
      ...(canView
        ? [
            {
              id: "view",
              label: "View",
              icon: Eye,
              onSelect: (row: WarehouseInventoryRow) =>
                navigate(
                  addReturnToQuery(
                    getInventoryPaths(
                      row.inventorySlug,
                      "issued",
                      "warehouse-a",
                    ).view(row.inventoryRecordId),
                    activeInventoryListPath,
                  ),
                ),
            },
          ]
        : []),
      ...(canEdit
        ? [
            {
              id: "edit",
              label: "Edit",
              icon: Pencil,
              onSelect: (row: WarehouseInventoryRow) =>
                navigate(
                  addReturnToQuery(
                    getInventoryPaths(
                      row.inventorySlug,
                      "issued",
                      "warehouse-a",
                    ).edit(row.inventoryRecordId),
                    activeInventoryListPath,
                  ),
                ),
            },
          ]
        : []),
      ];

      if (canEdit && getWarehouseQcStatus(row) !== "done") {
        actions.push({
          id: "mark-qc-done",
          label: "Mark as QC Done",
          icon: BadgeCheck,
          onSelect: (selectedRow) => {
            markWarehouseQcDone(selectedRow);
            setQcStatusRevision((current) => current + 1);
          },
        });
      }

      return actions;
    },
    [activeInventoryListPath, canEdit, canView, navigate],
  );

  return (
    <MasterPageShell
      breadcrumbs={[
        { label: warehouseName },
        { label: activeConfig.title },
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
            setSearchParams({ inventory: value }, { replace: true });
          }}
          tabs={warehouseATabs}
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
            sx={{
              width: { xs: "100%", md: 320 },
              maxWidth: "100%",
            }}
          />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            useFlexGap
            sx={{ alignItems: { xs: "stretch", lg: "center" } }}
          >
            {canCreate ? (
              <Button
                component={RouterLink}
                to={addReturnToQuery(
                  getInventoryPaths(activeInventory, "issued", "warehouse-a").add,
                  activeInventoryListPath,
                )}
                startIcon={<Plus size={16} />}
                variant="contained"
                sx={inventoryToolbarButtonSx}
              >
                Add Stock
              </Button>
            ) : null}

            <Button
              variant="outlined"
              startIcon={<FileOutput size={16} />}
              sx={inventoryToolbarButtonSx}
            >
              Export
            </Button>

          </Stack>
        </Stack>

        <EnterpriseDataTable
          key={activeInventory}
          columns={activeConfig.columns}
          defaultRowsPerPage={10}
          getRowActions={getRowActions}
          initialSort={{ key: "inwardDate", direction: "desc" }}
          rows={canView ? filteredRows : []}
        />
      </Stack>
    </MasterPageShell>
  );
}

function addReturnToQuery(path: string, returnTo: string) {
  const separator = path.includes("?") ? "&" : "?";

  return `${path}${separator}returnTo=${encodeURIComponent(returnTo)}`;
}

function getActiveWarehouseAInventory(
  value: string | null,
): WarehouseAInventorySlug {
  return value &&
    value in warehouseAInventoryConfigs &&
    visibleWarehouseAInventorySlugs.has(value as WarehouseAInventorySlug)
    ? (value as WarehouseAInventorySlug)
    : "veneer-blocks";
}

function formatInventorySearchValue(value: EnterpriseTableCellValue) {
  if (value instanceof Date) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
      .format(value)
      .toLowerCase();
  }

  if (value === null || typeof value === "undefined") {
    return "";
  }

  return String(value).toLowerCase();
}
