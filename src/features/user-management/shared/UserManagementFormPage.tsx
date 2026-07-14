import { useEffect, useState } from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
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
  const activeFields =
    mode === "view" ? userManagementViewFields : userManagementFormFields;
  const [row, setRow] = useState<UserManagementDetail | undefined>();
  const [isLoading, setIsLoading] = useState(mode !== "add");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notFound, setNotFound] = useState(false);

  const [values, setValues] = useState<Record<string, MasterFieldValue>>(() =>
    buildUserManagementInitialValues(activeFields),
  );

  useEffect(() => {
    let ignore = false;

    async function loadDetail() {
      setErrorMessage("");
      setNotFound(false);

      if (mode === "add") {
        setRow(undefined);
        setValues(buildUserManagementInitialValues(activeFields));
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
          setValues(buildUserManagementInitialValues(activeFields, nextRow));
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
  }, [activeFields, mode, params.id]);

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
      <MasterSectionCard>
        <Stack
          sx={(theme) => ({
            gap: theme.spacing(3),
          })}
          >
          {errorMessage ? (
            <Alert severity="error">{errorMessage}</Alert>
          ) : null}

          {isLoading ? (
            <Typography variant="body2" color="text.secondary">
              Loading user details...
            </Typography>
          ) : (
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
          )}

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
