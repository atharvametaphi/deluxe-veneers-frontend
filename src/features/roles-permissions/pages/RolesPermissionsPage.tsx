import { useMemo, useState } from "react";
import {
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { Search, Settings2 } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router";

import { EnterpriseDataTable } from "../../../components/data-display/EnterpriseDataTable";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import { formatMasterValue, MasterPageShell } from "../../masters/shared";
import {
  getRolePermissionPaths,
  getRolePermissionSearchValues,
  rolePermissionColumns,
  rolePermissionRows,
} from "../shared";

export function RolesPermissionsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const paths = getRolePermissionPaths();
  const [searchValue, setSearchValue] = useState("");

  const filteredRows = useMemo(() => {
    return rolePermissionRows.filter((row) => {
      const matchesSearch =
        searchValue.trim().length === 0 ||
        getRolePermissionSearchValues(row).some((value) =>
          formatMasterValue(value)
            .toLowerCase()
            .includes(searchValue.trim().toLowerCase()),
        );
      return matchesSearch;
    });
  }, [searchValue]);

  return (
    <MasterPageShell
      breadcrumbs={[{ label: "Roles & Permissions" }]}
      title="Roles & Permissions"
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
          Add Role
        </Button>
      </Stack>

      <EnterpriseDataTable
        actionColumnLabel="Actions"
        actionColumnWidth={88}
        columns={rolePermissionColumns}
        defaultRowsPerPage={10}
        initialSort={{ key: "updatedDate", direction: "desc" }}
        renderActionCell={(row) => (
          <IconButton
            aria-label={`Configure ${row.roleName}`}
            onClick={() => navigate(paths.configure(row.id))}
            size="small"
            sx={{
              color: theme.customTokens.navigation.activeText,
              borderRadius: `${theme.customTokens.radius.md}px`,
              "&:hover": {
                backgroundColor: theme.customTokens.navigation.hoverBackground,
                color: theme.customTokens.brand.secondary,
              },
            }}
          >
            <Settings2 size={16} />
          </IconButton>
        )}
        rows={filteredRows}
      />
    </MasterPageShell>
  );
}
