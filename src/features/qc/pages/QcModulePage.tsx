import { useMemo } from "react";
import { BadgeCheck, Warehouse } from "lucide-react";
import { Stack } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router";

import {
  EnterpriseDataTable,
  type EnterpriseTableAction,
} from "../../../components/data-display/EnterpriseDataTable";
import { ModuleProcessTabs } from "../../../components/navigation/ModuleProcessTabs";
import { MasterPageShell } from "../../masters/shared";
import {
  qcInventoryTabs,
  qcStageTitles,
  qcTableConfigs,
  type QcStage,
} from "../shared/qcTableData";
import type {
  WarehouseInventoryRow,
  WarehouseInventorySlug,
} from "../../warehouses/shared/warehouseTableData";

interface QcModulePageProps {
  stage: QcStage;
}

export function QcModulePage({ stage }: QcModulePageProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeInventory = getActiveQcInventory(searchParams.get("inventory"));
  const activeConfig = qcTableConfigs[stage][activeInventory];

  const rowActions = useMemo<
    ReadonlyArray<EnterpriseTableAction<WarehouseInventoryRow>>
  >(
    () =>
      stage === "pending"
        ? [
            {
              id: "mark-as-qc-done",
              label: "Mark as QC Done",
              icon: BadgeCheck,
              onSelect: () => navigate(`/qc/done?inventory=${activeInventory}`),
            },
          ]
        : [
            {
              id: "move-to-warehouse-b",
              label: "Move to Warehouse B",
              icon: Warehouse,
              onSelect: () => navigate(`/warehouse-b?inventory=${activeInventory}`),
            },
          ],
    [activeInventory, navigate, stage],
  );

  return (
    <MasterPageShell
      breadcrumbs={[
        { label: "QC", to: "/qc" },
        { label: qcStageTitles[stage] },
        { label: activeConfig.title },
      ]}
      title={qcStageTitles[stage]}
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
          tabs={qcInventoryTabs}
          value={activeInventory}
        />

        <EnterpriseDataTable
          key={`${stage}-${activeInventory}`}
          actions={rowActions}
          columns={activeConfig.columns}
          defaultRowsPerPage={10}
          initialSort={{ key: "inwardDate", direction: "desc" }}
          rows={activeConfig.rows}
        />
      </Stack>
    </MasterPageShell>
  );
}

function getActiveQcInventory(value: string | null): WarehouseInventorySlug {
  return value && value in qcTableConfigs.pending
    ? (value as WarehouseInventorySlug)
    : "veneer-blocks";
}
