import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Download,
  Eye,
  FileOutput,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Truck,
} from "lucide-react";
import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
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
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import {
  dryingDefinition,
  getFactoryPaths,
  getFactoryProcessTabs,
  getFactoryRowsForTab,
  slicingDefinition,
  type FactoryProcessTab,
  type FactoryRecord,
} from "../../factory/shared";
import {
  InventoryPageShell,
  mdfDefinition,
  plywoodDefinition,
  rawVeneerDefinition,
  veneerBlocksDefinition,
} from "../../inventory/shared";
import {
  getInventoryPaths,
  getInventoryProcessTab,
  getInventoryRowsForTab,
  getWarehouseBInventoryPath,
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
import { qcTableConfigs } from "../../qc/shared/qcTableData";
import {
  warehouseBRawVeneerTabConfigs,
  type WarehouseBRawVeneerTab,
} from "../shared/warehouseTableData";
import type { WarehouseInventoryRow } from "../shared/warehouseTableData";

type WarehouseBSection = "factory" | "inspection" | "inventory";
type WarehouseBInventorySlug =
  | "mdf"
  | "plywood"
  | "raw-veneer"
  | "veneer-blocks";
type WarehouseBFactorySlug = "drying" | "slicing";
type WarehouseBInspectionTab = "pending" | "done";
type WarehouseBInspectionSlug = "veneer-blocks";

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
  { label: "Stock", value: "issued" },
  { label: "History", value: "history" },
] as const satisfies readonly {
  label: string;
  value: InventoryProcessTab;
}[];

