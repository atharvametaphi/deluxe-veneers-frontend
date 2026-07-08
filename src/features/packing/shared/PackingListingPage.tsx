import { useMemo, useState } from "react";
import {
  Button,
  InputAdornment,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { Eye, PackageOpen, Pencil, RotateCcw, Search, Truck } from "lucide-react";
import { useNavigate } from "react-router";

import {
  EnterpriseDataTable,
  type EnterpriseTableAction,
  type EnterpriseTableCellValue,
} from "../../../components/data-display/EnterpriseDataTable";
import { ModuleProcessTabs } from "../../../components/navigation/ModuleProcessTabs";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import { MasterPageShell } from "../../masters/shared";
import {
  getPackingPaths,
  packingListingColumns,
  revertPackingRecord,
  type PackingRecord,
  type PackingTabValue,
  usePackingRecords,
} from "./packingStore";

const packingTabs = [
  { label: "Issued for Packing", value: "issued" },
  { label: "Packing Done", value: "done" },
] as const satisfies readonly { label: string; value: PackingTabValue }[];

export function PackingListingPage() {
  const theme = useTheme();
  const records = usePackingRecords();
  const navigate = useNavigate();
  const paths = getPackingPaths();
  const [activeTab, setActiveTab] = useState<PackingTabValue>("issued");
  const [searchValue, setSearchValue] = useState("");

  const rows = useMemo(() => {
    const tabRows = records.filter((record) =>
        activeTab === "issued"
          ? record.packingState === "issued"
          : record.packingState === "done",
      );
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return tabRows;
    }

    return tabRows.filter((row) =>
      Object.values(row).some((value) =>
        formatPackingSearchValue(value).includes(normalizedSearch),
      ),
    );
  }, [activeTab, records, searchValue]);

  const issuedActions = useMemo<readonly EnterpriseTableAction<PackingRecord>[]>(
    () => [
      {
        id: "edit",
        label: "Edit",
        icon: Pencil,
        onSelect: (row) => navigate(paths.edit(row.id)),
      },
      {
        id: "view",
        label: "View",
        icon: Eye,
        onSelect: (row) => navigate(paths.view(row.id)),
      },
      {
        id: "revert",
        label: "Revert",
        icon: RotateCcw,
        onSelect: (row) => revertPackingRecord(row.id),
      },
    ],
    [navigate, paths],
  );

  const doneActions = useMemo<readonly EnterpriseTableAction<PackingRecord>[]>(
    () => [
      {
        id: "view",
        label: "View",
        icon: Eye,
        onSelect: (row) => navigate(paths.view(row.id)),
      },
      {
        id: "dispatch",
        label: "Create Dispatch",
        icon: Truck,
        onSelect: (row) => navigate(`/dispatch/add/${row.id}`),
      },
    ],
    [navigate, paths],
  );

  return (
    <MasterPageShell
      breadcrumbs={[{ label: "Packing" }]}
      title="Packing"
    >
      <ModuleProcessTabs
        onChange={setActiveTab}
        tabs={packingTabs}
        value={activeTab}
      />

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

          <Button
            onClick={() => navigate(paths.add())}
            startIcon={<PackageOpen size={16} />}
            variant="contained"
          >
            Create Packing
          </Button>
        </Stack>

        <EnterpriseDataTable
          actions={activeTab === "issued" ? issuedActions : doneActions}
          columns={packingListingColumns}
          defaultRowsPerPage={10}
          emptyStateLabel={`No records are currently available in ${activeTab === "issued" ? "Issued for Packing" : "Packing Done"}.`}
          initialSort={{ key: "updatedDate", direction: "desc" }}
          rows={rows}
        />
      </Stack>
    </MasterPageShell>
  );
}

function formatPackingSearchValue(value: EnterpriseTableCellValue) {
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
