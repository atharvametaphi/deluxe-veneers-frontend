import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { ChevronLeft, Pencil, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import {
  MasterFormFields,
  MasterPageShell,
  MasterSectionCard,
  hasRequiredFieldErrors,
  type MasterFieldDefinition,
  type MasterFieldValue,
} from "../../masters/shared";
import { canAccessPermission } from "../../permissions";
import { fetchRolePermissionRows } from "../../roles-permissions/shared/rolesPermissionsApi";
import {
  buildUserManagementInitialValues,
  getUserManagementPaths,
  userManagementFormFields,
  userManagementViewFields,
  type UserManagementDetail,
} from "./userManagementConfig";
import {
  createUserManagementRecord,
  fetchUserManagementDetail,
  updateUserManagementRecord,
} from "./userManagementApi";

interface UserManagementFormPageProps {
  mode: "add" | "edit" | "view";
}

export function UserManagementFormPage({
  mode,
}: UserManagementFormPageProps) {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const paths = getUserManagementPaths();
  const canCreate = canAccessPermission("userManagement", "create");
  const canEdit = canAccessPermission("userManagement", "edit");
  const canView = canAccessPermission("userManagement", "view");
  const canUseMode =
    (mode === "add" && canCreate) ||
    (mode === "edit" && canEdit) ||
    (mode === "view" && canView);
  const baseFields =
    mode === "view" ? userManagementViewFields : userManagementFormFields;
  const [row, setRow] = useState<UserManagementDetail | undefined>();
  const [roleOptions, setRoleOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(mode !== "add");
  const [isSaving, setIsSaving] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notFound, setNotFound] = useState(false);
  const activeFields = useMemo(
    () => withUserRoleOptions(baseFields, roleOptions, row?.role),
    [baseFields, roleOptions, row?.role],
  );

  const [values, setValues] = useState<Record<string, MasterFieldValue>>(() =>
    buildUserManagementInitialValues(baseFields),
  );

  useEffect(() => {
    let ignore = false;

    fetchRolePermissionRows()
      .then((rows) => {
        if (!ignore) {
          setRoleOptions(
            Array.from(
              new Set(
                rows
                  .filter((role) => role.isActive !== false)
                  .map((role) => role.roleName.trim())
                  .filter(Boolean),
              ),
            ),
          );
        }
      })
      .catch(() => {
        if (!ignore) {
          setRoleOptions([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadDetail() {
      setErrorMessage("");
      setNotFound(false);

      if (mode === "add") {
        setRow(undefined);
        setValues(buildUserManagementInitialValues(baseFields));
        setIsLoading(false);
        return;
      }

      if (!params.id) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const nextRow = await fetchUserManagementDetail(params.id);
        if (!ignore) {
          setRow(nextRow);
          setValues(buildUserManagementInitialValues(baseFields, nextRow));
        }
      } catch (error) {
        if (!ignore) {
          setNotFound(true);
          setErrorMessage(
            error instanceof Error ? error.message : "Unable to load user.",
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      ignore = true;
    };
  }, [baseFields, mode, params.id]);

  if ((mode === "edit" || mode === "view") && notFound) {
    return (
      <MasterPageShell
        breadcrumbs={[
          { label: "User Management", to: paths.list },
          { label: "Not Found" },
        ]}
        title="User Management"
      >
        <MasterSectionCard>
          <Typography variant="body2" color="text.secondary">
            The requested user could not be found.
          </Typography>
        </MasterSectionCard>
      </MasterPageShell>
    );
  }

  const pageLabel =
    mode === "add" ? "Add User" : mode === "edit" ? "Edit User" : "View User";

  const handleSave = async () => {
    if (!canUseMode) {
      return;
    }

    setHasSubmitted(true);

    if (mode === "add" && hasRequiredFieldErrors(activeFields, values)) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      if (mode === "add") {
        await createUserManagementRecord(values);
      } else if (mode === "edit" && params.id) {
        await updateUserManagementRecord(params.id, values);
      }

      navigate(paths.list);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to save user.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MasterPageShell
      breadcrumbs={[
        { label: "User Management", to: paths.list },
        { label: pageLabel },
      ]}
      title={pageLabel}
    >
      {!canUseMode ? (
        <Alert severity="warning">
          You do not have permission to {mode} users.
        </Alert>
      ) : null}

      <MasterSectionCard>
        <Stack
          sx={(theme) => ({
            gap: theme.spacing(3),
          })}
          >
          {canUseMode && errorMessage ? (
            <Alert severity="error">{errorMessage}</Alert>
          ) : null}

          {canUseMode && isLoading ? (
            <Typography variant="body2" color="text.secondary">
              Loading user details...
            </Typography>
          ) : canUseMode ? (
          <MasterFormFields
            definition={{
              fields: activeFields as MasterFieldDefinition[],
              gridColumns: 4,
            }}
            onChange={(key, value) =>
              setValues((current) => ({
                ...current,
                [key]: value,
              }))
            }
            readOnly={mode === "view"}
            showRequiredErrors={mode === "add" && hasSubmitted}
            values={values}
          />
          ) : null}

          <Box
            sx={(theme) => ({
              display: "flex",
              justifyContent: "center",
              gap: theme.spacing(1.5),
              flexWrap: "wrap",
            })}
          >
            {mode === "view" ? (
              <>
                <Button
                  onClick={() => navigate(paths.list)}
                  startIcon={<ChevronLeft size={16} />}
                  variant="outlined"
                >
                  Back
                </Button>

                {row && canEdit ? (
                  <Button
                    onClick={() => navigate(paths.edit(row.id))}
                    startIcon={<Pencil size={16} />}
                    variant="contained"
                  >
                    Edit
                  </Button>
                ) : null}
              </>
            ) : (
              <>
                <Button
                  disabled={isSaving}
                  onClick={() => navigate(paths.list)}
                  variant="outlined"
                >
                  Cancel
                </Button>

                <Button
                  disabled={isLoading || isSaving}
                  onClick={handleSave}
                  startIcon={<Save size={16} />}
                  variant="contained"
                >
                  {isSaving ? "Saving" : "Save"}
                </Button>
              </>
            )}
          </Box>
        </Stack>
      </MasterSectionCard>
    </MasterPageShell>
  );
}

function withUserRoleOptions(
  fields: readonly MasterFieldDefinition[],
  roleOptions: readonly string[],
  currentRole?: string,
) {
  const options = Array.from(
    new Set(
      [...roleOptions, currentRole ?? ""]
        .map((option) => option.trim())
        .filter(Boolean),
    ),
  );

  return fields.map((field) =>
    field.key === "role"
      ? {
          ...field,
          options,
        }
      : field,
  );
}
