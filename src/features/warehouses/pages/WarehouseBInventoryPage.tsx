import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Eye,
  FileOutput,
  Pencil,
  Truck,
} from "lucide-react";
import {
  Box,
  Button,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router";

import {
  EnterpriseDataTable,
  type EnterpriseTableAction,
  type EnterpriseTableCellValue,
  type EnterpriseTableColumn,
} from "../../../components/data-display/EnterpriseDataTable";
import { ModuleProcessTabs } from "../../../components/navigation/ModuleProcessTabs";
import { ErpSelectField } from "../../../pages/ComponentLibrary/shared/ErpFieldControls";
import {
  InventoryPageShell,
  inventoryToolbarButtonSx,
  mdfDefinition,
  plywoodDefinition,
  rawVeneerDefinition,
  veneerBlocksDefinition,
} from "../../inventory/shared";
import {
  getInventoryPaths,
  getInventoryProcessTab,
  getInventoryRowsForTab,
  getWarehouseBRootPath,
  type InventoryProcessTab,
} from "../../inventory/shared/inventoryUtils";
import type {
  InventoryDefinition,
  InventoryRecord,
} from "../../inventory/shared/types";
import {
  canAccessPermission,
  getFactoryPermissionKey,
} from "../../permissions";
import { ClearableSearchField } from "../../shared/ClearableSearchField";
import {
  warehouseAInventoryConfigs,
  warehouseBInspectionConfigs,
  warehouseBInventoryConfigs,
  warehouseBRawVeneerTabConfigs,
  warehouseRawVeneerTabConfigs,
  type WarehouseBRawVeneerTab,
} from "../shared/warehouseTableData";
import type { WarehouseInventoryRow } from "../shared/warehouseTableData";
import {
  getWarehouseQcDoneRows,
  subscribeWarehouseQcStatusUpdates,
} from "../shared/warehouseQcStore";

type WarehouseBSection = "inspection" | "inventory";
type WarehouseBInventorySlug =
  | "mdf"
  | "plywood"
  | "raw-veneer"
  | "veneer-blocks";
type WarehouseBInspectionTab = "pending" | "done";
type WarehouseBInspectionSlug = "veneer-blocks";

const rawVeneerTabSelectOptions = ["All", "Purchase", "Production"] as const;

const rawVeneerTabValueByLabel = {
  All: "all",
  Production: "production",
  Purchase: "purchase",
} satisfies Record<(typeof rawVeneerTabSelectOptions)[number], WarehouseBRawVeneerTab>;

const rawVeneerTabLabelByValue: Record<WarehouseBRawVeneerTab, string> = {
  all: "All",
  production: "Production",
  purchase: "Purchase",
};

const warehouseBInventoryTabs = [
  { label: "Veneer Blocks", value: "veneer-blocks" },
  { label: "Raw Veneer", value: "raw-veneer" },
  { label: "Plywood", value: "plywood" },
  { label: "MDF", value: "mdf" },
] as const satisfies readonly {
  label: string;
  value: WarehouseBInventorySlug;
}[];

const warehouseBProcessTabs = [
  { label: "Inventory", value: "issued" },
  { label: "History", value: "history" },
] as const satisfies readonly {
  label: string;
  value: InventoryProcessTab;
}[];

const warehouseBInspectionTabs = [
  { label: "Inspection Pending", value: "pending" },
  { label: "Inspection Done", value: "done" },
] as const satisfies readonly {
  label: string;
  value: WarehouseBInspectionTab;
}[];

const inventoryDefinitions = {
  "veneer-blocks": veneerBlocksDefinition,
  "raw-veneer": rawVeneerDefinition,
  plywood: plywoodDefinition,
  mdf: mdfDefinition,
} satisfies Record<WarehouseBInventorySlug, InventoryDefinition<any>>;

const warehouseBInspectionPendingConfig = warehouseBInspectionConfigs.pending;
const warehouseBInspectionDoneConfig = warehouseBInspectionConfigs.done;
const warehouseBMoveToWarehouseCInventories = new Set<WarehouseBInventorySlug>([
  "raw-veneer",
  "plywood",
  "mdf",
]);

export function WarehouseBInventoryPage() {
  return <WarehouseBInventoryModulePage />;
}

interface WarehouseBInventoryModulePageProps {
  warehouseName?: string;
  warehouseRootPath?: string;
}

export function WarehouseBInventoryModulePage({
  warehouseName = "Warehouse B",
  warehouseRootPath = getWarehouseBRootPath(),
}: WarehouseBInventoryModulePageProps = {}) {
  const theme = useTheme();
  const bulkSecondaryButtonSx = {
    minHeight: 36,
    px: theme.spacing(2),
    borderRadius: `${theme.customTokens.radius.md}px`,
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 700,
    textTransform: "none",
    "&:hover": {
      borderColor: theme.palette.primary.dark,
      backgroundColor: theme.customTokens.navigation.hoverBackground,
    },
  };
  const bulkPrimaryButtonSx = {
    minHeight: 36,
    px: theme.spacing(2),
    borderRadius: `${theme.customTokens.radius.md}px`,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 700,
    textTransform: "none",
    boxShadow: theme.customTokens.elevation.sm,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
      boxShadow: theme.customTokens.elevation.sm,
    },
  };
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState("");
  const [selectedRows, setSelectedRows] = useState<InventoryRecord[]>([]);
  const [selectionResetKey, setSelectionResetKey] = useState(0);
  const [qcStatusRevision, setQcStatusRevision] = useState(0);

  const activeSection = getActiveWarehouseBSection(searchParams.get("section"));
  const activeInventory = getActiveInventoryTab(searchParams.get("inventory"));
  const activeProcessTab = getInventoryProcessTab(searchParams.get("tab"));
  const activeRawVeneerTab = getActiveRawVeneerTab(searchParams.get("rawTab"));
  const activeInspectionTab = getActiveWarehouseBInspectionTab(
    searchParams.get("inspection"),
  );
  const activeDefinition = inventoryDefinitions[activeInventory];
  const activeRawVeneerConfig =
    activeInventory === "raw-veneer"
      ? warehouseBRawVeneerTabConfigs[activeRawVeneerTab]
      : null;
  const activeWarehouseInventoryConfig =
    warehouseBInventoryConfigs[activeInventory];
  const activeWarehouseBStockRows = useMemo(
    () => {
      void qcStatusRevision;
      return getWarehouseBStockRows(activeInventory, activeRawVeneerTab);
    },
    [activeInventory, activeRawVeneerTab, qcStatusRevision],
  );
  const activeRows = (
    activeProcessTab === "issued"
      ? activeWarehouseBStockRows
      : activeRawVeneerConfig?.rows ?? activeWarehouseInventoryConfig.rows
  ) as readonly InventoryRecord[];
  const activeColumns = (
    activeRawVeneerConfig?.columns ?? activeWarehouseInventoryConfig.columns
  ) as readonly EnterpriseTableColumn<InventoryRecord>[];
  const inventoryPaths = getInventoryPaths(
    activeDefinition.slug,
    activeProcessTab,
  );

  const canCreateSlicing = canAccessPermission(
    getFactoryPermissionKey("slicing"),
    "create",
  );
  const canCreateWarehouseC = canAccessPermission("warehouseC", "create");
  const canEditWarehouseB = canAccessPermission("warehouseB", "edit");
  const canViewWarehouseB = canAccessPermission("warehouseB", "view");
  const [inspectionDoneRowIds, setInspectionDoneRowIds] = useState<string[]>(
    [],
  );

  useEffect(
    () =>
      subscribeWarehouseQcStatusUpdates(() =>
        setQcStatusRevision((current) => current + 1),
      ),
    [],
  );

  const inventoryTabRows = useMemo(
    () =>
      activeProcessTab === "issued"
        ? activeRows
        : getInventoryRowsForTab(activeRows, activeProcessTab),
    [activeProcessTab, activeRows],
  );

  const filteredInventoryRows = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return inventoryTabRows;
    }

    return inventoryTabRows.filter((row) =>
      Object.values(row).some((value) =>
        formatSearchValue(value).includes(normalizedSearch),
      ),
    );
  }, [inventoryTabRows, searchValue]);

  const inspectionPendingRows = useMemo(
    () =>
      warehouseBInspectionPendingConfig.rows
        .filter((row) => !inspectionDoneRowIds.includes(row.id))
        .map((row) => ({
          ...row,
          status: "Inspection Pending",
        })),
    [inspectionDoneRowIds],
  );
  const inspectionDoneRows = useMemo(
    () => [
      ...warehouseBInspectionDoneConfig.rows.map((row) => ({
        ...row,
        status: "Inspection Done",
      })),
      ...warehouseBInspectionPendingConfig.rows
        .filter((row) => inspectionDoneRowIds.includes(row.id))
        .map((row) => ({
          ...row,
          status: "Inspection Done",
        })),
    ],
    [inspectionDoneRowIds],
  );
  const activeInspectionRows =
    activeInspectionTab === "pending" ? inspectionPendingRows : inspectionDoneRows;
  const activeInspectionColumns =
    activeInspectionTab === "pending"
      ? warehouseBInspectionPendingConfig.columns
      : warehouseBInspectionDoneConfig.columns;

  const filteredInspectionRows = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return activeInspectionRows;
    }

    return activeInspectionRows.filter((row) =>
      Object.values(row).some((value) =>
        formatSearchValue(value).includes(normalizedSearch),
      ),
    );
  }, [activeInspectionRows, searchValue]);

  const inventoryRowActions = useMemo<
    ReadonlyArray<EnterpriseTableAction<InventoryRecord>>
  >(() => {
    const baseActions: EnterpriseTableAction<InventoryRecord>[] = [
      ...(canViewWarehouseB
        ? [
            {
              id: "view",
              label: "View",
              icon: Eye,
              onSelect: (row: InventoryRecord) =>
                navigate(inventoryPaths.view(getWarehouseBRecordId(row))),
            },
          ]
        : []),
    ];

    if (activeProcessTab === "history") {
      return baseActions;
    }

    if (activeInventory === "veneer-blocks" && canEditWarehouseB) {
      baseActions.push({
        id: "edit",
        label: "Edit",
        icon: Pencil,
        onSelect: (row) =>
          navigate(inventoryPaths.edit(getWarehouseBRecordId(row))),
      });
    }

    if (
      warehouseBMoveToWarehouseCInventories.has(activeInventory) &&
      canEditWarehouseB
    ) {
      baseActions.push(
        {
          id: "edit",
          label: "Edit",
          icon: Pencil,
          onSelect: (row) =>
            navigate(inventoryPaths.edit(getWarehouseBRecordId(row))),
        },
        ...(canCreateWarehouseC
          ? [
              {
                id: "move-to-warehouse-c",
                label: "Move to Warehouse C",
                icon: Truck,
                onSelect: () =>
                  navigate(
                    `/warehouse-c?section=inventory&inventory=${activeInventory}`,
                  ),
              },
            ]
          : []),
      );
    }

    if (
      activeInventory === "veneer-blocks" &&
      activeProcessTab === "issued" &&
      canEditWarehouseB &&
      canCreateSlicing
    ) {
      baseActions.push({
        id: "issue-for-slicing",
        label: "Issue for Slicing",
        onSelect: (row) =>
          navigate("/factory/slicing/add", {
            state: {
              sourceRow: row,
            },
          }),
      });
    }

    return baseActions;
  }, [
    activeInventory,
    activeProcessTab,
    canCreateSlicing,
    canCreateWarehouseC,
    canEditWarehouseB,
    canViewWarehouseB,
    inventoryPaths,
    navigate,
  ]);

  const inspectionRowActions = useMemo<
    ReadonlyArray<EnterpriseTableAction<WarehouseInventoryRow>>
  >(() => {
    if (activeInspectionTab === "pending") {
      return canEditWarehouseB
        ? [
            {
              id: "move-to-inspection-done",
              label: "Move to Inspection Done",
              icon: BadgeCheck,
              onSelect: (row) =>
                setInspectionDoneRowIds((current) =>
                  current.includes(row.id) ? current : [...current, row.id],
                ),
            },
          ]
        : [];
    }

    return [
      ...(canEditWarehouseB
        ? [
            {
              id: "move-to-warehouse-b",
              label: "Move to Warehouse B",
              icon: Truck,
              onSelect: () =>
                navigate("/warehouse-b?section=inventory&inventory=raw-veneer"),
            },
          ]
        : []),
      ...(canEditWarehouseB && canCreateWarehouseC
        ? [
            {
              id: "move-to-warehouse-c",
              label: "Move to Warehouse C",
              icon: Truck,
              onSelect: () =>
                navigate("/warehouse-c?section=inventory&inventory=raw-veneer"),
            },
          ]
        : []),
    ];
  }, [
    activeInspectionTab,
    canCreateWarehouseC,
    canEditWarehouseB,
    navigate,
  ]);

  const showBulkIssueForSlicing =
    activeSection === "inventory" &&
    activeInventory === "veneer-blocks" &&
    activeProcessTab === "issued" &&
    canEditWarehouseB &&
    canCreateSlicing &&
    selectedRows.length > 1;
  const showBulkMoveToWarehouseC =
    activeSection === "inventory" &&
    warehouseBMoveToWarehouseCInventories.has(activeInventory) &&
    activeProcessTab === "issued" &&
    canEditWarehouseB &&
    canCreateWarehouseC &&
    selectedRows.length > 1;

  const handleCancelBulkSelection = () => {
    setSelectedRows([]);
    setSelectionResetKey((current) => current + 1);
  };

  const handleMoveSelectionToWarehouseC = () => {
    if (!canEditWarehouseB || !canCreateWarehouseC) {
      return;
    }

    navigate(`/warehouse-c?section=inventory&inventory=${activeInventory}`);
  };

  return (
    <InventoryPageShell
      breadcrumbs={getWarehouseBBreadcrumbs({
        activeDefinitionSlug: activeDefinition.slug,
        activeDefinitionTitle: activeDefinition.title,
        activeProcessTab,
        activeRawVeneerTitle:
          activeRawVeneerConfig?.title === "All"
            ? undefined
            : activeRawVeneerConfig?.title,
        activeSection,
        warehouseName,
        warehouseRootPath,
      })}
      processTabs={renderWarehouseBSectionTabs({
        activeInventory,
        activeInspectionTab,
        activeProcessTab,
        activeRawVeneerTab,
        activeSection,
        setSearchParams,
      })}
      title={warehouseName}
    >
      <Stack
        sx={(currentTheme) => ({
          gap: currentTheme.spacing(2),
        })}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          alignItems={{ xs: "stretch", lg: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            sx={{
              alignItems: { xs: "stretch", sm: "center" },
              width: { xs: "100%", lg: "auto" },
            }}
          >
            <ClearableSearchField
              value={searchValue}
              onChange={setSearchValue}
              sx={{
                width: { xs: "100%", md: 320 },
                maxWidth: "100%",
              }}
            />

            {activeSection === "inventory" && activeInventory === "raw-veneer" ? (
              <Box sx={{ width: { xs: "100%", sm: 140 } }}>
                <ErpSelectField
                  value={rawVeneerTabLabelByValue[activeRawVeneerTab]}
                  onChange={(value) => {
                    const selectedRawTab =
                      rawVeneerTabValueByLabel[
                        value as keyof typeof rawVeneerTabValueByLabel
                      ] ?? "all";

                    setSearchParams(
                      {
                        section: "inventory",
                        inventory: activeInventory,
                        ...(selectedRawTab === "all"
                          ? {}
                          : { rawTab: selectedRawTab }),
                        ...(activeProcessTab === "history"
                          ? { tab: "history" }
                          : {}),
                      },
                      { replace: true },
                    );
                  }}
                  options={rawVeneerTabSelectOptions}
                  size="dense"
                />
              </Box>
            ) : null}
          </Stack>

          {activeSection === "inventory" ? (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              useFlexGap
              sx={{ alignItems: { xs: "stretch", lg: "center" } }}
            >
              <Button
                variant="outlined"
                startIcon={<FileOutput size={16} />}
                sx={inventoryToolbarButtonSx}
              >
                Export
              </Button>

            </Stack>
          ) : null}
        </Stack>

        {showBulkIssueForSlicing ? (
          <Box
            sx={{
              width: "100%",
              border: `1px solid ${theme.customTokens.borders.default}`,
              borderRadius: `${theme.customTokens.radius.md}px`,
              backgroundColor: theme.customTokens.surfaces.surface,
              boxShadow: theme.customTokens.elevation.sm,
              px: theme.spacing(2),
              py: theme.spacing(1.5),
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
            >
              <Typography variant="body2" color="text.secondary">
                {selectedRows.length} veneer block records selected
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.25}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleCancelBulkSelection}
                  sx={bulkSecondaryButtonSx}
                >
                  Cancel
                </Button>

                <Button
                  variant="contained"
                  onClick={() =>
                    navigate("/factory/slicing/add", {
                      state: {
                        sourceRows: selectedRows,
                      },
                    })
                  }
                  sx={bulkPrimaryButtonSx}
                >
                  Issue for Slicing
                </Button>
              </Stack>
            </Stack>
          </Box>
        ) : null}

        {showBulkMoveToWarehouseC ? (
          <Box
            sx={{
              width: "100%",
              border: `1px solid ${theme.customTokens.borders.default}`,
              borderRadius: `${theme.customTokens.radius.md}px`,
              backgroundColor: theme.customTokens.surfaces.surface,
              boxShadow: theme.customTokens.elevation.sm,
              px: theme.spacing(2),
              py: theme.spacing(1.5),
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
            >
              <Typography variant="body2" color="text.secondary">
                {selectedRows.length} {activeDefinition.title.toLowerCase()} records selected
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.25}
                sx={{ width: { xs: "100%", sm: "auto" } }}
              >
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleCancelBulkSelection}
                  sx={bulkSecondaryButtonSx}
                >
                  Cancel
                </Button>

                <Button
                  variant="contained"
                  onClick={handleMoveSelectionToWarehouseC}
                  startIcon={<Truck size={16} />}
                  sx={bulkPrimaryButtonSx}
                >
                  Move to Warehouse C
                </Button>
              </Stack>
            </Stack>
          </Box>
        ) : null}

        {activeSection === "inventory" ? (
          <EnterpriseDataTable
            key={`${activeInventory}-${activeRawVeneerTab}-${activeProcessTab}`}
            actions={inventoryRowActions}
            columns={activeColumns}
            defaultRowsPerPage={10}
            emptyStateLabel={`No ${activeDefinition.title.toLowerCase()} records are available for this tab.`}
            onSelectionChange={setSelectedRows}
            rows={canViewWarehouseB ? filteredInventoryRows : []}
            selectionResetKey={selectionResetKey}
            selectable={activeProcessTab !== "history" && canEditWarehouseB}
            {...(activeDefinition.initialSort
              ? { initialSort: activeDefinition.initialSort }
              : {})}
          />
        ) : null}

        {activeSection === "inspection" ? (
          <EnterpriseDataTable
            key={`warehouse-b-inspection-${activeInspectionTab}`}
            actions={inspectionRowActions}
            columns={activeInspectionColumns}
            defaultRowsPerPage={10}
            initialSort={{ key: "inwardDate", direction: "desc" }}
            rows={
              activeInspectionTab === "pending"
                ? canViewWarehouseB
                  ? filteredInspectionRows
                  : []
                : canViewWarehouseB
                  ? filteredInspectionRows
                  : []
            }
          />
        ) : null}
      </Stack>
    </InventoryPageShell>
  );
}

function renderWarehouseBSectionTabs({
  activeInventory,
  activeInspectionTab,
  activeProcessTab,
  activeRawVeneerTab,
  activeSection,
  setSearchParams,
}: {
  activeInventory: WarehouseBInventorySlug;
  activeInspectionTab: WarehouseBInspectionTab;
  activeProcessTab: InventoryProcessTab;
  activeRawVeneerTab: WarehouseBRawVeneerTab;
  activeSection: WarehouseBSection;
  setSearchParams: ReturnType<typeof useSearchParams>[1];
}) {
  if (activeSection === "inspection") {
    return (
      <ModuleProcessTabs
        onChange={(value) => {
          setSearchParams(
            {
              section: "inspection",
              ...(value === "pending" ? {} : { inspection: value }),
            },
            { replace: true },
          );
        }}
        tabs={warehouseBInspectionTabs}
        value={activeInspectionTab}
      />
    );
  }

  return (
    <Stack
      sx={(theme) => ({
        gap: theme.spacing(0),
      })}
    >
      <ModuleProcessTabs
        onChange={(value) => {
          setSearchParams(
            value === "raw-veneer"
              ? {
                  section: "inventory",
                  inventory: value,
                  ...(activeProcessTab === "history" ? { tab: "history" } : {}),
                }
              : {
                  section: "inventory",
                  inventory: value,
                  ...(activeProcessTab === "history" ? { tab: "history" } : {}),
                },
            { replace: true },
          );
        }}
        tabs={warehouseBInventoryTabs}
        value={activeInventory}
      />

      <ModuleProcessTabs
        onChange={(value) => {
          setSearchParams(
            activeInventory === "raw-veneer"
              ? {
                  section: "inventory",
                  inventory: activeInventory,
                  ...(activeRawVeneerTab === "all"
                    ? {}
                    : { rawTab: activeRawVeneerTab }),
                  ...(value === "history" ? { tab: value } : {}),
                }
              : {
                  section: "inventory",
                  inventory: activeInventory,
                  ...(value === "history" ? { tab: value } : {}),
                },
            { replace: true },
          );
        }}
        tabs={warehouseBProcessTabs}
        value={activeProcessTab}
      />
    </Stack>
  );
}

function getWarehouseBBreadcrumbs({
  activeDefinitionSlug,
  activeDefinitionTitle,
  activeProcessTab,
  activeRawVeneerTitle,
  activeSection,
  warehouseName,
  warehouseRootPath,
}: {
  activeDefinitionSlug: string;
  activeDefinitionTitle: string;
  activeProcessTab: InventoryProcessTab;
  activeRawVeneerTitle: string | undefined;
  activeSection: WarehouseBSection;
  warehouseName: string;
  warehouseRootPath: string;
}) {
  if (activeSection === "inspection") {
    return [
      {
        label: warehouseName,
        to: warehouseRootPath,
      },
      { label: "Inspection" },
    ];
  }

  return [
    {
      label: warehouseName,
      to: warehouseRootPath,
    },
    { label: "Inventory" },
    {
      label: activeDefinitionTitle,
      to: `${warehouseRootPath}?section=inventory&inventory=${activeDefinitionSlug}`,
    },
    ...(activeRawVeneerTitle ? [{ label: activeRawVeneerTitle }] : []),
    { label: activeProcessTab === "history" ? "History" : "Inventory" },
  ];
}

function getActiveWarehouseBSection(value: string | null): WarehouseBSection {
  return value === "inspection" ? "inspection" : "inventory";
}

function getActiveWarehouseBInspectionTab(
  value: string | null,
): WarehouseBInspectionTab {
  return value === "done" ? "done" : "pending";
}

function getActiveInventoryTab(value: string | null): WarehouseBInventorySlug {
  return value && value in inventoryDefinitions
    ? (value as WarehouseBInventorySlug)
    : "veneer-blocks";
}

function getActiveRawVeneerTab(value: string | null): WarehouseBRawVeneerTab {
  if (value === "purchase" || value === "production") {
    return value;
  }

  return "all";
}

function getWarehouseBStockRows(
  activeInventory: WarehouseBInventorySlug,
  activeRawVeneerTab: WarehouseBRawVeneerTab,
) {
  const sourceRows =
    activeInventory === "raw-veneer"
      ? getWarehouseARawVeneerRows(activeRawVeneerTab)
      : warehouseAInventoryConfigs[activeInventory].rows;

  return getWarehouseQcDoneRows(sourceRows).map((row) => ({
    ...row,
    status: "QC Done",
  }));
}

function getWarehouseARawVeneerRows(activeRawVeneerTab: WarehouseBRawVeneerTab) {
  if (activeRawVeneerTab === "all") {
    return [
      ...warehouseRawVeneerTabConfigs.purchase.rows,
      ...warehouseRawVeneerTabConfigs.production.rows,
    ];
  }

  return warehouseRawVeneerTabConfigs[activeRawVeneerTab].rows;
}

function getWarehouseBRecordId(row: InventoryRecord) {
  return row.id;
}

function formatSearchValue(value: EnterpriseTableCellValue) {
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
