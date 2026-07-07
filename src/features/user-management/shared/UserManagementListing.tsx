import { useMemo, useState } from "react";
import {
  Button,
  InputAdornment,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { Eye, Pencil, Search } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router";

import {
  type EnterpriseTableAction,
  EnterpriseDataTable,
} from "../../../components/data-display/EnterpriseDataTable";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import { formatMasterValue, MasterPageShell } from "../../masters/shared";
import {
  getUserManagementSearchValues,
  getUserManagementPaths,
  userManagementColumns,
  userManagementRows,
} from "./userManagementConfig";

export function UserManagementListing() {
  const theme = useTheme();
  const navigate = useNavigate();
  const paths = getUserManagementPaths();
  const [searchValue, setSearchValue] = useState("");

  const filteredRows = useMemo(() => {
    return userManagementRows.filter((row) => {
      const matchesSearch =
        searchValue.trim().length === 0 ||
        getUserManagementSearchValues(row).some((value) =>
          formatMasterValue(value)
            .toLowerCase()
            .includes(searchValue.trim().toLowerCase()),
        );
      return matchesSearch;
    });
  }, [searchValue]);

  const tableActions: readonly EnterpriseTableAction<
    (typeof userManagementRows)[number]
  >[] = [
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
  ];

  return (
    <MasterPageShell
      breadcrumbs={[{ label: "User Management" }]}
      title="User Management"
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
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
                  <Search size={16} />
                </InputAdornment>
              ),
            },
          }}
        />

        <Button
          component={RouterLink}
          to={paths.add}
          variant="contained"
        >
          Add User
        </Button>
      </Stack>

      <EnterpriseDataTable
        actionColumnLabel="Actions"
        actions={tableActions}
        columns={userManagementColumns}
        defaultRowsPerPage={10}
        initialSort={{ key: "updatedDate", direction: "desc" }}
        rows={filteredRows}
      />
    </MasterPageShell>
  );
}
