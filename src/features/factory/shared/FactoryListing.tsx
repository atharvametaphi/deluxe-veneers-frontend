import { useMemo, useState } from "react";
import { Stack } from "@mui/material";
import { Eye, Pencil, Plus, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router";

import { ModuleProcessTabs } from "../../../components/navigation/ModuleProcessTabs";
import {
  EnterpriseDataTable,
  type EnterpriseTableAction,
  type EnterpriseTableColumn,
} from "../../../components/data-display/EnterpriseDataTable";
import {
  canAccessPermission,
  getFactoryPermissionKey,
} from "../../permissions";
import { ClearableSearchField } from "../../shared/ClearableSearchField";
import { FactoryPageShell } from "./FactoryPageShell";
import { FactoryToolbar } from "./FactoryToolbar";
import {
  getFactoryPaths,
  getFactoryProcessTabs,
  getFactoryRowsForTab,
  type FactoryProcessTab,
} from "./factoryUtils";
import type { FactoryDefinition, FactoryRecord } from "./types";

interface FactoryListingProps<Row extends FactoryRecord> {
  definition: FactoryDefinition<Row>;
}

export function FactoryListing<Row extends FactoryRecord>({
  definition,
}: FactoryListingProps<Row>) {
  const navigate = useNavigate();
  const paths = getFactoryPaths(definition.slug);
  const permissionKey = getFactoryPermissionKey(definition.slug);
  const canCreate = canAccessPermission(permissionKey, "create");
  const canEdit = canAccessPermission(permissionKey, "edit");
  const canView = canAccessPermission(permissionKey, "view");
  const [activeTab, setActiveTab] = useState<FactoryProcessTab>("issued");
  const [searchValue, setSearchValue] = useState("");
  const [revertedRowIds, setRevertedRowIds] = useState<string[]>([]);
  const [inspectionDoneRowIds, setInspectionDoneRowIds] = useState<string[]>(
    [],
  );
  const isDryingDoneTab = definition.slug === "drying" && activeTab === "done";
  const tabs = useMemo(
    () => getFactoryProcessTabs(definition.title),
    [definition.title],
  );
  const tabRows = useMemo(() => {
    const rowsForTab = getFactoryRowsForTab(definition.rows, activeTab);

    return rowsForTab.filter((row) => !revertedRowIds.includes(row.id));
  }, [activeTab, definition.rows, revertedRowIds]);
  const filteredRows = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return tabRows;
    }

    return tabRows.filter((row) =>
      Object.values(row).some((value) =>
        formatFactorySearchValue(value).includes(normalizedSearch),
      ),
    );
  }, [searchValue, tabRows]);
  const tableColumns = useMemo<readonly EnterpriseTableColumn<Row>[]>(() => {
    if (!isDryingDoneTab) {
      return definition.listColumns;
    }

    const inspectionStatusColumn: EnterpriseTableColumn<Row> = {
      key: "inspectionStatus",
      label: "Inspection Status",
    };
    const remarkColumnIndex = definition.listColumns.findIndex(
      (column) => column.key === "remark",
    );

    if (remarkColumnIndex === -1) {
      return [...definition.listColumns, inspectionStatusColumn];
    }

    return [
      ...definition.listColumns.slice(0, remarkColumnIndex),
      inspectionStatusColumn,
      ...definition.listColumns.slice(remarkColumnIndex),
    ];
  }, [definition.listColumns, isDryingDoneTab]);
  const tableRows = useMemo<readonly Row[]>(() => {
    if (!isDryingDoneTab) {
      return filteredRows;
    }

    return filteredRows.map(
      (row) =>
        ({
          ...row,
          inspectionStatus: inspectionDoneRowIds.includes(row.id)
            ? "Done"
            : "Pending",
        }) as Row,
    );
  }, [filteredRows, inspectionDoneRowIds, isDryingDoneTab]);

  const rowActions = useMemo<ReadonlyArray<EnterpriseTableAction<Row>>>(
    () => {
      const baseActions: EnterpriseTableAction<Row>[] = [
        ...(canView
          ? [
              {
                id: "view",
                label: "View",
                icon: Eye,
                onSelect: (row: Row) => navigate(paths.view(row.id)),
              },
            ]
          : []),
        ...(canEdit
          ? [
              {
                id: "edit",
                label: "Edit",
                icon: Pencil,
                onSelect: (row: Row) => navigate(paths.edit(row.id)),
              },
            ]
          : []),
      ];

      if (activeTab === "issued" && canCreate) {
        baseActions.unshift({
          id: "create-process",
          label: `Create ${definition.title}`,
          icon: Plus,
          onSelect: (row) => navigate(paths.add, { state: { sourceRow: row } }),
        });
        baseActions.push({
          id: "revert-item",
          label: "Revert Item",
          icon: RotateCcw,
          onSelect: (row) =>
            setRevertedRowIds((current) =>
              current.includes(row.id) ? current : [...current, row.id],
            ),
        });
      }

      return baseActions;
    },
    [activeTab, canCreate, canEdit, canView, definition.title, navigate, paths],
  );

  const getRowActions = useMemo<
    ((row: Row) => readonly EnterpriseTableAction<Row>[]) | undefined
  >(() => {
    if (isDryingDoneTab) {
      return (row) => {
        const isInspectionDone = inspectionDoneRowIds.includes(row.id);
        const inspectionAction: EnterpriseTableAction<Row> = isInspectionDone
          ? {
              id: "move-to-warehouse-c",
              label: "Move to Warehouse C",
              onSelect: () =>
                navigate("/warehouse-c?section=inventory&inventory=raw-veneer"),
            }
          : {
              id: "mark-inspection-done",
              label: "Mark as Inspection Done",
              onSelect: (selectedRow) =>
                setInspectionDoneRowIds((current) =>
                  current.includes(selectedRow.id)
                    ? current
                    : [...current, selectedRow.id],
                ),
            };

        return [...rowActions, inspectionAction];
      };
    }

    if (activeTab !== "done") {
      return undefined;
    }

    return (row) => {
      const nextProcessActions = getFactoryNextProcessActions(
        row,
        navigate,
        definition.slug,
      );

      if (nextProcessActions.length === 0) {
        return rowActions;
      }

      return [...rowActions, ...nextProcessActions];
    };
  }, [
    activeTab,
    definition.slug,
    inspectionDoneRowIds,
    isDryingDoneTab,
    navigate,
    rowActions,
  ]);

  return (
    <FactoryPageShell
      breadcrumbs={[
        { label: "Factory", to: "/factory" },
        { label: definition.title },
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
          <FactoryToolbar />
        </Stack>

        <EnterpriseDataTable
          key={`${definition.slug}-${activeTab}`}
          actions={rowActions}
          columns={tableColumns}
          defaultRowsPerPage={10}
          rows={canView ? tableRows : []}
          {...(getRowActions ? { getRowActions } : {})}
          {...(definition.initialSort
            ? { initialSort: definition.initialSort }
            : {})}
        />
      </Stack>
    </FactoryPageShell>
  );
}

function formatFactorySearchValue(value: RowValue) {
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

type RowValue = RowLike[string];

interface RowLike {
  [key: string]: unknown;
}

function getFactoryNextProcessActions<Row extends FactoryRecord>(
  row: Row,
  navigate: ReturnType<typeof useNavigate>,
  slug: string,
): readonly EnterpriseTableAction<Row>[] {
  if (slug === "pressing") {
    return [
      createFactoryIssueAction<Row>("CNC / Fluting", navigate),
      createFactoryIssueAction<Row>("Embossing", navigate),
    ].filter((action) => canAccessPermission(action.permissionKey, "create"));
  }

  const issuedFor = typeof row.issuedFor === "string" ? row.issuedFor.trim() : "";

  if (!issuedFor || !(issuedFor in factoryNextProcessRouteMap)) {
    return [];
  }

  return [createFactoryIssueAction<Row>(issuedFor, navigate)].filter((action) =>
    canAccessPermission(action.permissionKey, "create"),
  );
}

function createFactoryIssueAction<Row extends FactoryRecord>(
  issuedFor: string,
  navigate: ReturnType<typeof useNavigate>,
): EnterpriseTableAction<Row> & { permissionKey?: string } {
  const route = factoryNextProcessRouteMap[issuedFor]!;
  const permissionKey = getIssueRoutePermissionKey(route);

  return {
    id: `issue-for-${issuedFor.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    label: `Issue for ${issuedFor}`,
    onSelect: () => navigate(route),
    ...(permissionKey ? { permissionKey } : {}),
  };
}

function getIssueRoutePermissionKey(route: string) {
  if (route.startsWith("/factory/")) {
    return getFactoryPermissionKey(route.replace(/^\/factory\//, ""));
  }

  const permissionKeyByRoute: Record<string, string> = {
    "/dispatch": "dispatch",
    "/packing": "packing",
    "/warehouse-b?section=inspection": "warehouseB",
  };

  return permissionKeyByRoute[route];
}

const factoryNextProcessRouteMap: Record<string, string> = {
  "CNC / Fluting": "/factory/cnc-fluting",
  Dispatch: "/dispatch",
  Drying: "/factory/drying",
  Embossing: "/factory/embossing",
  Finishing: "/factory/finishing",
  Grouping: "/factory/grouping",
  Inspection: "/warehouse-b?section=inspection",
  Marquetry: "/factory/marquetry",
  Packing: "/packing",
  Pressing: "/factory/pressing",
  Splicing: "/factory/splicing",
};
