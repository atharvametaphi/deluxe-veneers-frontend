import { useMemo, useState } from "react";
import {
  Button,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { ChevronDown, Eye, Pencil, Search } from "lucide-react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router";

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
  const [createMenuAnchor, setCreateMenuAnchor] = useState<HTMLElement | null>(
    null,
  );

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
          endIcon={<ChevronDown size={16} />}
          onClick={(event: MouseEvent<HTMLElement>) =>
            setCreateMenuAnchor(event.currentTarget)
          }
          sx={{ alignSelf: { xs: "flex-start", md: "center" } }}
          variant="contained"
        >
          Create Order
        </Button>

        <Menu
          anchorEl={createMenuAnchor}
          open={Boolean(createMenuAnchor)}
          onClose={() => setCreateMenuAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        >
          <MenuItem
            onClick={() => {
              setCreateMenuAnchor(null);
              navigate(`${paths.add}?type=raw`);
            }}
          >
            Raw Order
          </MenuItem>

          <MenuItem
            onClick={() => {
              setCreateMenuAnchor(null);
              navigate(`${paths.add}?type=marquetry`);
            }}
          >
            Marquetry Order
          </MenuItem>
        </Menu>
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
