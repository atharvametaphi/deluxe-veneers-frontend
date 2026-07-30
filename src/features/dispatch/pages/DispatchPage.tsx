import { useMemo, useState } from "react";
import {
  Button,
  Stack,
} from "@mui/material";
import { Eye, Pencil, RotateCcw, Truck } from "lucide-react";
import { useNavigate } from "react-router";

import {
  EnterpriseDataTable,
  type EnterpriseTableAction,
  type EnterpriseTableCellValue,
  type EnterpriseTableColumn,
} from "../../../components/data-display/EnterpriseDataTable";
import { MasterPageShell } from "../../masters/shared";
import {
  revertDispatchEntry,
  type PackingRecord,
  usePackingRecords,
} from "../../packing/shared/packingStore";
import { canAccessPermission } from "../../permissions";
import { listingToolbarButtonSx } from "../../shared/buttonStyles";
import { ClearableSearchField } from "../../shared/ClearableSearchField";

interface DispatchListingRow extends PackingRecord {
  dispatchGrandTotal: string;
  dispatchTotalQuantity: string;
  dispatchTotalSqf: string;
  dispatchTransportMode: string;
  dispatchTransporter: string;
}

const dispatchListingColumns: readonly EnterpriseTableColumn<DispatchListingRow>[] =
  [
    { key: "orderType", label: "Order Category" },
    { key: "productCategory", label: "Product Category" },
    { key: "customerName", label: "Customer Name" },
    { key: "dispatchTransporter", label: "Transporter" },
    { key: "dispatchTransportMode", label: "Transport Mode" },
    { key: "dispatchTotalQuantity", label: "Total Quantity" },
    { key: "dispatchTotalSqf", label: "Total SQF" },
    { key: "dispatchGrandTotal", label: "Grand Total" },
    { key: "remark", label: "Remark" },
    { key: "createdBy", label: "Created By" },
    { key: "updatedBy", label: "Updated By" },
    { key: "createdDate", label: "Created Date" },
    { key: "updatedDate", label: "Updated Date" },
  ];

export function DispatchPage() {
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
    const dispatchedRows = records
      .filter((record) => record.packingState === "dispatched")
      .map(mapDispatchListingRow);
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
  const rowActions = useMemo<ReadonlyArray<EnterpriseTableAction<DispatchListingRow>>>(
    () => [
      ...(canView
        ? [
            {
              id: "view",
              label: "View",
              icon: Eye,
              onSelect: (row: DispatchListingRow) =>
                navigate(`/dispatch/view/${row.id}`),
            },
          ]
        : []),
      ...(canEdit
        ? [
            {
              id: "edit",
              label: "Edit",
              icon: Pencil,
              onSelect: (row: DispatchListingRow) =>
                navigate(`/dispatch/edit/${row.id}`),
            },
            {
              id: "revert-dispatch",
              label: "Revert Dispatch",
              icon: RotateCcw,
              onSelect: (row: DispatchListingRow) => revertDispatchEntry(row.id),
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
          <ClearableSearchField
            value={searchValue}
            onChange={setSearchValue}
            sx={{
              width: { xs: "100%", md: 320 },
              maxWidth: "100%",
            }}
          />

          {canCreate ? (
            <Button
              disabled={!eligibleRecord}
              onClick={() => navigate("/dispatch/add")}
              startIcon={<Truck size={16} />}
              sx={listingToolbarButtonSx}
              variant="contained"
            >
              Create Dispatch
            </Button>
          ) : null}
        </Stack>

        <EnterpriseDataTable
          actions={rowActions}
          columns={dispatchListingColumns}
          defaultRowsPerPage={10}
          emptyStateLabel="No dispatch records are available."
          initialSort={{ key: "updatedDate", direction: "desc" }}
          rows={canView ? rows : []}
        />
      </Stack>
    </MasterPageShell>
  );
}

function mapDispatchListingRow(record: PackingRecord): DispatchListingRow {
  const amount = parseAmount(record.amount);

  return {
    ...record,
    dispatchGrandTotal:
      record.dispatchGrandTotal ?? formatAmount(amount * 1.18),
    dispatchTotalQuantity: record.dispatchTotalQuantity ?? record.noOfSheets,
    dispatchTotalSqf: record.dispatchTotalSqf ?? record.sqf,
    dispatchTransportMode: record.dispatchTransportMode || "-",
    dispatchTransporter: record.dispatchTransporter || "-",
  };
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

function parseAmount(value: string) {
  const numericValue = Number(value.replace(/,/g, ""));
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatAmount(value: number) {
  return value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}
