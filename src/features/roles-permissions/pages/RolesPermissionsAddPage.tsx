import { Box, Button, Stack } from "@mui/material";
import { Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import {
  MasterFormFields,
  MasterPageShell,
  MasterSectionCard,
  type MasterFieldDefinition,
  type MasterFieldValue,
} from "../../masters/shared";
import {
  buildRolePermissionInitialValues,
  getRolePermissionPaths,
  rolePermissionFormFields,
} from "../shared";

export function RolesPermissionsAddPage() {
  const navigate = useNavigate();
  const paths = getRolePermissionPaths();
  const [values, setValues] = useState<Record<string, MasterFieldValue>>(() =>
    buildRolePermissionInitialValues(rolePermissionFormFields),
  );

  return (
    <MasterPageShell
      breadcrumbs={[
        { label: "Roles & Permissions", to: paths.list },
        { label: "Add Role" },
      ]}
      title="Add Role"
    >
      <MasterSectionCard>
        <Stack
          sx={(theme) => ({
            gap: theme.spacing(3),
          })}
        >
          <MasterFormFields
            definition={{
              fields: rolePermissionFormFields as MasterFieldDefinition[],
              gridColumns: 4,
            }}
            onChange={(key, value) =>
              setValues((current) => ({
                ...current,
                [key]: value,
              }))
            }
            values={values}
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
              onClick={() => navigate(paths.list)}
              variant="outlined"
            >
              Cancel
            </Button>

            <Button
              onClick={() => navigate(paths.list)}
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
