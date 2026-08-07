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
  const orderRecords = useOrderRecords();
  const paths = getFactoryPaths(definition.slug);
  const permissionKey = getFactoryPermissionKey(definition.slug);
  const canCreate = canAccessPermission(permissionKey, "create");
  const canEdit = canAccessPermission(permissionKey, "edit");
  const canView = canAccessPermission(permissionKey, "view");
  const [activeTab, setActiveTab] = useState<FactoryProcessTab>("issued");
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
  const isDryingDoneTab = definition.slug === "drying" && activeTab === "done";
  const shouldUsePressingIssuedForLabels =
    definition.slug === "pressing" &&
    (activeTab === "issued" || activeTab === "done");
  const tabs = useMemo(
    () => getFactoryProcessTabs(definition.title),
    [definition.title],
  );
  const rejectedDoneRowIds = useMemo(
    () => new Set(rejectedDoneRows.map((row) => row.id)),
    [rejectedDoneRows],
  );
  const tabRows = useMemo(() => {
    const rowsForTab =
      activeTab === "rejected"
        ? [...getFactoryRowsForTab(definition.rows, activeTab), ...rejectedDoneRows]
        : getFactoryRowsForTab(definition.rows, activeTab);

    return rowsForTab.filter(
      (row) =>
        !revertedRowIds.includes(row.id) &&
        !(activeTab === "done" && rejectedDoneRowIds.has(row.id)),
    );
  }, [
    activeTab,
    definition.rows,
    rejectedDoneRowIds,
    rejectedDoneRows,
    revertedRowIds,
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
    inspectionDoneRowIds,
    isDryingDoneTab,
    navigate,
    rowActions,
  ]);

  const handleCloseGroupingSampleIssue = () => {
    setGroupingSampleIssue(null);
  };
  const handleSubmitGroupingSampleIssue = () => {
    if (!groupingSampleIssue) {
      return;
    }

    const availableSheets = getAvailableSheetsNumber(groupingSampleIssue.row);
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

    setGroupingSampleIssue(null);
    navigate("/factory/splicing");
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
      splicingOrderIssue.issueSheets.length > 0 &&
      Number.isInteger(issueSheets) &&
      issueSheets > 0 &&
      issueSheets <= availableSheets;
    const hasRequiredValues = Boolean(
      splicingOrderIssue.issueDate &&
        splicingOrderIssue.orderType &&
        splicingOrderIssue.orderNo &&
        splicingOrderIssue.orderItemNo &&
        selectedOrderItem,
    );

    if (!hasRequiredValues || !hasValidIssueSheets) {
      setSplicingOrderIssue((current) =>
        current ? { ...current, submitted: true } : current,
      );
      return;
    }

    if (!selectedOrderItem) {
      return;
    }

    setSplicingOrderIssue(null);
    navigate(getSplicingOrderIssueRoute(splicingOrderIssue.orderType), {
      state: {
        sourceRow: buildSplicingOrderIssueSourceRow(
          splicingOrderIssue,
          selectedOrder,
          selectedOrderItem,
        ),
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
    </>
  );
}

interface GroupingSampleIssueState<Row extends FactoryRecord> {
  issueDate: Date | null;
  issueSheets: string;
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
): readonly EnterpriseTableAction<Row>[] {
  if (slug === "pressing") {
    return getPressingNextProcessActions(row, navigate);
  }

  if (slug === "grouping") {
    return [
      createGroupingSampleIssueAction<Row>(onOpenGroupingSampleIssue),
      createFactoryIssueAction<Row>("Finishing", navigate),
    ].filter((action) => canAccessPermission(action.permissionKey, "create"));
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
    id: "issue-for-sample",
    label: "Issue for Sample",
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
  const availableSheets = state ? getAvailableSheetsLabel(state.row) : "";
  const availableSheetsNumber = state ? getAvailableSheetsNumber(state.row) : 0;
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
        Issue for Sample
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
              md: "repeat(3, minmax(0, 1fr))",
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
              <DialogFieldLabel required>Issued Date</DialogFieldLabel>
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
              <DialogFieldLabel required>Order Type</DialogFieldLabel>
              <ErpSelectField
                helperText={
                  state?.submitted && !state.orderType
                    ? "Order type is required."
                    : undefined
                }
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
                state={state?.submitted && !state.orderType ? "error" : "default"}
                value={state?.orderType ?? ""}
              />
            </Stack>

            <Stack spacing={0.75}>
              <DialogFieldLabel required>Order No</DialogFieldLabel>
              <ErpSelectField
                helperText={
                  state?.submitted && !state.orderNo
                    ? "Order no is required."
                    : undefined
                }
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
                state={
                  !state?.orderType
                    ? "disabled"
                    : state.submitted && !state.orderNo
                      ? "error"
                      : "default"
                }
                value={state?.orderNo ?? ""}
              />
            </Stack>

            <Stack spacing={0.75}>
              <DialogFieldLabel required>Order Item No</DialogFieldLabel>
              <ErpSelectField
                helperText={
                  state?.submitted && !state.orderItemNo
                    ? "Order item no is required."
                    : undefined
                }
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
                state={
                  !state?.orderNo
                    ? "disabled"
                    : state.submitted && !state.orderItemNo
                      ? "error"
                      : "default"
                }
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
  required = false,
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
      {required ? (
        <Box
          component="span"
          sx={(theme) => ({
            color: theme.palette.error.main,
            ml: theme.spacing(0.25),
          })}
        >
          *
        </Box>
      ) : null}
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
    borderBottom: `1px solid ${theme.customTokens.brand.primaryScale[800]}`,
    borderRight: `1px solid ${theme.customTokens.brand.primaryScale[800]}`,
    backgroundColor: theme.customTokens.brand.primary,
    color: theme.customTokens.text.inverse,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 700,
    minWidth: 180,
    py: theme.spacing(1.25),
    whiteSpace: "nowrap",
  } as const;
}

function getDialogBodyCellSx(theme: import("@mui/material/styles").Theme) {
  return {
    borderBottom: `1px solid ${theme.customTokens.borders.default}`,
    borderRight: `1px solid ${theme.customTokens.borders.default}`,
    color: theme.customTokens.text.primary,
    fontSize: theme.typography.body2.fontSize,
    minWidth: 180,
    py: theme.spacing(1),
    verticalAlign: "top",
    whiteSpace: "nowrap",
  } as const;
}
