import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, RotateCcw } from "lucide-react";
import { Stack } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router";

import {
  EnterpriseDataTable,
  type EnterpriseTableAction,
} from "../../../components/data-display/EnterpriseDataTable";
import { ModuleProcessTabs } from "../../../components/navigation/ModuleProcessTabs";
import {
  cncFlutingDefinition,
  embossingDefinition,
  finishingDefinition,
  getFactoryPaths,
  getFactoryProcessTabs,
  getFactoryRowsForTab,
  groupingDefinition,
  marquetryDefinition,
  pressingDefinition,
  sampleSheetsDefinition,
  splicingDefinition,
  type FactoryProcessTab,
  type FactoryRecord,
} from "../../factory/shared";
import { getInventoryPaths } from "../../inventory/shared";
import { MasterPageShell } from "../../masters/shared";
import {
  warehouseCInventoryConfigs,
  type WarehouseInventoryRow,
  type WarehouseCInventorySlug,
} from "../shared/warehouseTableData";

type WarehouseCSection = "factory" | "inventory";
type WarehouseCFactorySlug =
  | "cnc-fluting"
  | "embossing"
  | "finishing"
  | "grouping"
  | "marquetry"
  | "pressing"
  | "sample-sheets"
  | "splicing";

const warehouseCInventoryTabs = [
  { label: "Raw Veneer", value: "raw-veneer" },
  { label: "Plywood", value: "plywood" },
  { label: "MDF", value: "mdf" },
] as const satisfies readonly {
  label: string;
  value: WarehouseCInventorySlug;
}[];

const warehouseCFactoryTabs = [
  { label: "Marquetry", value: "marquetry" },
  { label: "Grouping", value: "grouping" },
  { label: "Sample Sheets", value: "sample-sheets" },
  { label: "Splicing", value: "splicing" },
  { label: "Pressing", value: "pressing" },
  { label: "CNC/Fluting", value: "cnc-fluting" },
  { label: "Embossing", value: "embossing" },
  { label: "Finishing", value: "finishing" },
] as const satisfies readonly {
  label: string;
  value: WarehouseCFactorySlug;
}[];

const warehouseCFactoryDefinitions = {
  marquetry: marquetryDefinition,
  grouping: groupingDefinition,
  "sample-sheets": sampleSheetsDefinition,
  splicing: splicingDefinition,
  pressing: pressingDefinition,
  "cnc-fluting": cncFlutingDefinition,
  embossing: embossingDefinition,
  finishing: finishingDefinition,
} as const;

export function WarehouseCInventoryPage() {
  return <WarehouseCInventoryModulePage />;
}

interface WarehouseCInventoryModulePageProps {
  warehouseName?: string;
}

