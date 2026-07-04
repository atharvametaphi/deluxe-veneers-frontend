import { useMemo } from "react";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router";

import {
  EnterpriseDataTable,
  type EnterpriseTableAction,
} from "../../../components/data-display/EnterpriseDataTable";
import { MasterPageShell } from "../../masters/shared";
import {
  getPackingPaths,
  packingListingColumns,
  type PackingRecord,
  usePackingRecords,
} from "../../packing/shared/packingStore";

export function DispatchPage() {
  const navigate = useNavigate();
  const paths = getPackingPaths();
  const records = usePackingRecords();
  const rows = useMemo(
    () => records.filter((record) => record.packingState === "dispatched"),
    [records],
  );
  const rowActions = useMemo<ReadonlyArray<EnterpriseTableAction<PackingRecord>>>(
    () => [
      {
        id: "view",
        label: "View",
        icon: Eye,
        onSelect: (row) => navigate(paths.view(row.id)),
      },
    ],
    [navigate, paths],
  );

  return (
    <MasterPageShell
      breadcrumbs={[{ label: "Dispatch" }]}
      title="Dispatch"
    >
      <EnterpriseDataTable
        actions={rowActions}
        columns={packingListingColumns}
        defaultRowsPerPage={10}
        emptyStateLabel="No dispatch records are available."
        initialSort={{ key: "updatedDate", direction: "desc" }}
        rows={rows}
      />
    </MasterPageShell>
  );
}
