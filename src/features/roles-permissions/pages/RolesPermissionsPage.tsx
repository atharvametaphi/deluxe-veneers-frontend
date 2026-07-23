import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { Search, Settings2 } from "lucide-react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router";

import { EnterpriseDataTable } from "../../../components/data-display/EnterpriseDataTable";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import { formatMasterValue, MasterPageShell } from "../../masters/shared";
import { canAccessPermission } from "../../permissions";
import {
  fetchRolePermissionRows,
  getRolePermissionSearchValues,
  getRolePermissionPaths,
  rolePermissionColumns,
  rolePermissionRows,
  type RolePermissionRecord,
} from "../shared";

export function RolesPermissionsPage() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const paths = getRolePermissionPaths();
  const canCreate = canAccessPermission("rolesPermissions", "create");
  const canEdit = canAccessPermission("rolesPermissions", "edit");
  const canView = canAccessPermission("rolesPermissions", "view");
  const [searchValue, setSearchValue] = useState("");
  const [rows, setRows] = useState<RolePermissionRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(() =>
    getRolesPermissionsFlashMessage(location.state),
  );

  useEffect(() => {
    const nextSuccessMessage = getRolesPermissionsFlashMessage(location.state);

    if (!nextSuccessMessage) {
      return;
    }

    setSuccessMessage(nextSuccessMessage);
    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: null,
    });
  }, [location.pathname, location.search, location.state, navigate]);

  useEffect(() => {
    let ignore = false;

    async function loadRows() {
      setErrorMessage("");

      try {
        const nextRows = await fetchRolePermissionRows();
        if (!ignore) {
          setRows(nextRows.length > 0 ? nextRows : [...rolePermissionRows]);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load roles and permissions.",
          );
        }
      }
    }

    loadRows();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return rows;
    }

    return rows.filter((row) =>
      getRolePermissionSearchValues(row).some((value) =>
        formatMasterValue(value)
          .toLowerCase()
          .includes(normalizedSearch),
      ),
    );
  }, [rows, searchValue]);

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

        {canCreate ? (
          <Button
            component={RouterLink}
            to={paths.add}
            variant="contained"
          >
            Add Role
          </Button>
        ) : null}
      </Stack>

      {successMessage ? (
        <Alert severity="success" onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      ) : null}

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <EnterpriseDataTable
        actionColumnLabel="Actions"
        actionColumnWidth={88}
        columns={rolePermissionColumns}
        defaultRowsPerPage={10}
        initialSort={{ key: "updatedDate", direction: "desc" }}
        {...(canEdit
          ? {
              renderActionCell: (row: RolePermissionRecord) => (
                <IconButton
                  aria-label={`Configure ${row.roleName}`}
                  onClick={() => navigate(paths.configure(row.id))}
                  size="small"
                  sx={{
                    color: theme.customTokens.navigation.activeText,
                    borderRadius: `${theme.customTokens.radius.md}px`,
                    "&:hover": {
                      backgroundColor:
                        theme.customTokens.navigation.hoverBackground,
                      color: theme.customTokens.brand.secondary,
                    },
                  }}
                >
                  <Settings2 size={16} />
                </IconButton>
              ),
            }
          : {})}
        rows={canView ? filteredRows : []}
      />
    </MasterPageShell>
  );
}

function getRolesPermissionsFlashMessage(state: unknown) {
  if (!state || typeof state !== "object") {
    return "";
  }

  const message = (state as { rolesPermissionsFlashMessage?: unknown })
    .rolesPermissionsFlashMessage;

  return typeof message === "string" ? message : "";
}
