import { useMemo, useState } from "react";
import {
  Button,
  InputAdornment,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { Eye, Pencil, RotateCcw, Search, Truck } from "lucide-react";
import { useNavigate } from "react-router";

import {
  EnterpriseDataTable,
  type EnterpriseTableAction,
  type EnterpriseTableCellValue,
} from "../../../components/data-display/EnterpriseDataTable";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import { MasterPageShell } from "../../masters/shared";
import {
  packingListingColumns,
  revertDispatchEntry,
  type PackingRecord,
  usePackingRecords,
} from "../../packing/shared/packingStore";
import { canAccessPermission } from "../../permissions";

export function DispatchPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const records = usePackingRecords();
  const [searchValue, setSearchValue] = useState("");
  const canCreate = canAccessPermission("dispatch", "create");
  const canEdit = canAccessPermission("dispatch", "edit");
  const canView = canAccessPermission("dispatch", "view");
  const eligibleRecord = useMemo(
    () => records.find((record) => record.packingState === "done"),
    [records],
  );
  const rows = useMemo(() => {
    const dispatchedRows = records.filter(
      (record) => record.packingState === "dispatched",
    );
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return dispatchedRows;
    }

    return dispatchedRows.filter((row) =>
      Object.values(row).some((value) =>
        formatDispatchSearchValue(value).includes(normalizedSearch),
      ),
    );
  }, [records, searchValue]);
  const rowActions = useMemo<ReadonlyArray<EnterpriseTableAction<PackingRecord>>>(
    () => [
      ...(canView
        ? [
            {
              id: "view",
              label: "View",
              icon: Eye,
              onSelect: (row: PackingRecord) => navigate(`/dispatch/view/${row.id}`),
            },
          ]
        : []),
      ...(canEdit
        ? [
            {
              id: "edit",
              label: "Edit",
              icon: Pencil,
              onSelect: (row: PackingRecord) => navigate(`/dispatch/edit/${row.id}`),
            },
            {
              id: "revert-dispatch",
              label: "Revert Dispatch",
              icon: RotateCcw,
              onSelect: (row: PackingRecord) => revertDispatchEntry(row.id),
            },
          ]
        : []),
    ],
    [canEdit, canView, navigate],
  );

  return (
    <MasterPageShell
      breadcrumbs={[{ label: "Dispatch" }]}
      title="Dispatch"
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

          {canCreate ? (
            <Button
              disabled={!eligibleRecord}
              onClick={() => {
                if (eligibleRecord) {
                  navigate(`/dispatch/add/${eligibleRecord.id}`);
                }
              }}
              startIcon={<Truck size={16} />}
              variant="contained"
            >
              Create Dispatch
            </Button>
          ) : null}
        </Stack>

        <EnterpriseDataTable
          actions={rowActions}
          columns={packingListingColumns}
          defaultRowsPerPage={10}
          emptyStateLabel="No dispatch records are available."
          initialSort={{ key: "updatedDate", direction: "desc" }}
          rows={canView ? rows : []}
        />
      </Stack>
    </MasterPageShell>
  );
}

function formatDispatchSearchValue(value: EnterpriseTableCellValue) {
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
