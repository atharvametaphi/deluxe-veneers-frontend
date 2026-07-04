import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { ChevronLeft, Pencil, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import {
  MasterFormFields,
  MasterPageShell,
  MasterSectionCard,
  type MasterFieldDefinition,
  type MasterFieldValue,
} from "../../masters/shared";
import {
  buildUserManagementInitialValues,
  getUserManagementDetail,
  getUserManagementPaths,
  userManagementFormFields,
  userManagementViewFields,
} from "./userManagementConfig";

interface UserManagementFormPageProps {
  mode: "add" | "edit" | "view";
}

export function UserManagementFormPage({
  mode,
}: UserManagementFormPageProps) {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const paths = getUserManagementPaths();
  const row =
    mode === "add"
      ? undefined
      : params.id
        ? getUserManagementDetail(params.id)
        : undefined;
  const activeFields =
    mode === "view" ? userManagementViewFields : userManagementFormFields;

  const [values, setValues] = useState<Record<string, MasterFieldValue>>(() =>
    buildUserManagementInitialValues(activeFields, row),
  );

  useEffect(() => {
    setValues(buildUserManagementInitialValues(activeFields, row));
  }, [activeFields, row]);

  if ((mode === "edit" || mode === "view") && !row) {
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
            The requested user could not be found in the mock dataset.
          </Typography>
        </MasterSectionCard>
      </MasterPageShell>
    );
  }

  const pageLabel =
    mode === "add" ? "Add User" : mode === "edit" ? "Edit User" : "View User";

  return (
    <MasterPageShell
      breadcrumbs={[
        { label: "User Management", to: paths.list },
        { label: pageLabel },
      ]}
      title={pageLabel}
    >
      <MasterSectionCard>
        <Stack
          sx={(theme) => ({
            gap: theme.spacing(3),
          })}
        >
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
            {mode === "view" ? (
              <>
                <Button
                  onClick={() => navigate(paths.list)}
                  startIcon={<ChevronLeft size={16} />}
                  variant="outlined"
                >
                  Back
                </Button>

                {row ? (
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
              </>
            )}
          </Box>
        </Stack>
      </MasterSectionCard>
    </MasterPageShell>
  );
}
