import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  ClickAwayListener,
  Dialog,
  DialogContent,
  MenuList,
  MenuItem,
  Paper,
  Popper,
  Stack,
  Typography,
} from "@mui/material";
import { ChevronDown, CircleAlert, Eye, Pencil, XCircle } from "lucide-react";
import type { MouseEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

import {
  EnterpriseDataTable,
  type EnterpriseTableAction,
} from "../../../components/data-display/EnterpriseDataTable";
import { ModuleProcessTabs } from "../../../components/navigation/ModuleProcessTabs";
import { formatMasterValue, MasterPageShell } from "../../masters/shared";
import { canAccessPermission } from "../../permissions";
import { ClearableSearchField } from "../../shared/ClearableSearchField";
import {
  getListingToolbarButtonSx,
  recordFormActionButtonSx,
} from "../../shared/buttonStyles";
import {
  cancelOrderRecord,
  getOrdersPaths,
  getOrderVariantFromType,
  orderListingColumns,
  ordersModuleConfig,
  type OrderModuleConfig,
  type OrderCreateVariant,
  type OrderRecord,
  useOrderRecords,
} from "./ordersStore";
import { OrderViewDetailsDialog } from "./OrderViewDetailsDialog";

type OrderListingTab = OrderCreateVariant;
type OrderListingLocationState = {
  orderListingTab?: OrderListingTab;
} | null;

export function OrdersListingPage({
  moduleConfig = ordersModuleConfig,
}: {
  moduleConfig?: OrderModuleConfig;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: viewOrderId } = useParams<{ id: string }>();
  const paths = getOrdersPaths(moduleConfig.basePath);
  const rows = useOrderRecords();
  const requestedTab = getLocationOrderTab(location.state);
  const orderTabs = useMemo(
    () =>
      moduleConfig.createOptions.map((option) => ({
        label: option.label.replace(/ Order$/, " Orders"),
        value: option.value,
      })),
    [moduleConfig.createOptions],
  );
  const [activeTab, setActiveTab] = useState<OrderListingTab>(
    getDefaultOrderListingTab(moduleConfig, requestedTab),
  );
  const [searchValue, setSearchValue] = useState("");
  const [createMenuAnchor, setCreateMenuAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [cancelDialogOrder, setCancelDialogOrder] =
    useState<OrderRecord | null>(null);
  const canCreate = canAccessPermission(moduleConfig.permissionKey, "create");
  const canEdit = canAccessPermission(moduleConfig.permissionKey, "edit");
  const canView = canAccessPermission(moduleConfig.permissionKey, "view");

  useEffect(() => {
    setActiveTab(getDefaultOrderListingTab(moduleConfig, requestedTab));
  }, [moduleConfig, requestedTab]);

  const filteredRows = useMemo(() => {
    return rows
      .filter((row) => getOrderVariantFromType(row.orderType) === activeTab)
      .filter((row) => {
      if (searchValue.trim().length === 0) {
        return true;
      }

      return Object.values(row).some((value) =>
        formatMasterValue(value)
          .toLowerCase()
          .includes(searchValue.trim().toLowerCase()),
      );
    });
  }, [activeTab, rows, searchValue]);

  const viewRecord = useMemo(
    () => rows.find((row) => row.id === viewOrderId),
    [rows, viewOrderId],
  );

  useEffect(() => {
    const viewRecordVariant = getOrderVariantFromType(viewRecord?.orderType);

    if (
      viewRecordVariant &&
      moduleConfig.createOptions.some((option) => option.value === viewRecordVariant)
    ) {
      setActiveTab(viewRecordVariant);
    }
  }, [moduleConfig.createOptions, viewRecord?.orderType]);

  const rowActions = useMemo<readonly EnterpriseTableAction<OrderRecord>[]>(
    () => [
      ...(canView
        ? [
            {
              id: "view",
              label: "View",
              icon: Eye,
              onSelect: (row: OrderRecord) =>
                navigate(paths.view(row.id), {
                  state: {
                    orderListingTab:
                      getOrderVariantFromType(row.orderType) ?? activeTab,
                  },
                }),
            },
          ]
        : []),
      ...(canEdit
        ? [
            {
              id: "edit",
              label: "Edit",
              icon: Pencil,
              onSelect: (row: OrderRecord) => navigate(paths.edit(row.id)),
            },
          ]
        : []),
    ],
    [activeTab, canEdit, canView, navigate, paths],
  );

  const getRowActions = (
    row: OrderRecord,
  ): readonly EnterpriseTableAction<OrderRecord>[] =>
    row.status === "Cancelled" || !canEdit
      ? rowActions
      : [
          ...rowActions,
          {
            id: "cancel-order",
            label: "Cancel Order",
            icon: XCircle,
            onSelect: (selectedRow) => setCancelDialogOrder(selectedRow),
          },
        ];

  const handleCloseCreateMenu = () => {
    setCreateMenuAnchor(null);
  };

  const handleCreateVariantSelect = (variant: OrderCreateVariant) => {
    handleCloseCreateMenu();
    navigate(`${paths.add}?type=${variant}`);
  };

  const handleCloseCancelDialog = () => {
    setCancelDialogOrder(null);
  };

  const handleConfirmCancelOrder = () => {
    if (!cancelDialogOrder) {
      return;
    }

    cancelOrderRecord(cancelDialogOrder.id);
    setCancelDialogOrder(null);
  };

  return (
    <MasterPageShell
      breadcrumbs={[{ label: moduleConfig.title }]}
      title={moduleConfig.title}
    >
      <ModuleProcessTabs
        onChange={setActiveTab}
        tabs={orderTabs}
        value={activeTab}
      />

      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={(currentTheme) => ({
          mt: currentTheme.spacing(2),
        })}
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
            endIcon={<ChevronDown size={16} />}
            onClick={(event: MouseEvent<HTMLElement>) =>
              setCreateMenuAnchor(event.currentTarget)
            }
            sx={(currentTheme) => ({
              ...getListingToolbarButtonSx(currentTheme),
              alignSelf: { xs: "flex-start", md: "center" },
            })}
            variant="contained"
          >
            Create Order
          </Button>
        ) : null}

        {canCreate ? (
          <Popper
            anchorEl={createMenuAnchor}
            open={Boolean(createMenuAnchor)}
            placement="bottom-start"
            sx={(theme) => ({
              zIndex: theme.zIndex.modal,
            })}
          >
            <ClickAwayListener onClickAway={handleCloseCreateMenu}>
              <Paper
                sx={(theme) => ({
                  mt: theme.spacing(1),
                  minWidth: 200,
                  border: `1px solid ${theme.customTokens.borders.default}`,
                  borderRadius: `${theme.customTokens.radius.md}px`,
                  boxShadow: theme.shadows[0],
                  overflow: "hidden",
                })}
              >
                <MenuList autoFocusItem dense>
                  {moduleConfig.createOptions.map((option) => (
                    <MenuItem
                      key={option.value}
                      onClick={() => handleCreateVariantSelect(option.value)}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </Paper>
            </ClickAwayListener>
          </Popper>
        ) : null}
      </Stack>

      <EnterpriseDataTable
        key={activeTab}
        columns={orderListingColumns}
        defaultRowsPerPage={10}
        emptyStateLabel="No orders are available."
        getRowActions={getRowActions}
        initialSort={{ key: "updatedDate", direction: "desc" }}
        rows={canView ? filteredRows : []}
      />

      <OrderViewDetailsDialog
        onClose={() => {
          navigate(paths.list, {
            state: {
              orderListingTab:
                getOrderVariantFromType(viewRecord?.orderType) ?? activeTab,
            },
          });
        }}
        onEdit={
          canEdit && viewRecord
            ? () =>
                navigate(paths.edit(viewRecord.id), {
                  state: {
                    orderListingTab:
                      getOrderVariantFromType(viewRecord.orderType) ?? activeTab,
                  },
                })
            : undefined
        }
        open={Boolean(viewOrderId)}
        record={viewRecord}
      />

      <CancelOrderConfirmationDialog
        onClose={handleCloseCancelDialog}
        onConfirm={handleConfirmCancelOrder}
        open={Boolean(cancelDialogOrder)}
        orderNo={cancelDialogOrder?.orderNo}
      />
    </MasterPageShell>
  );
}

function CancelOrderConfirmationDialog({
  onClose,
  onConfirm,
  open,
  orderNo,
}: {
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  orderNo: string | undefined;
}) {
  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      onClose={onClose}
      open={open}
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
      <DialogContent
        sx={(theme) => ({
          px: theme.spacing(4),
          py: theme.spacing(4),
        })}
      >
        <Stack alignItems="center" spacing={2.5}>
          <Box
            sx={(theme) => ({
              alignItems: "center",
              border: `3px solid ${theme.customTokens.semanticScale.warning[400]}`,
              borderRadius: "50%",
              color: theme.customTokens.semanticScale.warning[400],
              display: "flex",
              height: 76,
              justifyContent: "center",
              width: 76,
            })}
          >
            <CircleAlert size={42} strokeWidth={2.25} />
          </Box>

          <Typography
            align="center"
            sx={(theme) => ({
              color: theme.palette.text.primary,
              fontSize: theme.typography.body1.fontSize,
              fontWeight: 500,
            })}
          >
            Are you sure you want to cancel order {orderNo ?? ""}?
          </Typography>

          <Stack direction="row" spacing={1.5}>
            <Button
              disableElevation
              onClick={onConfirm}
              sx={recordFormActionButtonSx}
              variant="contained"
            >
              Yes
            </Button>

            <Button
              disableElevation
              onClick={onClose}
              sx={(theme) => ({
                ...recordFormActionButtonSx,
                backgroundColor: theme.customTokens.neutrals[600],
                color: theme.customTokens.text.inverse,
                "&:hover": {
                  backgroundColor: theme.customTokens.neutrals[700],
                },
              })}
              variant="contained"
            >
              No
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function getLocationOrderTab(state: unknown) {
  return (state as OrderListingLocationState)?.orderListingTab ?? null;
}

function getDefaultOrderListingTab(
  moduleConfig: OrderModuleConfig,
  requestedTab: OrderListingTab | null,
) {
  if (
    requestedTab &&
    moduleConfig.createOptions.some((option) => option.value === requestedTab)
  ) {
    return requestedTab;
  }

  return moduleConfig.createOptions[0]?.value ?? "raw";
}
