import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { ChevronLeft, Pencil, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import {
  MasterFormFields,
  MasterListingPage,
  MasterPageShell,
  MasterSectionCard,
  getMasterPaths,
  type MasterFieldDefinition,
  type MasterFieldValue,
} from "../../shared";
import {
  buildDepartmentMasterInitialValues,
  departmentAccessSections,
  departmentMasterDefinition,
  getAllDepartmentModuleKeys,
  getDepartmentMasterDetail,
} from "../mock/departmentMasterData";
import { DepartmentModuleAccessMatrix } from "../components/DepartmentModuleAccessMatrix";

type DepartmentMasterFormMode = "add" | "edit" | "view";

interface DepartmentMasterFormPageProps {
  mode: DepartmentMasterFormMode;
}

export function DepartmentMasterListPage() {
  return <MasterListingPage definition={departmentMasterDefinition} />;
}

export function AddDepartmentMasterPage() {
  return <DepartmentMasterFormPage mode="add" />;
}

export function EditDepartmentMasterPage() {
  return <DepartmentMasterFormPage mode="edit" />;
}

export function ViewDepartmentMasterPage() {
  return <DepartmentMasterFormPage mode="view" />;
}

function DepartmentMasterFormPage({ mode }: DepartmentMasterFormPageProps) {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const paths = getMasterPaths(departmentMasterDefinition.slug);
  const row =
    mode === "add"
      ? undefined
      : params.id
        ? getDepartmentMasterDetail(params.id)
        : undefined;

  const [values, setValues] = useState<Record<string, MasterFieldValue>>(() =>
    buildDepartmentMasterInitialValues(row),
  );
  const [selectedKeys, setSelectedKeys] = useState<readonly string[]>(() =>
    row?.selectedModuleKeys ?? [],
  );

  useEffect(() => {
    setValues(buildDepartmentMasterInitialValues(row));
    setSelectedKeys(row?.selectedModuleKeys ?? []);
  }, [row]);

  if ((mode === "edit" || mode === "view") && !row) {
    return (
      <MasterPageShell
        breadcrumbs={[
          { label: "Masters", to: "/masters" },
          { label: departmentMasterDefinition.title, to: paths.list },
          { label: "Not Found" },
        ]}
        title={departmentMasterDefinition.title}
      >
        <MasterSectionCard>
          <Typography variant="body2" color="text.secondary">
            The requested record could not be found in the mock dataset.
          </Typography>
        </MasterSectionCard>
      </MasterPageShell>
    );
  }

  const pageTitle =
    mode === "add"
      ? "Add Department"
      : mode === "edit"
        ? "Edit Department"
        : "View Department";

  return (
    <MasterPageShell
      breadcrumbs={[
        { label: "Masters", to: "/masters" },
        { label: departmentMasterDefinition.title, to: paths.list },
        { label: mode === "add" ? "Add" : mode === "edit" ? "Edit" : "View" },
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
              fields: departmentMasterDefinition.fields as MasterFieldDefinition[],
              gridColumns: departmentMasterDefinition.gridColumns,
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

          <DepartmentModuleAccessMatrix
            onToggleAll={(checked) =>
              setSelectedKeys(checked ? getAllDepartmentModuleKeys() : [])
            }
            onToggleItem={(key, checked) =>
              setSelectedKeys((current) => {
                if (checked) {
                  return current.includes(key) ? current : [...current, key];
                }

                return current.filter((itemKey) => itemKey !== key);
              })
            }
            readOnly={mode === "view"}
            sections={departmentAccessSections}
            selectedKeys={selectedKeys}
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
