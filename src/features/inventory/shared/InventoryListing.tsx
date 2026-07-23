import { useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import {
  InputAdornment,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router";

import {
  EnterpriseDataTable,
  type EnterpriseTableAction,
  type EnterpriseTableCellValue,
} from "../../../components/data-display/EnterpriseDataTable";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import {
  canAccessPermission,
  getWarehousePermissionKey,
} from "../../permissions";
import { InventoryPageShell } from "./InventoryPageShell";
import { InventoryToolbar } from "./InventoryToolbar";
import {
  getInventoryPaths,
  getInventoryProcessTab,
  getInventoryProcessTabs,
  getInventoryRowsForTab,
  getWarehouseBInventoryPath,
  getWarehouseBRootPath,
  type InventoryProcessTab,
} from "./inventoryUtils";
import type { InventoryDefinition, InventoryRecord } from "./types";
import { ModuleProcessTabs } from "../../../components/navigation/ModuleProcessTabs";

interface InventoryListingProps<Row extends InventoryRecord> {
  definition: InventoryDefinition<Row>;
}

export function InventoryListing<Row extends InventoryRecord>({
  definition,
}: InventoryListingProps<Row>) {
  const theme = useTheme();
  const navigate = useNavigate();
  const permissionKey = getWarehousePermissionKey("warehouse-b");
  const canCreate = canAccessPermission(permissionKey, "create");
  const canView = canAccessPermission(permissionKey, "view");
  const [activeTab, setActiveTab] = useState<InventoryProcessTab>(
    getInventoryProcessTab(null),
  );
  const paths = getInventoryPaths(definition.slug, activeTab);
  const [searchValue, setSearchValue] = useState("");
  const tabs = useMemo(
    () => getInventoryProcessTabs(definition.title),
    [definition.title],
  );
  const tabRows = useMemo(
    () => getInventoryRowsForTab(definition.rows, activeTab),
    [activeTab, definition.rows],
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

  const rowActions = useMemo<ReadonlyArray<EnterpriseTableAction<Row>>>(
    () =>
      canView
        ? [
            {
              id: "view",
              label: "View",
              icon: Eye,
              onSelect: (row: Row) => navigate(paths.view(row.id)),
            },
          ]
        : [],
    [canView, navigate, paths],
  );

  return (
    <InventoryPageShell
      actions={
        <InventoryToolbar
          addLabel="Add Stock"
          addPath={paths.add}
          canAdd={canCreate}
        />
      }
      breadcrumbs={[
        { label: "Warehouse B", to: getWarehouseBRootPath() },
        {
          label: definition.title,
          to: getWarehouseBInventoryPath(definition.slug),
        },
        { label: "Inventory" },
      ]}
      processTabs={
        <ModuleProcessTabs
          onChange={setActiveTab}
          tabs={tabs}
          value={activeTab}
        />
      }
      title={definition.title}
    >
      <Stack
        sx={(currentTheme) => ({
          gap: currentTheme.spacing(2),
        })}
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
                  <Search color={theme.customTokens.text.secondary} size={16} />
                </InputAdornment>
              ),
            },
          }}
        />

        <EnterpriseDataTable
          key={`${definition.slug}-${activeTab}`}
          actions={rowActions}
          columns={definition.listColumns}
          defaultRowsPerPage={10}
          emptyStateLabel={`No ${definition.title.toLowerCase()} records are available for this tab.`}
          rows={canView ? filteredRows : []}
          selectable={activeTab !== "history" && canView}
          {...(definition.initialSort
            ? { initialSort: definition.initialSort }
            : {})}
        />
      </Stack>
    </InventoryPageShell>
  );
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
