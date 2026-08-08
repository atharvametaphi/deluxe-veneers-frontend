import { useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Eye, Pencil, Plus, RotateCcw, XCircle } from "lucide-react";
import { useNavigate } from "react-router";

import {
  ErpDatePickerField,
  ErpSelectField,
} from "../../../pages/ComponentLibrary/shared/ErpFieldControls";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
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
import {
  getOrderLineItems,
  useOrderRecords,
  type OrderLineItem,
  type OrderRecord,
} from "../../orders/shared/ordersStore";
import { ClearableSearchField } from "../../shared/ClearableSearchField";
import { recordFormActionButtonSx } from "../../shared/buttonStyles";
import { FactoryPageShell } from "./FactoryPageShell";
import { FactoryToolbar } from "./FactoryToolbar";
import {
  getFactoryPaths,
  getFactoryProcessTabs,
  getFactoryRowsForTab,
  getGroupingProcessTabs,
  getSampleSheetsProcessTabs,
  type FactoryProcessTab,
  type GroupingListingTab,
} from "./factoryUtils";
import {
  appendGroupedStockSampleIssue,
  buildSampleSheetSourceRowFromIssue,
  getAvailableGroupedSheets,
  getOriginalGroupedSheets,
  useGroupedStockSampleIssues,
} from "./groupedStockIssueStore";
import {
  appendSampleSheetOrderAllocation,
  getAvailableSampleSheetSheets,
  getOriginalSampleSheetSheets,
  useSampleSheetOrderAllocations,
} from "./sampleSheetOrderAllocationStore";
import {
  formatSampleSheetProcessLabel,
  getDownstreamRouteAfterSampleAllocation,
  isSampleSheetCompatibleWithFinishedType,
  resolveSampleSheetProcessType,
  type SampleSheetProcessType,
} from "./sampleSheetProcessType";
import type { FactoryDefinition, FactoryRecord } from "./types";

type ListingTab = FactoryProcessTab | GroupingListingTab;

interface FactoryListingProps<Row extends FactoryRecord> {
  definition: FactoryDefinition<Row>;
}