const warehouseBFactoryTabs = [
  { label: "Slicing", value: "slicing" },
  { label: "Drying", value: "drying" },
] as const satisfies readonly {
  label: string;
  value: WarehouseBFactorySlug;
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

const warehouseBFactoryDefinitions = {
  slicing: slicingDefinition,
  drying: dryingDefinition,
} as const;

const warehouseBInspectionPendingConfig = qcTableConfigs.pending["veneer-blocks"];
const warehouseBInspectionDoneConfig = qcTableConfigs.done["veneer-blocks"];
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState("");
  const [selectedRows, setSelectedRows] = useState<InventoryRecord[]>([]);
  const [selectionResetKey, setSelectionResetKey] = useState(0);

  const activeSection = getActiveWarehouseBSection(searchParams.get("section"));
  const activeInventory = getActiveInventoryTab(searchParams.get("inventory"));
  const activeProcessTab = getInventoryProcessTab(searchParams.get("tab"));
  const activeRawVeneerTab = getActiveRawVeneerTab(searchParams.get("rawTab"));
  const activeFactory = getActiveWarehouseBFactory(searchParams.get("factory"));
  const activeInspectionTab = getActiveWarehouseBInspectionTab(
    searchParams.get("inspection"),
  );
  const activeFactoryProcessTab = getActiveFactoryProcessTab(
    searchParams.get("factoryTab"),
  );
  const activeDefinition = inventoryDefinitions[activeInventory];
  const activeRawVeneerConfig =
    activeInventory === "raw-veneer"
      ? warehouseBRawVeneerTabConfigs[activeRawVeneerTab]
      : null;
  const activeRows = (
    activeRawVeneerConfig?.rows ?? activeDefinition.rows
  ) as readonly InventoryRecord[];
  const activeColumns = (
    activeRawVeneerConfig?.columns ?? activeDefinition.listColumns
  ) as readonly EnterpriseTableColumn<InventoryRecord>[];
  const inventoryPaths = getInventoryPaths(
    activeDefinition.slug,
    activeProcessTab,
  );

  const activeFactoryDefinition = warehouseBFactoryDefinitions[activeFactory];
  const activeFactoryPermissionKey = getFactoryPermissionKey(
    activeFactoryDefinition.slug,
  );
  const canCreateFactory = canAccessPermission(
    activeFactoryPermissionKey,
    "create",
  );
  const canEditFactory = canAccessPermission(activeFactoryPermissionKey, "edit");
  const canViewFactory = canAccessPermission(activeFactoryPermissionKey, "view");
  const canEditQcPending = canAccessPermission("qcPending", "edit");
  const canViewQcPending = canAccessPermission("qcPending", "view");
  const canEditQcDone = canAccessPermission("qcDone", "edit");
  const canViewQcDone = canAccessPermission("qcDone", "view");
  const canCreateSlicing = canAccessPermission(
    getFactoryPermissionKey("slicing"),
    "create",
  );
  const canCreateWarehouseC = canAccessPermission("warehouseC", "create");
  const canEditWarehouseB = canAccessPermission("warehouseB", "edit");
  const canViewWarehouseB = canAccessPermission("warehouseB", "view");
  const factoryProcessTabs = useMemo(
    () => getFactoryProcessTabs(activeFactoryDefinition.title),
    [activeFactoryDefinition.title],
  );
  const [revertedFactoryRowIds, setRevertedFactoryRowIds] = useState<string[]>(
    [],
  );
  const [inspectionDoneRowIds, setInspectionDoneRowIds] = useState<string[]>(
    [],
  );
  const factoryRows = useMemo(
    () => getFactoryRowsForTab(activeFactoryDefinition.rows, activeFactoryProcessTab),
    [activeFactoryDefinition.rows, activeFactoryProcessTab],
  );
  const inventoryTabRows = useMemo(
    () => getInventoryRowsForTab(activeRows, activeProcessTab),
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

  const filteredFactoryRows = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return factoryRows.filter((row) => !revertedFactoryRowIds.includes(row.id));
    }

    return factoryRows
      .filter((row) => !revertedFactoryRowIds.includes(row.id))
      .filter((row) =>
        Object.values(row).some((value) =>
          formatSearchValue(value).includes(normalizedSearch),
        ),
      );
  }, [factoryRows, revertedFactoryRowIds, searchValue]);

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

  const factoryPaths = getFactoryPaths(activeFactoryDefinition.slug);
  const factoryRowActions = useMemo<
    ReadonlyArray<EnterpriseTableAction<FactoryRecord>>
  >(() => {
    const baseActions: EnterpriseTableAction<FactoryRecord>[] = [
      ...(canViewFactory
        ? [
            {
              id: "view",
              label: "View",
              icon: Eye,
              onSelect: (row: FactoryRecord) => navigate(factoryPaths.view(row.id)),
            },
          ]
        : []),
      ...(canEditFactory
        ? [
            {
              id: "edit",
              label: "Edit",
              icon: Pencil,
              onSelect: (row: FactoryRecord) => navigate(factoryPaths.edit(row.id)),
            },
          ]
        : []),
    ];

    if (activeFactoryProcessTab === "issued" && canCreateFactory) {
      baseActions.unshift({
        id: "create-process",
        label: `Create ${activeFactoryDefinition.title}`,
        icon: Plus,
        onSelect: (row) =>
          navigate(factoryPaths.add, {
            state: { sourceRow: row },
          }),
      });
      baseActions.push({
        id: "revert-item",
        label: "Revert Item",
        icon: RotateCcw,
        onSelect: (row) =>
          setRevertedFactoryRowIds((current) =>
            current.includes(row.id) ? current : [...current, row.id],
          ),
      });
    }

    return baseActions;
  }, [
    activeFactoryDefinition.title,
    activeFactoryProcessTab,
    canCreateFactory,
    canEditFactory,
    canViewFactory,
    factoryPaths,
    navigate,
  ]);

  const getFactoryRowActions = useMemo<
    ((row: FactoryRecord) => readonly EnterpriseTableAction<FactoryRecord>[]) | undefined
  >(() => {
    if (activeFactoryProcessTab !== "done") {
      return undefined;
    }

    return (row) => {
      const nextProcessActions = getWarehouseFactoryNextProcessActions(
        row,
        navigate,
        activeFactoryDefinition.slug,
      );

      if (nextProcessActions.length === 0) {
        return factoryRowActions;
      }

      return [...factoryRowActions, ...nextProcessActions];
    };
  }, [
    activeFactoryDefinition.slug,
    activeFactoryProcessTab,
    factoryRowActions,
    navigate,
  ]);

  const inspectionRowActions = useMemo<
    ReadonlyArray<EnterpriseTableAction<WarehouseInventoryRow>>
  >(() => {
    if (activeInspectionTab === "pending") {
      return canEditQcPending
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
      ...(canEditQcDone && canEditWarehouseB
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
      ...(canEditQcDone && canCreateWarehouseC
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
    canEditQcDone,
    canEditQcPending,
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
        activeFactoryTitle: activeFactoryDefinition.title,
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
        activeFactory,
        activeInventory,
        activeFactoryProcessTab,
        activeInspectionTab,
        activeProcessTab,
        factoryProcessTabs,
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
          <TextField
            placeholder="Search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            sx={[
              getCompactFieldSx(theme),
              {
                width: { xs: "100%", md: 320 },
                maxWidth: "100%",
              },
            ]}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Search
                      color={theme.customTokens.text.secondary}
                      size={16}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />

          {activeSection === "inventory" ? (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              useFlexGap
              sx={{ alignItems: { xs: "stretch", lg: "center" } }}
            >
              {activeInventory === "raw-veneer" ? (
                <TextField
                  select
                  value={activeRawVeneerTab}
                  onChange={(event) => {
                    const selectedRawTab = event.target.value as WarehouseBRawVeneerTab;

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
                  sx={[
                    getCompactFieldSx(theme),
                    {
                      width: { xs: "100%", sm: 160 },
                    },
                  ]}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="purchase">Purchase</MenuItem>
                  <MenuItem value="production">Production</MenuItem>
                </TextField>
              ) : null}

              <Button variant="outlined" startIcon={<FileOutput size={16} />}>
                Export
              </Button>

              <Button variant="outlined" startIcon={<Download size={16} />}>
                Download
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
                <Button variant="outlined" onClick={handleCancelBulkSelection}>
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
                <Button variant="outlined" onClick={handleCancelBulkSelection}>
                  Cancel
                </Button>

                <Button
                  variant="contained"
                  onClick={handleMoveSelectionToWarehouseC}
                  startIcon={<Truck size={16} />}
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

        {activeSection === "factory" ? (
          <EnterpriseDataTable
            key={`${activeFactory}-${activeFactoryProcessTab}`}
            actions={factoryRowActions}
            columns={activeFactoryDefinition.listColumns}
            defaultRowsPerPage={10}
            rows={canViewFactory ? filteredFactoryRows : []}
            {...(getFactoryRowActions
              ? { getRowActions: getFactoryRowActions }
              : {})}
            {...(activeFactoryDefinition.initialSort
              ? { initialSort: activeFactoryDefinition.initialSort }
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
                ? canViewQcPending
                  ? filteredInspectionRows
                  : []
                : canViewQcDone
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
  activeFactory,
  activeInventory,
  activeFactoryProcessTab,
  activeInspectionTab,
  activeProcessTab,
  factoryProcessTabs,
  activeRawVeneerTab,
  activeSection,
  setSearchParams,
}: {
  activeFactory: WarehouseBFactorySlug;
  activeInventory: WarehouseBInventorySlug;
  activeFactoryProcessTab: FactoryProcessTab;
  activeInspectionTab: WarehouseBInspectionTab;
  activeProcessTab: InventoryProcessTab;
  factoryProcessTabs: ReturnType<typeof getFactoryProcessTabs>;
  activeRawVeneerTab: WarehouseBRawVeneerTab;
  activeSection: WarehouseBSection;
  setSearchParams: ReturnType<typeof useSearchParams>[1];
}) {
  if (activeSection === "factory") {
    return (
      <Stack
        sx={(theme) => ({
          gap: theme.spacing(0),
        })}
      >
        <ModuleProcessTabs
          onChange={(value) => {
            setSearchParams(
              {
                section: "factory",
                factory: value,
                ...(activeFactoryProcessTab === "issued"
                  ? {}
                  : { factoryTab: activeFactoryProcessTab }),
              },
              { replace: true },
            );
          }}
          tabs={warehouseBFactoryTabs}
          value={activeFactory}
        />

        <ModuleProcessTabs
          onChange={(value) => {
            setSearchParams(
              {
                section: "factory",
                factory: activeFactory,
                ...(value === "issued" ? {} : { factoryTab: value }),
              },
              { replace: true },
            );
          }}
          tabs={factoryProcessTabs}
          value={activeFactoryProcessTab}
        />
      </Stack>
    );
  }

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
  activeFactoryTitle,
  activeProcessTab,
  activeRawVeneerTitle,
  activeSection,
  warehouseName,
  warehouseRootPath,
}: {
  activeDefinitionSlug: string;
  activeDefinitionTitle: string;
  activeFactoryTitle: string;
  activeProcessTab: InventoryProcessTab;
  activeRawVeneerTitle: string | undefined;
  activeSection: WarehouseBSection;
  warehouseName: string;
  warehouseRootPath: string;
}) {
  if (activeSection === "factory") {
    return [
      {
        label: warehouseName,
        to: warehouseRootPath,
      },
      { label: "Factory" },
      { label: activeFactoryTitle },
    ];
  }

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
    { label: activeProcessTab === "history" ? "History" : "Stock" },
  ];
}

function getActiveWarehouseBSection(value: string | null): WarehouseBSection {
  return value === "factory" || value === "inspection" ? value : "inventory";
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

function getActiveWarehouseBFactory(
  value: string | null,
): WarehouseBFactorySlug {
  return value === "drying" ? "drying" : "slicing";
}

function getActiveFactoryProcessTab(value: string | null): FactoryProcessTab {
  if (
    value === "done" ||
    value === "history" ||
    value === "rejected"
  ) {
    return value;
  }

  return "issued";
}

function getWarehouseBRecordId(row: InventoryRecord) {
  const inventoryRecordId = row["inventoryRecordId"];

  if (typeof inventoryRecordId === "string" && inventoryRecordId.length > 0) {
    return inventoryRecordId.replace(/-production$/, "");
  }

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

function getWarehouseFactoryNextProcessActions(
  row: FactoryRecord,
  navigate: ReturnType<typeof useNavigate>,
  slug: string,
): readonly EnterpriseTableAction<FactoryRecord>[] {
  if (slug === "pressing") {
    return [
      createWarehouseFactoryIssueAction("CNC / Fluting", navigate),
      createWarehouseFactoryIssueAction("Embossing", navigate),
    ].filter((action) => canAccessPermission(action.permissionKey, "create"));
  }

  if (slug === "sample-sheets") {
    return [createWarehouseFactoryIssueAction("Finishing", navigate)].filter(
      (action) => canAccessPermission(action.permissionKey, "create"),
    );
  }

  const issuedFor =
    typeof row.issuedFor === "string" ? row.issuedFor.trim() : "";

  if (!issuedFor || !(issuedFor in warehouseFactoryNextProcessRouteMap)) {
    return [];
  }

  return [createWarehouseFactoryIssueAction(issuedFor, navigate)].filter(
    (action) => canAccessPermission(action.permissionKey, "create"),
  );
}

function createWarehouseFactoryIssueAction(
  issuedFor: string,
  navigate: ReturnType<typeof useNavigate>,
): EnterpriseTableAction<FactoryRecord> & { permissionKey?: string } {
  const route = warehouseFactoryNextProcessRouteMap[issuedFor]!;
  const permissionKey = getWarehouseIssueRoutePermissionKey(route);

  return {
    id: `issue-for-${issuedFor.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    label: `Issue for ${issuedFor}`,
    onSelect: () => navigate(route),
    ...(permissionKey ? { permissionKey } : {}),
  };
}

function getWarehouseIssueRoutePermissionKey(route: string) {
  if (route.startsWith("/factory/")) {
    return getFactoryPermissionKey(route.replace(/^\/factory\//, ""));
  }

  const permissionKeyByRoute: Record<string, string> = {
    "/dispatch": "dispatch",
    "/packing": "packing",
    "/qc/pending": "qcPending",
  };

  return permissionKeyByRoute[route];
}

const warehouseFactoryNextProcessRouteMap: Record<string, string> = {
  "CNC / Fluting": "/factory/cnc-fluting",
  Dispatch: "/dispatch",
  Drying: "/factory/drying",
  Embossing: "/factory/embossing",
  "Export / OEM": "/factory/export-oem",
  Finishing: "/factory/finishing",
  Grouping: "/factory/grouping",
  Inspection: "/qc/pending",
  Marquetry: "/factory/marquetry",
  Packing: "/packing",
  Pressing: "/factory/pressing",
  "Sample Sheets": "/factory/sample-sheets",
  Splicing: "/factory/splicing",
};
