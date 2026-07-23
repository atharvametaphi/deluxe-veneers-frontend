import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { Eye, KeyRound, Pencil, Search } from "lucide-react";
import { Link as RouterLink, useNavigate } from "react-router";

import {
  type EnterpriseTableAction,
  EnterpriseDataTable,
} from "../../../components/data-display/EnterpriseDataTable";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import { getCurrentUser } from "../../auth";
import { formatMasterValue, MasterPageShell } from "../../masters/shared";
import { canAccessPermission } from "../../permissions";
import {
  getUserManagementPaths,
  getUserManagementSearchValues,
  userManagementColumns,
} from "./userManagementConfig";
import {
  changeUserPassword,
  fetchUserManagementRows,
  updateUserManagementStatus,
} from "./userManagementApi";
import type { UserManagementRecord } from "./userManagementConfig";

export function UserManagementListing() {
  const theme = useTheme();
  const navigate = useNavigate();
  const paths = getUserManagementPaths();
  const canCreate = canAccessPermission("userManagement", "create");
  const canEdit = canAccessPermission("userManagement", "edit");
  const canView = canAccessPermission("userManagement", "view");
  const [searchValue, setSearchValue] = useState("");
  const [rows, setRows] = useState<UserManagementRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordDialogUser, setPasswordDialogUser] =
    useState<UserManagementRecord | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadRows() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const nextRows = await fetchUserManagementRows();
        if (!ignore) {
          setRows(nextRows);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(
            error instanceof Error ? error.message : "Unable to load users.",
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
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
      getUserManagementSearchValues(row).some((value) =>
        formatMasterValue(value).toLowerCase().includes(normalizedSearch),
      ),
    );
  }, [rows, searchValue]);

  const tableActions: readonly EnterpriseTableAction<
    UserManagementRecord
  >[] = [
    ...(canView
      ? [
          {
            id: "view",
            label: "View",
            icon: Eye,
            onSelect: (row: UserManagementRecord) => navigate(paths.view(row.id)),
          },
        ]
      : []),
    ...(canEdit
      ? [
          {
            id: "edit",
            label: "Edit",
            icon: Pencil,
            onSelect: (row: UserManagementRecord) => navigate(paths.edit(row.id)),
          },
          {
            id: "change-password",
            label: "Change Password",
            icon: KeyRound,
            onSelect: (row: UserManagementRecord) => {
              setPasswordDialogUser(row);
              setNewPassword("");
              setConfirmPassword("");
              setPasswordError("");
              setPasswordSuccessMessage("");
            },
          },
        ]
      : []),
  ];

  const handleClosePasswordDialog = () => {
    if (isChangingPassword) {
      return;
    }

    setPasswordDialogUser(null);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
  };

  const handleChangePassword = async () => {
    if (!passwordDialogUser) {
      return;
    }

    if (!newPassword.trim()) {
      setPasswordError("Enter new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password must match.");
      return;
    }

    setIsChangingPassword(true);
    setPasswordError("");

    try {
      await changeUserPassword(passwordDialogUser.id, newPassword);
      setPasswordSuccessMessage(
        `Password changed for ${passwordDialogUser.firstName} ${passwordDialogUser.lastName}.`,
      );
      setPasswordDialogUser(null);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Unable to change password.",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleStatusChange = async (
    row: UserManagementRecord,
    checked: boolean,
  ) => {
    if (!canEdit) {
      return;
    }

    const status = checked ? "ACTIVE" : "INACTIVE";

    try {
      const updatedUser = await updateUserManagementStatus(row.id, status);
      setRows((currentRows) =>
        currentRows.map((currentRow) =>
          currentRow.id === row.id
            ? {
                ...currentRow,
                isActive: updatedUser.isActive,
                statusLabel: updatedUser.statusLabel,
                updatedBy: updatedUser.updatedBy,
                updatedDate: updatedUser.updatedDate,
              }
            : currentRow,
        ),
      );
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update user status.",
      );
      throw error;
    }
  };

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

        {canCreate ? (
          <Button
            component={RouterLink}
            to={paths.add}
            variant="contained"
          >
            Add User
          </Button>
        ) : null}
      </Stack>

      {errorMessage ? (
        <Alert severity="error">{errorMessage}</Alert>
      ) : null}

      {passwordSuccessMessage ? (
        <Alert severity="success">{passwordSuccessMessage}</Alert>
      ) : null}

      <EnterpriseDataTable
        actionColumnLabel="Actions"
        actions={tableActions}
        columns={userManagementColumns}
        defaultRowsPerPage={10}
        initialSort={{ key: "updatedDate", direction: "desc" }}
        isStatusChangeDisabled={(row) => !canEdit || isProtectedStatusRow(row)}
        onStatusChange={handleStatusChange}
        rows={canView ? filteredRows : []}
      />

      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={handleClosePasswordDialog}
        open={Boolean(passwordDialogUser)}
        slotProps={{
          paper: {
            sx: (currentTheme) => ({
              borderRadius: `${currentTheme.customTokens.radius.lg}px`,
              boxShadow: currentTheme.shadows[0],
            }),
          },
        }}
      >
        <DialogTitle
          sx={(currentTheme) => ({
            borderBottom: `1px solid ${currentTheme.customTokens.borders.default}`,
            fontSize: currentTheme.typography.h3.fontSize,
            fontWeight: 600,
            px: currentTheme.spacing(2),
            py: currentTheme.spacing(1.75),
          })}
        >
          Change Password
        </DialogTitle>

        <DialogContent
          sx={(currentTheme) => ({
            pt: `${currentTheme.spacing(2)} !important`,
          })}
        >
          <Stack spacing={1.5}>
            {passwordDialogUser ? (
              <Alert severity="info">
                {passwordDialogUser.firstName} {passwordDialogUser.lastName}
              </Alert>
            ) : null}

            {passwordError ? (
              <Alert severity="error">{passwordError}</Alert>
            ) : null}

            <TextField
              autoFocus
              label="New Password"
              placeholder="Enter New Password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              sx={(currentTheme) => getCompactFieldSx(currentTheme)}
            />

            <TextField
              label="Confirm Password"
              placeholder="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              sx={(currentTheme) => getCompactFieldSx(currentTheme)}
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={(currentTheme) => ({
            borderTop: `1px solid ${currentTheme.customTokens.borders.default}`,
            px: currentTheme.spacing(2),
            py: currentTheme.spacing(1.5),
          })}
        >
          <Button
            disabled={isChangingPassword}
            onClick={handleClosePasswordDialog}
            variant="outlined"
          >
            Cancel
          </Button>

          <Button
            disabled={isChangingPassword}
            onClick={handleChangePassword}
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </MasterPageShell>
  );
}

function isProtectedStatusRow(row: UserManagementRecord) {
  return isCurrentUserRow(row) || isSuperAdminRole(row.role);
}

function isCurrentUserRow(row: UserManagementRecord) {
  const currentUser = getCurrentUser();

  return (
    Boolean(currentUser.id && currentUser.id === row.id) ||
    Boolean(currentUser.email && currentUser.email === row.email)
  );
}

function isSuperAdminRole(role: string) {
  return role.trim().toLowerCase() === "super admin";
}