export function WarehouseCInventoryModulePage({
  warehouseName = "Warehouse C",
}: WarehouseCInventoryModulePageProps = {}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = getActiveWarehouseCSection(searchParams.get("section"));
  const activeInventory = getActiveWarehouseCInventory(
    searchParams.get("inventory"),
  );
  const activeFactory = getActiveWarehouseCFactory(searchParams.get("factory"));
  const activeFactoryProcessTab = getActiveWarehouseCFactoryProcessTab(
    searchParams.get("factoryTab"),
  );
  const activeInventoryConfig = warehouseCInventoryConfigs[activeInventory];
  const activeFactoryDefinition = warehouseCFactoryDefinitions[activeFactory];
  const factoryProcessTabs = useMemo(
    () => getFactoryProcessTabs(activeFactoryDefinition.title),
    [activeFactoryDefinition.title],
  );

  const inventoryRowActions = useMemo<
    ReadonlyArray<EnterpriseTableAction<WarehouseInventoryRow>>
  >(
    () => [
      {
        id: "view",
        label: "View",
        icon: Eye,
        onSelect: (row) =>
          navigate(
            getInventoryPaths(row.inventorySlug, "issued", "warehouse-c").view(
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
            getInventoryPaths(row.inventorySlug, "issued", "warehouse-c").edit(
              row.inventoryRecordId,
            ),
          ),
      },
    ],
    [navigate],
  );

  const factoryPaths = getFactoryPaths(activeFactoryDefinition.slug);
  const [revertedFactoryRowIds, setRevertedFactoryRowIds] = useState<string[]>(
    [],
  );
  const factoryRows = useMemo(
    () => getFactoryRowsForTab(activeFactoryDefinition.rows, activeFactoryProcessTab),
    [activeFactoryDefinition.rows, activeFactoryProcessTab],
  );
  const factoryRowActions = useMemo<
    ReadonlyArray<EnterpriseTableAction<FactoryRecord>>
  >(() => {
    const baseActions: EnterpriseTableAction<FactoryRecord>[] = [
      {
        id: "view",
        label: "View",
        icon: Eye,
        onSelect: (row) => navigate(factoryPaths.view(row.id)),
      },
      {
        id: "edit",
        label: "Edit",
        icon: Pencil,
        onSelect: (row) => navigate(factoryPaths.edit(row.id)),
      },
    ];

    if (activeFactoryProcessTab === "issued") {
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
      const nextProcessActions = getWarehouseCFactoryNextProcessActions(
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

  return (
    <MasterPageShell
      breadcrumbs={
        activeSection === "factory"
          ? [
              { label: warehouseName },
              { label: "Factory" },
              { label: activeFactoryDefinition.title },
            ]
          : [
              { label: warehouseName },
              { label: "Inventory" },
              { label: activeInventoryConfig.title },
            ]
      }
      title={warehouseName}
    >
      <Stack
        sx={(theme) => ({
          gap: theme.spacing(2),
        })}
      >
        {activeSection === "factory" ? (
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
              tabs={warehouseCFactoryTabs}
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
        ) : (
          <ModuleProcessTabs
            onChange={(value) => {
              setSearchParams(
                {
                  section: "inventory",
                  inventory: value,
                },
                { replace: true },
              );
            }}
            tabs={warehouseCInventoryTabs}
            value={activeInventory}
          />
        )}

        {activeSection === "factory" ? (
          <EnterpriseDataTable
            key={`${activeFactory}-${activeFactoryProcessTab}`}
            actions={factoryRowActions}
            columns={activeFactoryDefinition.listColumns}
            defaultRowsPerPage={10}
            rows={factoryRows.filter(
              (row) => !revertedFactoryRowIds.includes(row.id),
            )}
            {...(getFactoryRowActions
              ? { getRowActions: getFactoryRowActions }
              : {})}
            {...(activeFactoryDefinition.initialSort
              ? { initialSort: activeFactoryDefinition.initialSort }
              : {})}
          />
        ) : (
          <EnterpriseDataTable
            key={activeInventory}
            actions={inventoryRowActions}
            columns={activeInventoryConfig.columns}
            defaultRowsPerPage={10}
            initialSort={{ key: "inwardDate", direction: "desc" }}
            rows={activeInventoryConfig.rows}
          />
        )}
      </Stack>
    </MasterPageShell>
  );
}

function getActiveWarehouseCSection(value: string | null): WarehouseCSection {
  return value === "factory" ? "factory" : "inventory";
}

function getActiveWarehouseCInventory(
  value: string | null,
): WarehouseCInventorySlug {
  return value && value in warehouseCInventoryConfigs
    ? (value as WarehouseCInventorySlug)
    : "raw-veneer";
}

function getActiveWarehouseCFactory(value: string | null): WarehouseCFactorySlug {
  return value && value in warehouseCFactoryDefinitions
    ? (value as WarehouseCFactorySlug)
    : "marquetry";
}

function getActiveWarehouseCFactoryProcessTab(
  value: string | null,
): FactoryProcessTab {
  if (
    value === "done" ||
    value === "history" ||
    value === "rejected"
  ) {
    return value;
  }

  return "issued";
}

function getWarehouseCFactoryNextProcessActions(
  row: FactoryRecord,
  navigate: ReturnType<typeof useNavigate>,
  slug: string,
): readonly EnterpriseTableAction<FactoryRecord>[] {
  if (slug === "pressing") {
    return [
      createWarehouseCFactoryIssueAction("CNC / Fluting", navigate),
      createWarehouseCFactoryIssueAction("Embossing", navigate),
    ];
  }

  if (slug === "sample-sheets") {
    return [createWarehouseCFactoryIssueAction("Finishing", navigate)];
  }

  const issuedFor =
    typeof row.issuedFor === "string" ? row.issuedFor.trim() : "";

  if (!issuedFor || !(issuedFor in warehouseCFactoryNextProcessRouteMap)) {
    return [];
  }

  return [createWarehouseCFactoryIssueAction(issuedFor, navigate)];
}

function createWarehouseCFactoryIssueAction(
  issuedFor: string,
  navigate: ReturnType<typeof useNavigate>,
): EnterpriseTableAction<FactoryRecord> {
  return {
    id: `issue-for-${issuedFor.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    label: `Issue for ${issuedFor}`,
    onSelect: () => navigate(warehouseCFactoryNextProcessRouteMap[issuedFor]!),
  };
}

const warehouseCFactoryNextProcessRouteMap: Record<string, string> = {
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
