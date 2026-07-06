import { useEffect, useMemo, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Save } from "lucide-react";
import { useParams } from "react-router";

import {
  MasterFormFields,
  MasterPageShell,
  MasterSectionCard,
  type MasterFieldDefinition,
  type MasterFieldValue,
} from "../../masters/shared";
import {
  UserPermissionMatrix,
  buildUserManagementInitialValues,
  getUserManagementDetail,
  type UserPermissionFlags,
  userManagementConfigureFields,
} from "../../user-management/shared";
import {
  buildDefaultRolePermissions,
  buildRolePermissionInitialValues,
  getRolePermissionDetail,
  getRolePermissionPaths,
  rolePermissionConfigureFields,
} from "../shared";

type ConfigureRecord = ReturnType<typeof getRolePermissionDetail> | ReturnType<typeof getUserManagementDetail>;

function getActiveFields(
  selectedRole: ReturnType<typeof getRolePermissionDetail>,
  selectedUser: ReturnType<typeof getUserManagementDetail>,
) {
  if (selectedRole) {
    return rolePermissionConfigureFields as MasterFieldDefinition[];
  }

  return userManagementConfigureFields.map((field) =>
    field.key === "userName"
      ? {
          ...field,
          placeholder: "Selected User",
          readOnly: true,
          type: "text" as const,
        }
      : field,
  ) as MasterFieldDefinition[];
}

function buildValues(
  fields: readonly MasterFieldDefinition[],
  selectedRole: ReturnType<typeof getRolePermissionDetail>,
  selectedUser: ReturnType<typeof getUserManagementDetail>,
) {
  if (selectedRole) {
    return buildRolePermissionInitialValues(fields, selectedRole);
  }

  return buildUserManagementInitialValues(fields, selectedUser);
}

function buildPermissions(record: ConfigureRecord) {
  if (record?.permissions) {
    return record.permissions;
  }

  return buildDefaultRolePermissions();
}

function getPageTitle(selectedRole: ReturnType<typeof getRolePermissionDetail>) {
  return selectedRole ? "Configure Role" : "Configure Permissions";
}

export function RolesPermissionsConfigurePage() {
  const params = useParams<{ id: string }>();
  const paths = getRolePermissionPaths();
  const selectedRole = params.id ? getRolePermissionDetail(params.id) : undefined;
  const selectedUser = selectedRole
    ? undefined
    : params.id
      ? getUserManagementDetail(params.id)
      : undefined;
  const selectedRecord = selectedRole ?? selectedUser;
  const activeFields = useMemo(
    () => getActiveFields(selectedRole, selectedUser),
    [selectedRole, selectedUser],
  );
  const [values, setValues] = useState<Record<string, MasterFieldValue>>(() =>
    buildValues(activeFields, selectedRole, selectedUser),
  );
  const [permissions, setPermissions] = useState<Record<string, UserPermissionFlags>>(
    () => buildPermissions(selectedRecord),
  );

  useEffect(() => {
    setValues(buildValues(activeFields, selectedRole, selectedUser));
    setPermissions(buildPermissions(selectedRecord));
  }, [activeFields, selectedRole, selectedRecord, selectedUser]);

  if (!selectedRecord) {
    return (
      <MasterPageShell
        breadcrumbs={[
          { label: "Roles & Permissions", to: paths.list },
          { label: "Not Found" },
        ]}
        title="Roles & Permissions"
      >
        <MasterSectionCard>
          <Typography variant="body2" color="text.secondary">
            The requested configuration record could not be found.
          </Typography>
        </MasterSectionCard>
      </MasterPageShell>
    );
  }

  const pageTitle = getPageTitle(selectedRole);

  return (
    <MasterPageShell
      breadcrumbs={[
        { label: "Roles & Permissions", to: paths.list },
        { label: pageTitle },
      ]}
      title={pageTitle}
    >
      <MasterSectionCard>
        <Stack
          sx={(theme) => ({
            gap: theme.spacing(3),
          })}
        >
          <MasterFormFields
            definition={{
              fields: activeFields,
              gridColumns: 4,
            }}
            onChange={(key, value) => {
              setValues((current) => ({
                ...current,
                [key]: value,
              }));
            }}
            values={values}
          />

          <UserPermissionMatrix
            onToggle={(itemKey, action, checked) =>
              setPermissions((current) => {
                const currentPermissions = current[itemKey] ?? {
                  create: false,
                  edit: false,
                  view: false,
                };

                return {
                  ...current,
                  [itemKey]: {
                    ...currentPermissions,
                    [action]: checked,
                  },
                };
              })
            }
            permissions={permissions}
          />

          <Box
            sx={(theme) => ({
              display: "flex",
              justifyContent: "center",
              gap: theme.spacing(1.5),
              flexWrap: "wrap",
            })}
          >
            <Button
              startIcon={<Save size={16} />}
              variant="contained"
            >
              Save
            </Button>
          </Box>
        </Stack>
      </MasterSectionCard>
    </MasterPageShell>
  );
}
