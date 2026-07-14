import { useEffect, useMemo, useState } from "react";
import {
  Button,
  ClickAwayListener,
  InputAdornment,
  MenuList,
  MenuItem,
  Paper,
  Popper,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { ChevronDown, Eye, Pencil, Search, XCircle } from "lucide-react";
import type { MouseEvent } from "react";
import { useNavigate, useParams } from "react-router";

import {
  EnterpriseDataTable,
  type EnterpriseTableAction,
} from "../../../components/data-display/EnterpriseDataTable";
import { ModuleProcessTabs } from "../../../components/navigation/ModuleProcessTabs";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import { formatMasterValue, MasterPageShell } from "../../masters/shared";
import {
  cancelOrderRecord,
  orderCreateOptions,
  getOrdersPaths,
  getOrderVariantFromType,
  orderListingColumns,
  type OrderCreateVariant,
  type OrderRecord,
  useOrderRecords,
} from "./ordersStore";
import { OrderViewDetailsDialog } from "./OrderViewDetailsDialog";

type OrderListingTab = OrderCreateVariant;

const orderTabs = orderCreateOptions.map((option) => ({
  label: option.label.replace(/ Order$/, " Orders"),
  value: option.value,
}));

export function OrdersListingPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id: viewOrderId } = useParams<{ id: string }>();
  const paths = getOrdersPaths();
  const rows = useOrderRecords();
  const [activeTab, setActiveTab] = useState<OrderListingTab>("raw");
  const [searchValue, setSearchValue] = useState("");
  const [createMenuAnchor, setCreateMenuAnchor] = useState<HTMLElement | null>(
    null,
  );

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

    if (viewRecordVariant) {
      setActiveTab(viewRecordVariant);
    }
  }, [viewRecord?.orderType]);

  const rowActions = useMemo<readonly EnterpriseTableAction<OrderRecord>[]>(
    () => [
      {
        id: "view",
        label: "View",
        icon: Eye,
        onSelect: (row) => navigate(paths.view(row.id)),
      },
      {
        id: "edit",
        label: "Edit",
        icon: Pencil,
        onSelect: (row) => navigate(paths.edit(row.id)),
      },
    ],
    [navigate, paths],
  );

  const getRowActions = (
    row: OrderRecord,
  ): readonly EnterpriseTableAction<OrderRecord>[] =>
    row.status === "Cancelled"
      ? rowActions
      : [
          ...rowActions,
          {
            id: "cancel-order",
            label: "Cancel Order",
            icon: XCircle,
            onSelect: (selectedRow) => cancelOrderRecord(selectedRow.id),
          },
        ];

  const handleCloseCreateMenu = () => {
    setCreateMenuAnchor(null);
  };

  const handleCreateVariantSelect = (variant: OrderCreateVariant) => {
    handleCloseCreateMenu();
    navigate(`${paths.add}?type=${variant}`);
  };

  return (
    <MasterPageShell
      breadcrumbs={[{ label: "Orders" }]}
      title="Orders"
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

        <Button
          endIcon={<ChevronDown size={16} />}
          onClick={(event: MouseEvent<HTMLElement>) =>
            setCreateMenuAnchor(event.currentTarget)
          }
          sx={{ alignSelf: { xs: "flex-start", md: "center" } }}
          variant="contained"
        >
          Create Order
        </Button>

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
                {orderCreateOptions.map((option) => (
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
      </Stack>

      <EnterpriseDataTable
        key={activeTab}
        columns={orderListingColumns}
        defaultRowsPerPage={10}
        emptyStateLabel="No orders are available."
        getRowActions={getRowActions}
        initialSort={{ key: "updatedDate", direction: "desc" }}
        rows={filteredRows}
      />

      <OrderViewDetailsDialog
        onClose={() => {
          navigate(paths.list);
        }}
        open={Boolean(viewOrderId)}
        record={viewRecord}
      />
    </MasterPageShell>
  );
}