export function FactoryListing<Row extends FactoryRecord>({
  definition,
}: FactoryListingProps<Row>) {
  const navigate = useNavigate();
  const orderRecords = useOrderRecords();
  const paths = getFactoryPaths(definition.slug);
  const permissionKey = getFactoryPermissionKey(definition.slug);
  const canCreate = canAccessPermission(permissionKey, "create");
  const canEdit = canAccessPermission(permissionKey, "edit");
  const canView = canAccessPermission(permissionKey, "view");
  const [activeTab, setActiveTab] = useState<ListingTab>("issued");
  const [searchValue, setSearchValue] = useState("");
  const [revertedRowIds, setRevertedRowIds] = useState<string[]>([]);
  const [rejectedDoneRows, setRejectedDoneRows] = useState<Row[]>([]);
  const [inspectionDoneRowIds, setInspectionDoneRowIds] = useState<string[]>(
    () =>
      definition.slug === "drying"
        ? ["drying-done-2", "drying-done-5", "drying-done-8"]
        : [],
  );
  const [groupingSampleIssue, setGroupingSampleIssue] =
    useState<GroupingSampleIssueState<Row> | null>(null);
  const [splicingOrderIssue, setSplicingOrderIssue] =
    useState<SplicingOrderIssueState<Row> | null>(null);
  const [sampleSheetOrderAllocation, setSampleSheetOrderAllocation] =
    useState<SampleSheetOrderAllocationState<Row> | null>(null);
  const groupedStockIssues = useGroupedStockSampleIssues();
  const sampleSheetOrderAllocations = useSampleSheetOrderAllocations();
  const isGroupingModule = definition.slug === "grouping";
  const isSampleSheetsModule = definition.slug === "sample-sheets";
  const isDryingDoneTab = definition.slug === "drying" && activeTab === "done";
  const shouldUsePressingIssuedForLabels =
    definition.slug === "pressing" &&
    (activeTab === "issued" || activeTab === "done");
  const tabs = useMemo(() => {
    if (isGroupingModule) {
      return getGroupingProcessTabs();
    }

    if (isSampleSheetsModule) {
      return getSampleSheetsProcessTabs();
    }

    return getFactoryProcessTabs(definition.title);
  }, [definition.title, isGroupingModule, isSampleSheetsModule]);
  const rejectedDoneRowIds = useMemo(
    () => new Set(rejectedDoneRows.map((row) => row.id)),
    [rejectedDoneRows],
  );
  const tabRows = useMemo(() => {
    if (isGroupingModule && activeTab === "sample-issued") {
      return groupedStockIssues.map((issue) => {
        const sourceRow =
          definition.rows.find((row) => row.id === issue.groupingRowId) ??
          (issue.sourceSnapshot as Row);

        return {
          ...sourceRow,
          id: issue.id,
          noOfSheets: String(issue.issueSheets),
          availableSheets: String(issue.issueSheets),
          issuedDate: new Date(issue.issueDate),
          status: "Issued for Sample Sheet",
          listingState: "sample-issued",
          remark: `Issued ${issue.issueSheets} sheets for Sample Sheet`,
        } as Row;
      });
    }

    const listingTab: FactoryProcessTab =
      activeTab === "sample-issued" ? "done" : activeTab;
    const rowsForTab =
      listingTab === "rejected"
        ? [...getFactoryRowsForTab(definition.rows, listingTab), ...rejectedDoneRows]
        : getFactoryRowsForTab(definition.rows, listingTab);

    return rowsForTab
      .filter(
        (row) =>
          !revertedRowIds.includes(row.id) &&
          !(listingTab === "done" && rejectedDoneRowIds.has(row.id)),
      )
      .filter((row) => {
        if (listingTab !== "done") {
          return true;
        }

        if (isGroupingModule) {
          return getAvailableGroupedSheets(row) > 0;
        }

        if (isSampleSheetsModule) {
          return getAvailableSampleSheetSheets(row) > 0;
        }

        return true;
      })
      .map((row) => {
        if (listingTab !== "done") {
          return row;
        }

        if (isGroupingModule) {
          const available = getAvailableGroupedSheets(row);
          const original = getOriginalGroupedSheets(row);

          return {
            ...row,
            availableSheets: String(available),
            noOfSheets: String(original),
            status: "Grouped Stock Available",
          } as Row;
        }

        if (isSampleSheetsModule) {
          const available = getAvailableSampleSheetSheets(row);
          const original = getOriginalSampleSheetSheets(row);
          const sampleProcessType = resolveSampleSheetProcessType(row);

          return {
            ...row,
            availableSheets: String(available),
            noOfSheets: String(original),
            sampleProcessType: sampleProcessType ?? row.sampleProcessType,
            status: formatSampleSheetProcessLabel(sampleProcessType),
          } as Row;
        }

        return row;
      });
  }, [
    activeTab,
    definition.rows,
    groupedStockIssues,
    isGroupingModule,
    isSampleSheetsModule,
    rejectedDoneRowIds,
    rejectedDoneRows,
    revertedRowIds,
    sampleSheetOrderAllocations,
  ]);
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
    if ((isGroupingModule || isSampleSheetsModule) && activeTab === "done") {
      const availableColumn: EnterpriseTableColumn<Row> = {
        key: "availableSheets",
        label: "Available Sheets",
      };
      const processTypeColumn: EnterpriseTableColumn<Row> = {
        key: "sampleProcessType",
        label: "Sample Type",
      };
      const sheetsIndex = definition.listColumns.findIndex(
        (column) => column.key === "noOfSheets",
      );
      const withAvailable =
        sheetsIndex === -1
          ? [...definition.listColumns, availableColumn]
          : [
              ...definition.listColumns.slice(0, sheetsIndex + 1),
              availableColumn,
              ...definition.listColumns.slice(sheetsIndex + 1),
            ];

      if (!isSampleSheetsModule) {
        return withAvailable;
      }

      const issuedForIndex = withAvailable.findIndex(
        (column) => column.key === "issuedFor",
      );

      if (issuedForIndex === -1) {
        return [processTypeColumn, ...withAvailable];
      }

      return [
        ...withAvailable.slice(0, issuedForIndex),
        processTypeColumn,
        ...withAvailable.slice(issuedForIndex),
      ];
    }

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
  }, [
    activeTab,
    definition.listColumns,
    isDryingDoneTab,
    isGroupingModule,
    isSampleSheetsModule,
  ]);
  const tableRows = useMemo<readonly Row[]>(() => {
    if (shouldUsePressingIssuedForLabels) {
      return filteredRows.map(
        (row) =>
          ({
            ...row,
            issuedFor: getPressingDoneIssuedForLabel(row.issuedFor),
          }) as Row,
      );
    }

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
  }, [
    filteredRows,
    inspectionDoneRowIds,
    isDryingDoneTab,
    shouldUsePressingIssuedForLabels,
  ]);

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
          tone: "primary",
          onSelect: (row) => navigate(paths.add, { state: { sourceRow: row } }),
        });
        baseActions.push({
          id: "revert-item",
          label: "Revert Item",
          icon: RotateCcw,
          tone: "danger",
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
    const rejectDoneAction = createRejectFactoryAction<Row>(
      definition.title,
      (selectedRow) => {
        setRejectedDoneRows((current) =>
          current.some((row) => row.id === selectedRow.id)
            ? current
            : [
                ...current,
                {
                  ...selectedRow,
                  listingState: "rejected",
                } as Row,
              ],
        );
        setActiveTab("rejected");
      },
    );
    const doneActions = canEdit || canCreate ? [...rowActions, rejectDoneAction] : rowActions;

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

        return [...doneActions, inspectionAction];
      };
    }

    if (definition.slug === "finishing" && activeTab === "done") {
      return (row) => [
        ...rowActions,
        ...(canCreate
          ? [
              {
                id: "revert-item",
                label: "Revert Item",
                icon: RotateCcw,
                tone: "danger",
                onSelect: (selectedRow: Row) =>
                  setRevertedRowIds((current) =>
                    current.includes(selectedRow.id)
                      ? current
                      : [...current, selectedRow.id],
                  ),
              },
              createSplicingOrderIssueAction<Row>((selectedRow) =>
                setSplicingOrderIssue({
                  issueDate: new Date(),
                  issueSheets: "",
                  orderItemNo: "",
                  orderNo: "",
                  orderType: "",
                  row: selectedRow,
                  submitted: false,
                }),
              ),
            ]
          : []),
        ...(canEdit || canCreate ? [rejectDoneAction] : []),
      ];
    }

    if (isGroupingModule && activeTab === "sample-issued") {
      return (row) => [
        ...rowActions,
        ...(canAccessPermission(getFactoryPermissionKey("sample-sheets"), "create")
          ? [
              {
                id: "create-sample-sheet",
                label: "Create Sample Sheet",
                icon: Plus,
                tone: "primary",
                onSelect: (selectedRow: Row) => {
                  const issue = groupedStockIssues.find(
                    (entry) => entry.id === selectedRow.id,
                  );

                  if (!issue) {
                    return;
                  }

                  navigate("/factory/sample-sheets/add", {
                    state: {
                      sourceRow: buildSampleSheetSourceRowFromIssue(issue),
                      issueSheets: issue.issueSheets,
                      issueDate: new Date(issue.issueDate),
                      groupedStockIssueId: issue.id,
                    },
                  });
                },
              },
            ]
          : []),
      ];
    }

    if (activeTab !== "done") {
      return undefined;
    }

    return (row) => {
      const nextProcessActions = getFactoryNextProcessActions(
        row,
        navigate,
        definition.slug,
        (selectedRow) =>
          setGroupingSampleIssue({
            issueDate: new Date(),
            issueSheets: "",
            row: selectedRow,
            submitted: false,
          }),
        (selectedRow) =>
          setSplicingOrderIssue({
            issueDate: new Date(),
            issueSheets: "",
            orderItemNo: "",
            orderNo: "",
            orderType: "",
            row: selectedRow,
            submitted: false,
          }),
        (selectedRow) =>
          setSampleSheetOrderAllocation({
            allocateSheets: "",
            orderItemNo: "",
            orderNo: "",
            row: selectedRow,
            submitted: false,
          }),
      );

      if (nextProcessActions.length === 0) {
        return doneActions;
      }

      return [...doneActions, ...nextProcessActions];
    };
  }, [
    activeTab,
    canCreate,
    canEdit,
    definition.slug,
    definition.title,
    groupedStockIssues,
    inspectionDoneRowIds,
    isDryingDoneTab,
    isGroupingModule,
    navigate,
    rowActions,
  ]);

  const handleCloseSampleSheetOrderAllocation = () => {
    setSampleSheetOrderAllocation(null);
  };
  const handleSubmitSampleSheetOrderAllocation = () => {
    if (!sampleSheetOrderAllocation) {
      return;
    }

    const sampleProcessType = resolveSampleSheetProcessType(
      sampleSheetOrderAllocation.row,
    );
    const selectedOrder = getFinishedOrderByNo(
      orderRecords,
      sampleSheetOrderAllocation.orderNo,
    );
    const selectedOrderItem = getCompatibleFinishedOrderItem(
      orderRecords,
      sampleSheetOrderAllocation,
      sampleProcessType,
    );
    const availableSampleSheets = getAvailableSampleSheetSheets(
      sampleSheetOrderAllocation.row,
    );
    const orderRequiredSheets = selectedOrderItem
      ? getOrderLineItemSheetsNumber(selectedOrderItem)
      : 0;
    const maxAllocatable = Math.min(availableSampleSheets, orderRequiredSheets);
    const allocateSheets = Number(sampleSheetOrderAllocation.allocateSheets);
    const hasValidAllocateSheets =
      sampleSheetOrderAllocation.allocateSheets.length > 0 &&
      Number.isInteger(allocateSheets) &&
      allocateSheets > 0 &&
      allocateSheets <= maxAllocatable &&
      Boolean(selectedOrder) &&
      Boolean(selectedOrderItem) &&
      Boolean(sampleProcessType);

    if (!hasValidAllocateSheets || !sampleProcessType || !selectedOrderItem) {
      setSampleSheetOrderAllocation((current) =>
        current ? { ...current, submitted: true } : current,
      );
      return;
    }

    appendSampleSheetOrderAllocation({
      allocatedSheets: allocateSheets,
      orderItemNo: sampleSheetOrderAllocation.orderItemNo,
      orderNo: sampleSheetOrderAllocation.orderNo,
      sampleProcessType,
      sampleSheetRowId: String(sampleSheetOrderAllocation.row.id),
    });

    const downstream = getDownstreamRouteAfterSampleAllocation(sampleProcessType);
    const sourceRow = buildSampleSheetOrderAllocationSourceRow(
      sampleSheetOrderAllocation,
      selectedOrder,
      selectedOrderItem,
      sampleProcessType,
      allocateSheets,
    );

    setSampleSheetOrderAllocation(null);
    navigate(downstream.path, {
      state: {
        sourceRow,
        issueSheets: allocateSheets,
        allocatedFromSampleSheet: true,
        sampleSheetRef: sampleSheetOrderAllocation.row.id,
        sampleProcessType,
        orderNo: sampleSheetOrderAllocation.orderNo,
        orderItemNo: sampleSheetOrderAllocation.orderItemNo,
      },
    });
  };
  const handleCloseGroupingSampleIssue = () => {
    setGroupingSampleIssue(null);
  };
  const handleSubmitGroupingSampleIssue = () => {
    if (!groupingSampleIssue) {
      return;
    }

    const availableSheets = getAvailableGroupedSheets(groupingSampleIssue.row);
    const issueSheets = Number(groupingSampleIssue.issueSheets);
    const hasValidIssueSheets =
      groupingSampleIssue.issueSheets.length > 0 &&
      Number.isInteger(issueSheets) &&
      issueSheets > 0 &&
      issueSheets <= availableSheets;

    if (!hasValidIssueSheets) {
      setGroupingSampleIssue((current) =>
        current ? { ...current, submitted: true } : current,
      );
      return;
    }

    const issue = appendGroupedStockSampleIssue({
      groupingRowId: String(groupingSampleIssue.row.id),
      issueDate: groupingSampleIssue.issueDate,
      issueSheets,
      sourceRow: groupingSampleIssue.row,
    });

    setGroupingSampleIssue(null);
    navigate("/factory/sample-sheets/add", {
      state: {
        sourceRow: buildSampleSheetSourceRowFromIssue(issue),
        issueSheets,
        issueDate: groupingSampleIssue.issueDate,
        groupedStockIssueId: issue.id,
      },
    });
  };
  const handleCloseSplicingOrderIssue = () => {
    setSplicingOrderIssue(null);
  };
  const handleSubmitSplicingOrderIssue = () => {
    if (!splicingOrderIssue) {
      return;
    }

    const selectedOrder = getSplicingSelectedOrder(
      orderRecords,
      splicingOrderIssue.orderNo,
    );
    const selectedOrderItem = getSplicingSelectedOrderItem(
      orderRecords,
      splicingOrderIssue,
    );
    const availableSheets = selectedOrderItem
      ? getOrderLineItemSheetsNumber(selectedOrderItem)
      : 0;
    const issueSheets = Number(splicingOrderIssue.issueSheets);
    const hasValidIssueSheets =
      splicingOrderIssue.issueSheets.length === 0 ||
      (Number.isInteger(issueSheets) &&
        issueSheets > 0 &&
        issueSheets <= availableSheets);

    if (!hasValidIssueSheets) {
      setSplicingOrderIssue((current) =>
        current ? { ...current, submitted: true } : current,
      );
      return;
    }

    setSplicingOrderIssue(null);
    navigate(getSplicingOrderIssueRoute(splicingOrderIssue.orderType), {
      state: {
        sourceRow: selectedOrderItem
          ? buildSplicingOrderIssueSourceRow(
              splicingOrderIssue,
              selectedOrder,
              selectedOrderItem,
            )
          : undefined,
      },
    });
  };

  return (
    <>
      <FactoryPageShell
        breadcrumbs={[
          { label: "Factory", to: "/factory" },
          { label: definition.title },
        ]}
        processTabs={
          <ModuleProcessTabs
            onChange={(value) => setActiveTab(value as ListingTab)}
            tabs={tabs}
            value={activeTab}
          />
        }
        title={definition.title}
        subtitle={
          isGroupingModule
            ? "Track grouped stock and Sample Sheet issues."
            : isSampleSheetsModule
              ? "Reusable Sample Sheet stock for matching Finished Orders."
              : `Track ${definition.title.toLowerCase()} jobs and completed production.`
        }
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
            spacing={1.5}
          >
            <ClearableSearchField
              value={searchValue}
              onChange={setSearchValue}
              placeholder={`Search ${definition.title.toLowerCase()}...`}
              sx={{
                width: { xs: "100%", sm: 300 },
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
            emptyStateLabel={`No ${definition.title.toLowerCase()} records are available for this tab.`}
            rows={canView ? tableRows : []}
            {...(getRowActions ? { getRowActions } : {})}
            {...(definition.initialSort
              ? { initialSort: definition.initialSort }
              : {})}
          />
        </Stack>
      </FactoryPageShell>

      <GroupingSampleIssueDialog
        onChange={setGroupingSampleIssue}
        onClose={handleCloseGroupingSampleIssue}
        onSubmit={handleSubmitGroupingSampleIssue}
        state={groupingSampleIssue}
      />

      <SplicingOrderIssueDialog
        onChange={setSplicingOrderIssue}
        onClose={handleCloseSplicingOrderIssue}
        onSubmit={handleSubmitSplicingOrderIssue}
        orderRecords={orderRecords}
        state={splicingOrderIssue}
      />

      <SampleSheetOrderAllocationDialog
        onChange={setSampleSheetOrderAllocation}
        onClose={handleCloseSampleSheetOrderAllocation}
        onSubmit={handleSubmitSampleSheetOrderAllocation}
        orderRecords={orderRecords}
        state={sampleSheetOrderAllocation}
      />
    </>
  );
}

interface GroupingSampleIssueState<Row extends FactoryRecord> {
  issueDate: Date | null;
  issueSheets: string;
  row: Row;
  submitted: boolean;
}

interface SampleSheetOrderAllocationState<Row extends FactoryRecord> {
  allocateSheets: string;
  orderItemNo: string;
  orderNo: string;
  row: Row;
  submitted: boolean;
}

interface SplicingOrderIssueState<Row extends FactoryRecord> {
  issueDate: Date | null;
  issueSheets: string;
  orderItemNo: string;
  orderNo: string;
  orderType: string;
  row: Row;
  submitted: boolean;
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

function getPressingDoneIssuedForLabel(value: RowValue) {
  const issuedFor = typeof value === "string" ? value.trim() : "";

  if (issuedFor === "Fluted") {
    return "CNC/Fluting";
  }

  if (issuedFor === "Embossed") {
    return "Embossing";
  }

  return issuedFor;
}

function getFactoryNextProcessActions<Row extends FactoryRecord>(
  row: Row,
  navigate: ReturnType<typeof useNavigate>,
  slug: string,
  onOpenGroupingSampleIssue: (row: Row) => void,
  onOpenSplicingOrderIssue: (row: Row) => void,
  onOpenSampleSheetOrderAllocation: (row: Row) => void,
): readonly EnterpriseTableAction<Row>[] {
  if (slug === "pressing") {
    return getPressingNextProcessActions(row, navigate);
  }

  if (slug === "grouping") {
    return [createGroupingSampleIssueAction<Row>(onOpenGroupingSampleIssue)].filter(
      (action) => canAccessPermission(action.permissionKey, "create"),
    );
  }

  if (slug === "sample-sheets") {
    return getSampleSheetNextProcessActions(
      row,
      navigate,
      onOpenSampleSheetOrderAllocation,
    );
  }

  if (slug === "splicing") {
    const canIssueForOrder =
      canAccessPermission(getFactoryPermissionKey("marquetry"), "create") ||
      canAccessPermission(getFactoryPermissionKey("pressing"), "create");

    return canIssueForOrder
      ? [createSplicingOrderIssueAction<Row>(onOpenSplicingOrderIssue)]
      : [];
  }

  const issuedFor = typeof row.issuedFor === "string" ? row.issuedFor.trim() : "";

  if (
    !issuedFor ||
    issuedFor === "Packing" ||
    !(issuedFor in factoryNextProcessRouteMap)
  ) {
    return [];
  }

  return [createFactoryIssueAction<Row>(issuedFor, navigate)].filter((action) =>
    canAccessPermission(action.permissionKey, "create"),
  );
}

function getSampleSheetNextProcessActions<Row extends FactoryRecord>(
  row: Row,
  navigate: ReturnType<typeof useNavigate>,
  onOpenSampleSheetOrderAllocation: (row: Row) => void,
) {
  const allocateAction = createSampleSheetOrderAllocateAction<Row>(
    onOpenSampleSheetOrderAllocation,
  );
  const sampleProcessType = resolveSampleSheetProcessType(row);
  const issuedFor = typeof row.issuedFor === "string" ? row.issuedFor.trim() : "";
  const preferredRoutes =
    issuedFor && issuedFor in factoryNextProcessRouteMap
      ? [issuedFor]
      : sampleProcessType === "Finishing"
        ? ["Packing"]
        : sampleProcessType === "Marquetry"
          ? ["Pressing"]
          : sampleProcessType === "Fluting"
            ? ["Finishing", "CNC / Fluting"]
            : sampleProcessType === "Embossing"
              ? ["Finishing", "Embossing"]
              : ["Finishing", "CNC / Fluting", "Embossing"];

  const processActions = preferredRoutes
    .map((process) =>
      process === "Packing"
        ? createFactoryIssueAction<Row>(process, navigate)
        : createFactoryIssueActionWithSource<Row>(process, navigate),
    )
    .filter((action) => canAccessPermission(action.permissionKey, "create"));

  return [allocateAction, ...processActions];
}

function createSampleSheetOrderAllocateAction<Row extends FactoryRecord>(
  onOpenSampleSheetOrderAllocation: (row: Row) => void,
): EnterpriseTableAction<Row> {
  return {
    id: "allocate-sample-sheet-to-order",
    label: "Allocate to Order",
    icon: Plus,
    tone: "primary",
    onSelect: onOpenSampleSheetOrderAllocation,
  };
}

function createFactoryIssueActionWithSource<Row extends FactoryRecord>(
  issuedFor: string,
  navigate: ReturnType<typeof useNavigate>,
): EnterpriseTableAction<Row> & { permissionKey?: string } {
  const route = factoryNextProcessRouteMap[issuedFor]!;
  const permissionKey = getIssueRoutePermissionKey(route);

  return {
    id: `issue-for-${issuedFor.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    label: `Issue for ${issuedFor}`,
    icon: Plus,
    tone: "primary",
    onSelect: (row) =>
      navigate(`${route}/add`, {
        state: {
          sourceRow: row,
        },
      }),
    ...(permissionKey ? { permissionKey } : {}),
  };
}

function getPressingNextProcessActions<Row extends FactoryRecord>(
  row: Row,
  navigate: ReturnType<typeof useNavigate>,
) {
  const issuedFor = typeof row.issuedFor === "string" ? row.issuedFor.trim() : "";
  const nextProcessesByOrderType: Record<string, readonly string[]> = {
    "CNC / Fluting": ["CNC/Fluting"],
    "CNC/Fluting": ["CNC/Fluting"],
    Decorative: ["Finishing"],
    Embossed: ["Embossing"],
    Embossing: ["Embossing"],
    Fluted: ["CNC / Fluting"],
    Marquetry: [],
  };
  const nextProcesses =
    issuedFor in nextProcessesByOrderType
      ? nextProcessesByOrderType[issuedFor]!
      : ["CNC / Fluting", "Embossing"];

  return nextProcesses
    .map((process) => createFactoryIssueAction<Row>(process, navigate))
    .filter((action) => canAccessPermission(action.permissionKey, "create"));
}

function createGroupingSampleIssueAction<Row extends FactoryRecord>(
  onOpenGroupingSampleIssue: (row: Row) => void,
): EnterpriseTableAction<Row> & { permissionKey?: string } {
  const permissionKey = getFactoryPermissionKey("sample-sheets");

  return {
    id: "issue-for-sample-sheet",
    label: "Issue for Sample Sheet",
    icon: Plus,
    tone: "primary",
    onSelect: onOpenGroupingSampleIssue,
    ...(permissionKey ? { permissionKey } : {}),
  };
}

function createSplicingOrderIssueAction<Row extends FactoryRecord>(
  onOpenSplicingOrderIssue: (row: Row) => void,
): EnterpriseTableAction<Row> {
  return {
    id: "issue-for-order",
    label: "Issue For Order",
    icon: Plus,
    tone: "primary",
    onSelect: onOpenSplicingOrderIssue,
  };
}

function createRejectFactoryAction<Row extends FactoryRecord>(
  processName: string,
  onReject: (row: Row) => void,
): EnterpriseTableAction<Row> {
  return {
    id: `reject-${processName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    label: `Reject ${processName}`,
    icon: XCircle,
    tone: "danger",
    onSelect: onReject,
  };
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
    icon: Plus,
    tone: "primary",
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
  "CNC/Fluting": "/factory/cnc-fluting",
  Dispatch: "/dispatch",
  Drying: "/factory/drying",
  Embossing: "/factory/embossing",
  Finishing: "/factory/finishing",
  Grouping: "/factory/grouping",
  Inspection: "/warehouse-b?section=inspection",
  Marquetry: "/factory/marquetry",
  Packing: "/packing",
  Pressing: "/factory/pressing",
  "Sample Sheets": "/factory/sample-sheets",
  Splicing: "/factory/splicing",
};

function GroupingSampleIssueDialog<Row extends FactoryRecord>({
  onChange,
  onClose,
  onSubmit,
  state,
}: {
  onChange: Dispatch<SetStateAction<GroupingSampleIssueState<Row> | null>>;
  onClose: () => void;
  onSubmit: () => void;
  state: GroupingSampleIssueState<Row> | null;
}) {
  const availableSheetsNumber = state
    ? getAvailableGroupedSheets(state.row)
    : 0;
  const availableSheets = String(availableSheetsNumber);
  const originalSheets = state ? getOriginalGroupedSheets(state.row) : 0;
  const issueSheetsNumber = Number(state?.issueSheets ?? "");
  const hasIssueSheetsValue = Boolean(state?.issueSheets);
  const exceedsAvailableSheets =
    hasIssueSheetsValue && issueSheetsNumber > availableSheetsNumber;
  const hasIssueSheetsError = Boolean(
    exceedsAvailableSheets ||
      (state?.submitted &&
      (!state.issueSheets ||
        !Number.isInteger(issueSheetsNumber) ||
        issueSheetsNumber <= 0)),
  );

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      onClose={onClose}
      open={Boolean(state)}
      slotProps={{
        paper: {
          sx: (theme) => ({
            border: `1px solid ${theme.customTokens.borders.default}`,
            borderRadius: `${theme.customTokens.radius.md}px`,
            boxShadow: theme.shadows[0],
            outline: "none",
            "&:focus, &:focus-visible": {
              outline: "none",
            },
          }),
        },
      }}
    >
      <DialogTitle
        sx={(theme) => ({
          borderBottom: `1px solid ${theme.customTokens.borders.default}`,
          fontSize: theme.typography.h3.fontSize,
          fontWeight: 700,
          px: theme.spacing(2),
          py: theme.spacing(1.5),
        })}
      >
        Issue for Sample Sheet
      </DialogTitle>

      <DialogContent
        sx={(theme) => ({
          px: theme.spacing(2),
          py: `${theme.spacing(2)} !important`,
        })}
      >
        <Box
          sx={(theme) => ({
            display: "grid",
            gap: theme.spacing(2),
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
          })}
        >
          <Stack spacing={0.75}>
            <DialogFieldLabel>Issue Date</DialogFieldLabel>
            <ErpDatePickerField
              size="dense"
              value={state?.issueDate ?? null}
              onChange={(value) =>
                onChange((current) =>
                  current ? { ...current, issueDate: value } : current,
                )
              }
            />
          </Stack>

          <Stack spacing={0.75}>
            <DialogFieldLabel>Grouped Stock Sheets</DialogFieldLabel>
            <TextField
              fullWidth
              value={String(originalSheets)}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              sx={(theme) => getCompactFieldSx(theme, "readOnly")}
            />
          </Stack>

          <Stack spacing={0.75}>
            <DialogFieldLabel>Available Sheets</DialogFieldLabel>
            <TextField
              fullWidth
              value={availableSheets}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              sx={(theme) => getCompactFieldSx(theme, "readOnly")}
            />
          </Stack>

          <Stack spacing={0.75}>
            <DialogFieldLabel>Issue No of Sheets</DialogFieldLabel>
            <TextField
              autoFocus
              error={hasIssueSheetsError}
              fullWidth
              helperText={
                hasIssueSheetsError
                  ? exceedsAvailableSheets
                    ? "Issue sheets cannot exceed available sheets."
                    : "Enter a valid whole number."
                  : " "
              }
              value={state?.issueSheets ?? ""}
              onChange={(event) => {
                const nextValue = event.target.value.replace(/\D/g, "");
                onChange((current) =>
                  current ? { ...current, issueSheets: nextValue } : current,
                );
              }}
              slotProps={{
                htmlInput: {
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                },
              }}
              sx={(theme) =>
                getCompactFieldSx(theme, hasIssueSheetsError ? "error" : "default")
              }
            />
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions
        sx={(theme) => ({
          borderTop: `1px solid ${theme.customTokens.borders.default}`,
          px: theme.spacing(2),
          py: theme.spacing(1.5),
        })}
      >
        <Button
          type="button"
          onClick={onClose}
          sx={recordFormActionButtonSx}
          variant="outlined"
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={onSubmit}
          sx={recordFormActionButtonSx}
          variant="contained"
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function SampleSheetOrderAllocationDialog<Row extends FactoryRecord>({
  onChange,
  onClose,
  onSubmit,
  orderRecords,
  state,
}: {
  onChange: Dispatch<SetStateAction<SampleSheetOrderAllocationState<Row> | null>>;
  onClose: () => void;
  onSubmit: () => void;
  orderRecords: readonly OrderRecord[];
  state: SampleSheetOrderAllocationState<Row> | null;
}) {
  const sampleProcessType = state
    ? resolveSampleSheetProcessType(state.row)
    : null;
  const availableSampleSheets = state
    ? getAvailableSampleSheetSheets(state.row)
    : 0;
  const orderNumberOptions = state
    ? getCompatibleFinishedOrderNumberOptions(orderRecords, sampleProcessType)
    : [];
  const orderItemOptions =
    state?.orderNo
      ? getCompatibleFinishedOrderItemNumberOptions(
          orderRecords,
          state.orderNo,
          sampleProcessType,
        )
      : [];
  const selectedOrderItem = state
    ? getCompatibleFinishedOrderItem(orderRecords, state, sampleProcessType)
    : null;
  const orderRequiredSheets = selectedOrderItem
    ? getOrderLineItemSheetsNumber(selectedOrderItem)
    : 0;
  const maxAllocatable = Math.min(availableSampleSheets, orderRequiredSheets);
  const allocateSheetsNumber = Number(state?.allocateSheets ?? "");
  const hasAllocateSheetsValue = Boolean(state?.allocateSheets);
  const exceedsMaxAllocatable =
    hasAllocateSheetsValue && allocateSheetsNumber > maxAllocatable;
  const hasAllocateSheetsError = Boolean(
    exceedsMaxAllocatable ||
      (state?.submitted &&
        (!state.allocateSheets ||
          !Number.isInteger(allocateSheetsNumber) ||
          allocateSheetsNumber <= 0 ||
          !state.orderNo ||
          !state.orderItemNo)),
  );
  const showAllocationTable = Boolean(
    state?.orderNo && state.orderItemNo && selectedOrderItem,
  );
  const downstream = getDownstreamRouteAfterSampleAllocation(sampleProcessType);

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      onClose={onClose}
      open={Boolean(state)}
      slotProps={{
        paper: {
          sx: (theme) => ({
            border: `1px solid ${theme.customTokens.borders.default}`,
            borderRadius: `${theme.customTokens.radius.md}px`,
            boxShadow: theme.shadows[0],
            outline: "none",
            "&:focus, &:focus-visible": {
              outline: "none",
            },
          }),
        },
      }}
    >
      <DialogTitle
        sx={(theme) => ({
          borderBottom: `1px solid ${theme.customTokens.borders.default}`,
          fontSize: theme.typography.h3.fontSize,
          fontWeight: 700,
          px: theme.spacing(2),
          py: theme.spacing(1.5),
        })}
      >
        Allocate Sample Sheet to Order
      </DialogTitle>

      <DialogContent
        sx={(theme) => ({
          px: theme.spacing(2),
          py: `${theme.spacing(2)} !important`,
        })}
      >
        <Stack sx={(theme) => ({ gap: theme.spacing(2) })}>
          <Box
            sx={(theme) => ({
              display: "grid",
              gap: theme.spacing(2),
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
            })}
          >
            <Stack spacing={0.75}>
              <DialogFieldLabel>Sample Type</DialogFieldLabel>
              <TextField
                fullWidth
                value={formatSampleSheetProcessLabel(sampleProcessType)}
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
                sx={(theme) => getCompactFieldSx(theme, "readOnly")}
              />
            </Stack>

            <Stack spacing={0.75}>
              <DialogFieldLabel>Available Sample Sheets</DialogFieldLabel>
              <TextField
                fullWidth
                value={String(availableSampleSheets)}
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
                sx={(theme) => getCompactFieldSx(theme, "readOnly")}
              />
            </Stack>

            <Stack spacing={0.75}>
              <DialogFieldLabel>Order No</DialogFieldLabel>
              <ErpSelectField
                onChange={(value) =>
                  onChange((current) =>
                    current
                      ? {
                          ...current,
                          allocateSheets: "",
                          orderItemNo: "",
                          orderNo: value,
                        }
                      : current,
                  )
                }
                options={orderNumberOptions}
                size="dense"
                state={orderNumberOptions.length === 0 ? "disabled" : "default"}
                value={state?.orderNo ?? ""}
              />
            </Stack>

            <Stack spacing={0.75}>
              <DialogFieldLabel>Order Item No</DialogFieldLabel>
              <ErpSelectField
                onChange={(value) =>
                  onChange((current) =>
                    current
                      ? {
                          ...current,
                          allocateSheets: "",
                          orderItemNo: value,
                        }
                      : current,
                  )
                }
                options={orderItemOptions}
                size="dense"
                state={!state?.orderNo ? "disabled" : "default"}
                value={state?.orderItemNo ?? ""}
              />
            </Stack>
          </Box>

          {showAllocationTable ? (
            <Box
              sx={(theme) => ({
                border: `1px solid ${theme.customTokens.borders.default}`,
                borderRadius: `${theme.customTokens.radius.md}px`,
                overflow: "hidden",
              })}
            >
              <Box sx={getDialogScrollableTableSx}>
                <Table
                  size="small"
                  sx={{
                    minWidth: 720,
                    tableLayout: "auto",
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell sx={getDialogHeaderCellSx}>Item Name</TableCell>
                      <TableCell sx={getDialogHeaderCellSx}>
                        Finished Type
                      </TableCell>
                      <TableCell sx={getDialogHeaderCellSx}>
                        Order Sheets
                      </TableCell>
                      <TableCell sx={getDialogHeaderCellSx}>
                        Max Allocatable
                      </TableCell>
                      <TableCell sx={getDialogHeaderCellSx}>
                        Allocate Sheets
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={getDialogBodyCellSx}>
                        {selectedOrderItem?.itemName || "-"}
                      </TableCell>
                      <TableCell sx={getDialogBodyCellSx}>
                        {selectedOrderItem?.finishedType || "-"}
                      </TableCell>
                      <TableCell sx={getDialogBodyCellSx}>
                        {String(orderRequiredSheets)}
                      </TableCell>
                      <TableCell sx={getDialogBodyCellSx}>
                        {String(maxAllocatable)}
                      </TableCell>
                      <TableCell sx={getDialogBodyCellSx}>
                        <TextField
                          autoFocus
                          error={hasAllocateSheetsError}
                          fullWidth
                          helperText={
                            hasAllocateSheetsError
                              ? exceedsMaxAllocatable
                                ? "Cannot allocate more than available Sample Sheet stock or order requirement."
                                : "Enter a valid whole number."
                              : `Next stage: ${downstream.label}`
                          }
                          value={state?.allocateSheets ?? ""}
                          onChange={(event) => {
                            const nextValue = event.target.value.replace(/\D/g, "");
                            onChange((current) =>
                              current
                                ? { ...current, allocateSheets: nextValue }
                                : current,
                            );
                          }}
                          slotProps={{
                            htmlInput: {
                              inputMode: "numeric",
                              pattern: "[0-9]*",
                            },
                          }}
                          sx={(theme) =>
                            getCompactFieldSx(
                              theme,
                              hasAllocateSheetsError ? "error" : "default",
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </Box>
          ) : null}

          {orderNumberOptions.length === 0 ? (
            <Typography
              sx={(theme) => ({
                color: theme.customTokens.text.secondary,
                fontSize: theme.typography.caption.fontSize,
              })}
            >
              No Finished Orders with a matching {formatSampleSheetProcessLabel(sampleProcessType)} requirement are available.
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={(theme) => ({
          borderTop: `1px solid ${theme.customTokens.borders.default}`,
          px: theme.spacing(2),
          py: theme.spacing(1.5),
        })}
      >
        <Button
          type="button"
          onClick={onClose}
          sx={recordFormActionButtonSx}
          variant="outlined"
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={onSubmit}
          sx={recordFormActionButtonSx}
          variant="contained"
        >
          Allocate
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function SplicingOrderIssueDialog<Row extends FactoryRecord>({
  onChange,
  onClose,
  onSubmit,
  orderRecords,
  state,
}: {
  onChange: Dispatch<SetStateAction<SplicingOrderIssueState<Row> | null>>;
  onClose: () => void;
  onSubmit: () => void;
  orderRecords: readonly OrderRecord[];
  state: SplicingOrderIssueState<Row> | null;
}) {
  const orderNumberOptions = state?.orderType
    ? getSplicingOrderNumberOptions(orderRecords, state.orderType)
    : [];
  const orderItemOptions =
    state?.orderType && state.orderNo
      ? getSplicingOrderItemNumberOptions(
          orderRecords,
          state.orderType,
          state.orderNo,
        )
      : [];
  const selectedOrderItem = state
    ? getSplicingSelectedOrderItem(orderRecords, state)
    : null;
  const availableSheets = selectedOrderItem
    ? getOrderLineItemSheetsLabel(selectedOrderItem)
    : "";
  const availableSheetsNumber = selectedOrderItem
    ? getOrderLineItemSheetsNumber(selectedOrderItem)
    : 0;
  const issueSheetsNumber = Number(state?.issueSheets ?? "");
  const hasIssueSheetsValue = Boolean(state?.issueSheets);
  const exceedsAvailableSheets =
    hasIssueSheetsValue && issueSheetsNumber > availableSheetsNumber;
  const hasIssueSheetsError = Boolean(
    exceedsAvailableSheets ||
      (state?.submitted &&
        (!state.issueSheets ||
          !Number.isInteger(issueSheetsNumber) ||
          issueSheetsNumber <= 0)),
  );
  const showOrderItemTable = Boolean(
    state?.orderType &&
      state.orderNo &&
      state.orderItemNo &&
      selectedOrderItem,
  );

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      onClose={onClose}
      open={Boolean(state)}
      slotProps={{
        paper: {
          sx: (theme) => ({
            border: `1px solid ${theme.customTokens.borders.default}`,
            borderRadius: `${theme.customTokens.radius.md}px`,
            boxShadow: theme.shadows[0],
            maxWidth: "calc(100vw - 48px)",
            width: {
              xs: "calc(100vw - 24px)",
              lg: "min(1400px, calc(100vw - 64px))",
            },
            outline: "none",
            "&:focus, &:focus-visible": {
              outline: "none",
            },
          }),
        },
      }}
    >
      <DialogTitle
        sx={(theme) => ({
          borderBottom: `1px solid ${theme.customTokens.borders.default}`,
          fontSize: theme.typography.h3.fontSize,
          fontWeight: 700,
          px: theme.spacing(2),
          py: theme.spacing(1.5),
        })}
      >
        Issue for Order
      </DialogTitle>

      <DialogContent
        sx={(theme) => ({
          px: theme.spacing(2),
          py: `${theme.spacing(2)} !important`,
        })}
      >
        <Stack sx={(theme) => ({ gap: theme.spacing(2) })}>
          <Box
            sx={(theme) => ({
              display: "grid",
              gap: theme.spacing(2),
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(4, minmax(0, 1fr))",
              },
            })}
          >
            <Stack spacing={0.75}>
              <DialogFieldLabel>Issued Date</DialogFieldLabel>
              <ErpDatePickerField
                size="dense"
                value={state?.issueDate ?? null}
                onChange={(value) =>
                  onChange((current) =>
                    current ? { ...current, issueDate: value } : current,
                  )
                }
              />
            </Stack>

            <Stack spacing={0.75}>
              <DialogFieldLabel>Order Type</DialogFieldLabel>
              <ErpSelectField
                onChange={(value) =>
                  onChange((current) =>
                    current
                      ? {
                          ...current,
                          issueSheets: "",
                          orderItemNo: "",
                          orderNo: "",
                          orderType: value,
                        }
                      : current,
                  )
                }
                options={splicingOrderTypeOptions}
                size="dense"
                state="default"
                value={state?.orderType ?? ""}
              />
            </Stack>

            <Stack spacing={0.75}>
              <DialogFieldLabel>Order No</DialogFieldLabel>
              <ErpSelectField
                onChange={(value) =>
                  onChange((current) =>
                    current
                      ? {
                          ...current,
                          issueSheets: "",
                          orderItemNo: "",
                          orderNo: value,
                        }
                      : current,
                  )
                }
                options={orderNumberOptions}
                size="dense"
                state={!state?.orderType ? "disabled" : "default"}
                value={state?.orderNo ?? ""}
              />
            </Stack>

            <Stack spacing={0.75}>
              <DialogFieldLabel>Order Item No</DialogFieldLabel>
              <ErpSelectField
                onChange={(value) =>
                  onChange((current) =>
                    current
                      ? {
                          ...current,
                          issueSheets: "",
                          orderItemNo: value,
                        }
                      : current,
                  )
                }
                options={orderItemOptions}
                size="dense"
                state={!state?.orderNo ? "disabled" : "default"}
                value={state?.orderItemNo ?? ""}
              />
            </Stack>
          </Box>

          {showOrderItemTable ? (
            <Box
              sx={(theme) => ({
                border: `1px solid ${theme.customTokens.borders.default}`,
                borderRadius: `${theme.customTokens.radius.md}px`,
                overflow: "hidden",
              })}
            >
              <Box sx={getDialogScrollableTableSx}>
                <Table
                  size="small"
                  sx={{
                    minWidth: 1040,
                    tableLayout: "auto",
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell sx={getDialogHeaderCellSx}>Item Name</TableCell>
                      <TableCell sx={getDialogHeaderCellSx}>
                        No. of Sheets
                      </TableCell>
                      <TableCell sx={getDialogHeaderCellSx}>
                        Available No. of Sheets
                      </TableCell>
                      <TableCell sx={getDialogHeaderCellSx}>
                        Issue No. of Sheets
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={getDialogBodyCellSx}>
                        {selectedOrderItem?.itemName || "-"}
                      </TableCell>
                      <TableCell sx={getDialogBodyCellSx}>
                        {getOrderLineItemSheetsLabel(selectedOrderItem)}
                      </TableCell>
                      <TableCell sx={getDialogBodyCellSx}>
                        {availableSheets || "-"}
                      </TableCell>
                      <TableCell sx={getDialogBodyCellSx}>
                        <TextField
                          error={hasIssueSheetsError}
                          fullWidth
                          helperText={
                            hasIssueSheetsError
                              ? exceedsAvailableSheets
                                ? "Issue sheets cannot exceed available sheets."
                                : "Enter a valid whole number."
                              : " "
                          }
                          value={state?.issueSheets ?? ""}
                          onChange={(event) => {
                            const nextValue = event.target.value.replace(/\D/g, "");
                            onChange((current) =>
                              current
                                ? { ...current, issueSheets: nextValue }
                                : current,
                            );
                          }}
                          slotProps={{
                            htmlInput: {
                              inputMode: "numeric",
                              pattern: "[0-9]*",
                            },
                          }}
                          sx={(theme) =>
                            getCompactFieldSx(
                              theme,
                              hasIssueSheetsError ? "error" : "default",
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </Box>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={(theme) => ({
          borderTop: `1px solid ${theme.customTokens.borders.default}`,
          px: theme.spacing(2),
          py: theme.spacing(1.5),
        })}
      >
        <Button
          type="button"
          onClick={onClose}
          sx={recordFormActionButtonSx}
          variant="outlined"
        >
          Cancel
        </Button>

        <Button
          type="button"
          onClick={onSubmit}
          sx={recordFormActionButtonSx}
          variant="contained"
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DialogFieldLabel({
  children,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <Typography
      sx={(theme) => ({
        color: theme.customTokens.text.primary,
        fontSize: theme.typography.caption.fontSize,
        fontWeight: 700,
      })}
    >
      {children}
    </Typography>
  );
}

function getAvailableSheetsLabel(row: FactoryRecord) {
  const value = getFactoryRowValue(row, [
    "availableSheets",
    "availableNoOfSheets",
    "noOfSheets",
    "outputNoOfSheets",
    "issuedNoOfSheets",
    "totalNoOfSheets",
  ]);

  return value || "0";
}

function getAvailableSheetsNumber(row: FactoryRecord) {
  const value = getAvailableSheetsLabel(row).replace(/[^\d]/g, "");
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function getFactoryRowValue(row: FactoryRecord, keys: readonly string[]) {
  for (const key of keys) {
    const value = row[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

const splicingOrderTypeOptions = [
  "Marquetry",
  "Decorative",
  "Fluted",
  "Embossed",
] as const;

type SplicingOrderType = (typeof splicingOrderTypeOptions)[number];

type SplicingOrderLineItemOption = {
  lineItem: OrderLineItem;
  orderItemNo: string;
};

function isFinishedOrderRecord(order: OrderRecord) {
  const orderType = order.orderType?.trim().toLowerCase() ?? "";
  return (
    orderType.includes("finished") ||
    String(order.id).toLowerCase().includes("finished")
  );
}

function formatSampleAllocationOrderItemNo(itemId: string, index: number) {
  const numericTail = String(itemId).match(/(\d+)$/)?.[1];
  const sequence = numericTail
    ? Number.parseInt(numericTail, 10)
    : index + 1;

  return `OI-${String(Number.isFinite(sequence) ? sequence : index + 1).padStart(3, "0")}`;
}

function getCompatibleFinishedOrderLineItemOptions(
  order: OrderRecord,
  sampleProcessType: SampleSheetProcessType | null,
) {
  if (!isFinishedOrderRecord(order) || !sampleProcessType) {
    return [];
  }

  return getOrderLineItems(order.id)
    .map((lineItem, index) => ({
      lineItem,
      orderItemNo: formatSampleAllocationOrderItemNo(lineItem.id, index),
    }))
    .filter((option) =>
      isSampleSheetCompatibleWithFinishedType(
        sampleProcessType,
        option.lineItem.finishedType,
      ),
    );
}

function getCompatibleFinishedOrderNumberOptions(
  orderRecords: readonly OrderRecord[],
  sampleProcessType: SampleSheetProcessType | null,
) {
  return orderRecords
    .filter(
      (record) =>
        getCompatibleFinishedOrderLineItemOptions(record, sampleProcessType)
          .length > 0,
    )
    .map((record) => record.orderNo);
}

function getCompatibleFinishedOrderItemNumberOptions(
  orderRecords: readonly OrderRecord[],
  orderNo: string,
  sampleProcessType: SampleSheetProcessType | null,
) {
  const order = getFinishedOrderByNo(orderRecords, orderNo);

  if (!order) {
    return [];
  }

  return getCompatibleFinishedOrderLineItemOptions(
    order,
    sampleProcessType,
  ).map((option) => option.orderItemNo);
}

function getFinishedOrderByNo(
  orderRecords: readonly OrderRecord[],
  orderNo: string,
) {
  return (
    orderRecords.find(
      (record) =>
        record.orderNo === orderNo && isFinishedOrderRecord(record),
    ) ?? null
  );
}

function getCompatibleFinishedOrderItem<Row extends FactoryRecord>(
  orderRecords: readonly OrderRecord[],
  state: SampleSheetOrderAllocationState<Row>,
  sampleProcessType: SampleSheetProcessType | null,
) {
  const order = getFinishedOrderByNo(orderRecords, state.orderNo);

  if (!order) {
    return null;
  }

  return (
    getCompatibleFinishedOrderLineItemOptions(order, sampleProcessType).find(
      (option) => option.orderItemNo === state.orderItemNo,
    )?.lineItem ?? null
  );
}

function buildSampleSheetOrderAllocationSourceRow<Row extends FactoryRecord>(
  state: SampleSheetOrderAllocationState<Row>,
  order: OrderRecord | null,
  lineItem: OrderLineItem,
  sampleProcessType: SampleSheetProcessType,
  allocateSheets: number,
) {
  const sampleSheetRef =
    typeof state.row.id === "string" || typeof state.row.id === "number"
      ? String(state.row.id)
      : "";

  return {
    ...state.row,
    amount: lineItem.amount || state.row.amount,
    customerName: order?.customerName ?? state.row.customerName,
    issuedDate: new Date(),
    issuedFor: getDownstreamRouteAfterSampleAllocation(sampleProcessType).label,
    issuedFrom: formatSampleSheetProcessLabel(sampleProcessType),
    itemName: lineItem.itemName || state.row.itemName,
    itemSubCategory: lineItem.subCategory || state.row.itemSubCategory,
    length: lineItem.length || state.row.length,
    noOfSheets: String(allocateSheets),
    orderDate: order?.orderDate ?? state.row.orderDate,
    orderItemNo: state.orderItemNo,
    orderNo: state.orderNo,
    productName: lineItem.salesItemName || lineItem.itemName || state.row.productName,
    productType: lineItem.finishedType || sampleProcessType,
    purpose: formatSampleSheetProcessLabel(sampleProcessType),
    remark:
      lineItem.remark ||
      `Allocated from Sample Sheet ${sampleSheetRef} (${sampleProcessType})`,
    sampleProcessType,
    sampleSheetRef,
    sqf: lineItem.totalSqm || state.row.sqf,
    sqm: lineItem.sqm || state.row.sqm,
    thickness: lineItem.thickness || state.row.thickness,
    width: lineItem.width || state.row.width,
  } as Row;
}

function getSplicingOrderNumberOptions(
  orderRecords: readonly OrderRecord[],
  orderType: string,
) {
  return orderRecords
    .filter(
      (record) =>
        getSplicingOrderLineItemOptions(record, orderType).length > 0,
    )
    .map((record) => record.orderNo);
}

function getSplicingOrderItemNumberOptions(
  orderRecords: readonly OrderRecord[],
  orderType: string,
  orderNo: string,
) {
  const order = getSplicingSelectedOrder(orderRecords, orderNo);

  if (!order) {
    return [];
  }

  return getSplicingOrderLineItemOptions(order, orderType).map(
    (option) => option.orderItemNo,
  );
}

function getSplicingSelectedOrder(
  orderRecords: readonly OrderRecord[],
  orderNo: string,
) {
  return orderRecords.find((record) => record.orderNo === orderNo) ?? null;
}

function getSplicingSelectedOrderItem<Row extends FactoryRecord>(
  orderRecords: readonly OrderRecord[],
  state: SplicingOrderIssueState<Row>,
) {
  const order = getSplicingSelectedOrder(orderRecords, state.orderNo);

  if (!order) {
    return null;
  }

  return (
    getSplicingOrderLineItemOptions(order, state.orderType).find(
      (option) => option.orderItemNo === state.orderItemNo,
    )?.lineItem ?? null
  );
}

function getSplicingOrderLineItemOptions(
  order: OrderRecord,
  orderType: string,
): SplicingOrderLineItemOption[] {
  const normalizedOrderType = normalizeSplicingOrderType(orderType);

  if (!normalizedOrderType) {
    return [];
  }

  const recordOrderType =
    normalizeSplicingOrderType(order.orderType) ??
    normalizeSplicingOrderType(order.productCategory);

  return getOrderLineItems(order.id)
    .map((lineItem, index) => ({
      lineItem,
      orderItemNo: String(index + 1),
    }))
    .filter((option) => {
      const lineItemOrderType =
        normalizeSplicingOrderType(option.lineItem.finishedType) ??
        normalizeSplicingOrderType(option.lineItem.productCategory);

      if (lineItemOrderType) {
        return lineItemOrderType === normalizedOrderType;
      }

      return recordOrderType === normalizedOrderType;
    });
}

function normalizeSplicingOrderType(
  value: string | null | undefined,
): SplicingOrderType | null {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();

  return (
    splicingOrderTypeOptions.find((option) =>
      normalizedValue.includes(option.toLowerCase()),
    ) ?? null
  );
}

function getOrderLineItemSheetsLabel(
  lineItem: OrderLineItem | null | undefined,
) {
  return lineItem?.quantitySheets?.trim() || "0";
}

function getOrderLineItemSheetsNumber(
  lineItem: OrderLineItem | null | undefined,
) {
  const value = getOrderLineItemSheetsLabel(lineItem).replace(/[^\d]/g, "");
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function getSplicingOrderIssueRoute(orderType: string) {
  return normalizeSplicingOrderType(orderType) === "Marquetry"
    ? "/factory/marquetry/add"
    : "/factory/pressing/add";
}

function buildSplicingOrderIssueSourceRow<Row extends FactoryRecord>(
  state: SplicingOrderIssueState<Row>,
  order: OrderRecord | null,
  lineItem: OrderLineItem,
) {
  return {
    ...state.row,
    amount: lineItem.amount || state.row.amount,
    customerName: order?.customerName ?? state.row.customerName,
    issuedDate: state.issueDate ?? new Date(),
    issuedFor: state.orderType,
    itemName: lineItem.itemName || state.row.itemName,
    itemSubCategory: lineItem.subCategory || state.row.itemSubCategory,
    length: lineItem.length || state.row.length,
    noOfSheets: state.issueSheets || lineItem.quantitySheets || state.row.noOfSheets,
    orderDate: order?.orderDate ?? state.row.orderDate,
    orderItemNo: state.orderItemNo,
    orderNo: state.orderNo,
    productName: lineItem.salesItemName || lineItem.itemName || state.row.productName,
    productType: state.orderType,
    remark: lineItem.remark || state.row.remark,
    sqf: lineItem.totalSqm || state.row.sqf,
    sqm: lineItem.sqm || state.row.sqm,
    thickness: lineItem.thickness || state.row.thickness,
    width: lineItem.width || state.row.width,
  } as Row;
}

function getDialogScrollableTableSx(theme: import("@mui/material/styles").Theme) {
  return {
    overflowX: "auto",
    overflowY: "hidden",
    scrollbarWidth: "thin",
    scrollbarColor: `${theme.customTokens.brand.primary} ${theme.customTokens.surfaces.alt}`,
    "&::-webkit-scrollbar": {
      height: 8,
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: theme.customTokens.surfaces.alt,
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: 999,
      backgroundColor: theme.customTokens.brand.primary,
    },
  } as const;
}

function getDialogHeaderCellSx(theme: import("@mui/material/styles").Theme) {
  return {
    borderBottom: `1px solid ${theme.customTokens.borders.default}`,
    borderRight: `1px solid ${theme.customTokens.borders.divider}`,
    backgroundColor: theme.customTokens.neutrals[100],
    color: theme.customTokens.neutrals[700],
    fontSize: "13px",
    fontWeight: 600,
    letterSpacing: "0.02em",
    textTransform: "uppercase" as const,
    minWidth: 180,
    py: theme.spacing(1.1),
    px: theme.spacing(1.25),
    whiteSpace: "nowrap",
  } as const;
}

function getDialogBodyCellSx(theme: import("@mui/material/styles").Theme) {
  return {
    borderBottom: `1px solid ${theme.customTokens.borders.divider}`,
    borderRight: `1px solid ${theme.customTokens.borders.divider}`,
    color: theme.customTokens.text.primary,
    fontSize: "14px",
    fontWeight: 400,
    minWidth: 180,
    py: theme.spacing(1.15),
    px: theme.spacing(1.25),
    verticalAlign: "top",
    whiteSpace: "nowrap",
  } as const;
}
