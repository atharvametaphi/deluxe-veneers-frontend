import { useMemo, useState } from "react";
import {
  Box,
  Button,
  InputAdornment,
  Typography,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import {
  Download,
  Eye,
  FileOutput,
  Search,
} from "lucide-react";
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
  InventoryPageShell,
  mdfDefinition,
  plywoodDefinition,
  rawVeneerDefinition,
  veneerBlocksDefinition,
} from "../../inventory/shared";
import {
  getWarehouseBInventoryPath,
  getWarehouseBRootPath,
  getInventoryProcessTab,
  getInventoryPaths,
  getInventoryRowsForTab,
  type InventoryProcessTab,
} from "../../inventory/shared/inventoryUtils";
import type { InventoryDefinition, InventoryRecord } from "../../inventory/shared/types";

type WarehouseBInventorySlug =
  | "mdf"
  | "plywood"
  | "raw-veneer"
  | "veneer-blocks";

const warehouseBProcessTabs = [
  { label: "Inventory", value: "issued" },
  { label: "History", value: "history" },
] as const satisfies readonly {
  label: string;
  value: InventoryProcessTab;
}[];

const inventoryDefinitions = {
  "veneer-blocks": veneerBlocksDefinition,
  "raw-veneer": rawVeneerDefinition,
  plywood: plywoodDefinition,
  mdf: mdfDefinition,
} satisfies Record<WarehouseBInventorySlug, InventoryDefinition<any>>;

export function WarehouseBInventoryPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState("");
  const [selectedRows, setSelectedRows] = useState<InventoryRecord[]>([]);

  const activeInventory = getActiveInventoryTab(searchParams.get("inventory"));
  const activeProcessTab = getInventoryProcessTab(searchParams.get("tab"));
  const activeDefinition = inventoryDefinitions[activeInventory];
  const activeRows = activeDefinition.rows as readonly InventoryRecord[];
  const activeColumns =
    activeDefinition.listColumns as readonly EnterpriseTableColumn<InventoryRecord>[];
  const paths = getInventoryPaths(activeDefinition.slug, activeProcessTab);

  const tabRows = useMemo(
    () => getInventoryRowsForTab(activeRows, activeProcessTab),
    [activeProcessTab, activeRows],
  );

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return tabRows;
    }

    return tabRows.filter((row) =>
      Object.values(row).some((value) =>
        formatInventorySearchValue(value).includes(normalizedSearch),
      ),
    );
  }, [searchValue, tabRows]);

  const rowActions = useMemo<ReadonlyArray<EnterpriseTableAction<any>>>(
    () => {
      const baseActions: EnterpriseTableAction<any>[] = [
        {
          id: "view",
          label: "View",
          icon: Eye,
          onSelect: (row) => navigate(paths.view(row.id)),
        },
      ];

      if (activeProcessTab === "history") {
        return baseActions;
      }

      if (
        activeInventory === "veneer-blocks" &&
        activeProcessTab === "issued"
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
    },
    [activeInventory, activeProcessTab, navigate, paths],
  );

  const showBulkIssueForSlicing =
    activeInventory === "veneer-blocks" &&
    activeProcessTab === "issued" &&
    selectedRows.length > 1;

  return (
    <InventoryPageShell
      breadcrumbs={[
        {
          label: "Warehouse B",
          to: getWarehouseBRootPath(),
        },
        {
          label: activeDefinition.title,
          to: getWarehouseBInventoryPath(activeDefinition.slug),
        },
        { label: activeProcessTab === "history" ? "History" : "Inventory" },
      ]}
      processTabs={
        <Stack
          sx={(currentTheme) => ({
            gap: currentTheme.spacing(0),
          })}
        >
          <ModuleProcessTabs
            onChange={(value) => {
              setSearchParams(
                {
                  inventory: activeInventory,
                  tab: value,
                },
                { replace: true },
              );
            }}
            tabs={warehouseBProcessTabs}
            value={activeProcessTab}
          />
        </Stack>
      }
      title="Warehouse B"
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

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            useFlexGap
            sx={{ alignItems: { xs: "stretch", lg: "center" } }}
          >
            <Button variant="outlined" startIcon={<FileOutput size={16} />}>
              Export
            </Button>

            <Button variant="outlined" startIcon={<Download size={16} />}>
              Download
            </Button>
          </Stack>
        </Stack>

        <EnterpriseDataTable
          key={`${activeInventory}-${activeProcessTab}`}
          actions={rowActions}
          columns={activeColumns}
          defaultRowsPerPage={10}
          emptyStateLabel={`No ${activeDefinition.title.toLowerCase()} records are available for this tab.`}
          onSelectionChange={setSelectedRows}
          rows={filteredRows}
          selectable={activeProcessTab !== "history"}
          {...(activeDefinition.initialSort
            ? { initialSort: activeDefinition.initialSort }
            : {})}
        />

        {showBulkIssueForSlicing ? (
          <Box
            sx={{
              position: "sticky",
              bottom: theme.spacing(2),
              alignSelf: "center",
              width: "min(100%, 680px)",
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
          </Box>
        ) : null}
      </Stack>
    </InventoryPageShell>
  );
}

function getActiveInventoryTab(value: string | null): WarehouseBInventorySlug {
  return value && value in inventoryDefinitions
    ? (value as WarehouseBInventorySlug)
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
