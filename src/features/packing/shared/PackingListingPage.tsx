import { useMemo, useState } from "react";
import { Eye, Pencil, RotateCcw, Truck } from "lucide-react";
import { useNavigate } from "react-router";

import {
  EnterpriseDataTable,
  type EnterpriseTableAction,
} from "../../../components/data-display/EnterpriseDataTable";
import { ModuleProcessTabs } from "../../../components/navigation/ModuleProcessTabs";
import { MasterPageShell } from "../../masters/shared";
import {
  dispatchPackingRecord,
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
  const records = usePackingRecords();
  const navigate = useNavigate();
  const paths = getPackingPaths();
  const [activeTab, setActiveTab] = useState<PackingTabValue>("issued");

  const rows = useMemo(
    () =>
      records.filter((record) =>
        activeTab === "issued"
          ? record.packingState === "issued"
          : record.packingState === "done",
      ),
    [activeTab, records],
  );

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
        label: "Dispatch",
        icon: Truck,
        onSelect: (row) => dispatchPackingRecord(row.id),
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

      <EnterpriseDataTable
        actions={activeTab === "issued" ? issuedActions : doneActions}
        columns={packingListingColumns}
        defaultRowsPerPage={10}
        emptyStateLabel={`No records are currently available in ${activeTab === "issued" ? "Issued for Packing" : "Packing Done"}.`}
        initialSort={{ key: "updatedDate", direction: "desc" }}
        rows={rows}
      />
    </MasterPageShell>
  );
}
