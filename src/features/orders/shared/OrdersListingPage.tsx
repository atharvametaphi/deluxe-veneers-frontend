import { useMemo, useState } from "react";
import { Button, InputAdornment, Stack, TextField, useTheme } from "@mui/material";
import { Eye, Pencil, Search } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router";

import {
  EnterpriseDataTable,
  type EnterpriseTableAction,
} from "../../../components/data-display/EnterpriseDataTable";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import { formatMasterValue, MasterPageShell } from "../../masters/shared";
import {
  getOrdersPaths,
  orderListingColumns,
  type OrderRecord,
  useOrderRecords,
} from "./ordersStore";

export function OrdersListingPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const paths = getOrdersPaths();
  const rows = useOrderRecords();
  const [searchValue, setSearchValue] = useState("");

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (searchValue.trim().length === 0) {
        return true;
      }

      return Object.values(row).some((value) =>
        formatMasterValue(value)
          .toLowerCase()
          .includes(searchValue.trim().toLowerCase()),
      );
    });
  }, [rows, searchValue]);

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

  return (
    <MasterPageShell
      breadcrumbs={[{ label: "Orders" }]}
      title="Orders"
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        spacing={2}
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
          component={RouterLink}
          to={paths.add}
          sx={{ alignSelf: { xs: "flex-start", md: "center" } }}
          variant="contained"
        >
          Add Order
        </Button>
      </Stack>

      <EnterpriseDataTable
        actions={rowActions}
        columns={orderListingColumns}
        defaultRowsPerPage={10}
        emptyStateLabel="No orders are available."
        initialSort={{ key: "updatedDate", direction: "desc" }}
        rows={filteredRows}
      />
    </MasterPageShell>
  );
}
