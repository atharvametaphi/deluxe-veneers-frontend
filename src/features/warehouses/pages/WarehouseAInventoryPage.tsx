import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Download,
  Eye,
  FileOutput,
  Pencil,
  Plus,
  Search,
} from "lucide-react";
import {
  Button,
  InputAdornment,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router";

import {
  EnterpriseDataTable,
  type EnterpriseTableAction,
  type EnterpriseTableCellValue,
} from "../../../components/data-display/EnterpriseDataTable";
import { ModuleProcessTabs } from "../../../components/navigation/ModuleProcessTabs";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import { MasterPageShell } from "../../masters/shared";
import { getInventoryPaths } from "../../inventory/shared";
import {
  warehouseAInventoryConfigs,
  type WarehouseInventoryRow,
  type WarehouseAInventorySlug,
} from "../shared/warehouseTableData";

const warehouseATabs = [
  { label: "Veneer Blocks", value: "veneer-blocks" },
  { label: "Raw Veneer", value: "raw-veneer" },
  { label: "Plywood", value: "plywood" },
  { label: "MDF", value: "mdf" },
  { label: "Consumables", value: "consumables" },
] as const satisfies readonly {
  label: string;
  value: WarehouseAInventorySlug;
}[];

export function WarehouseAInventoryPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState("");
  const activeInventory = getActiveWarehouseAInventory(
    searchParams.get("inventory"),
  );
  const activeConfig = warehouseAInventoryConfigs[activeInventory];
  const filteredRows = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return activeConfig.rows;
    }

    return activeConfig.rows.filter((row) =>
      Object.values(row).some((value) =>
        formatInventorySearchValue(value).includes(normalizedSearch),
      ),
    );
  }, [activeConfig.rows, searchValue]);

  const rowActions = useMemo<
    ReadonlyArray<EnterpriseTableAction<WarehouseInventoryRow>>
  >(() => {
    const actions: EnterpriseTableAction<WarehouseInventoryRow>[] = [
      {
        id: "view",
        label: "View",
        icon: Eye,
        onSelect: (row) =>
          navigate(
            getInventoryPaths(row.inventorySlug, "issued", "warehouse-a").view(
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
            getInventoryPaths(row.inventorySlug, "issued", "warehouse-a").edit(
              row.inventoryRecordId,
            ),
          ),
      },
    ];

    if (activeInventory !== "consumables") {
      actions.push({
        id: "issue-for-qc",
        label: "Issue for QC",
        icon: BadgeCheck,
        onSelect: (row) =>
          navigate(`/qc/pending?inventory=${row.inventorySlug}`),
      });
    }

    return actions;
  }, [activeInventory, navigate]);

  return (
    <MasterPageShell
      breadcrumbs={[
        { label: "Warehouse A" },
        { label: activeConfig.title },
      ]}
      title="Warehouse A"
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
            <Button
              component={RouterLink}
              to={getInventoryPaths(activeInventory, "issued", "warehouse-a").add}
              startIcon={<Plus size={16} />}
              variant="contained"
            >
              Add Stock
            </Button>

            <Button variant="outlined" startIcon={<FileOutput size={16} />}>
              Export
            </Button>

            <Button variant="outlined" startIcon={<Download size={16} />}>
              Download
            </Button>
          </Stack>
        </Stack>

        <EnterpriseDataTable
          key={activeInventory}
          actions={rowActions}
          columns={activeConfig.columns}
          defaultRowsPerPage={10}
          initialSort={{ key: "inwardDate", direction: "desc" }}
          rows={filteredRows}
        />
      </Stack>
    </MasterPageShell>
  );
}

function getActiveWarehouseAInventory(
  value: string | null,
): WarehouseAInventorySlug {
  return value && value in warehouseAInventoryConfigs
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
