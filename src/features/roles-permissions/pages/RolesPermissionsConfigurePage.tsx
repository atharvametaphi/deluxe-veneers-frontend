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
  buildDefaultUserPermissions,
  buildUserManagementInitialValues,
  getUserManagementDetail,
  type UserPermissionFlags,
  userManagementFormFields,
} from "../../user-management/shared";

export function RolesPermissionsConfigurePage() {
  const params = useParams<{ id: string }>();
  const selectedUser = params.id ? getUserManagementDetail(params.id) : undefined;
  const activeFields = useMemo(
    () =>
      userManagementFormFields.map((field) =>
        field.key === "userName"
          ? {
              ...field,
              placeholder: "Selected user",
              readOnly: true,
              type: "text" as const,
            }
          : field,
      ) as MasterFieldDefinition[],
    [],
  );
  const [values, setValues] = useState<Record<string, MasterFieldValue>>(() =>
    buildUserManagementInitialValues(activeFields, selectedUser),
  );
  const [permissions, setPermissions] = useState<Record<string, UserPermissionFlags>>(
    () => selectedUser?.permissions ?? buildDefaultUserPermissions(),
  );

  useEffect(() => {
    setValues(buildUserManagementInitialValues(activeFields, selectedUser));
    setPermissions(selectedUser?.permissions ?? buildDefaultUserPermissions());
  }, [activeFields, selectedUser]);

  if (!selectedUser) {
    return (
      <MasterPageShell
        breadcrumbs={[
          { label: "Roles & Permissions", to: "/roles-permissions" },
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

  return (
    <MasterPageShell
      breadcrumbs={[
        { label: "Roles & Permissions", to: "/roles-permissions" },
        { label: "Configure" },
      ]}
      title="Roles & Permissions"
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
