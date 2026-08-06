import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { ChevronLeft, Pencil, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import {
  canAccessPermission,
  getMasterPermissionKey,
} from "../../permissions";
import {
  recordFormActionButtonSx,
  recordViewActionButtonSx,
} from "../../shared/buttonStyles";
import { MasterFormFields, hasFormFieldErrors } from "./MasterFormFields";
import { MasterPageShell } from "./MasterPageShell";
import { MasterSectionCard } from "./MasterSectionCard";
import {
  buildLocalMasterDefinition,
  createLocalMasterRecord,
  updateLocalMasterRecord,
} from "./localMasterStore";
import type {
  MasterDefinition,
  MasterFieldDefinition,
  MasterFieldValue,
  MasterRecord,
} from "./types";
import {
  buildMasterInitialValues,
  getMasterPageTitle,
  getMasterPaths,
} from "./utils";

interface MasterFormPageProps {
  additionalValues?: Record<string, MasterFieldValue>;
  afterFields?: ReactNode;
  beforeSave?: () => boolean;
  cancelTo?: string;
  definition: MasterDefinition;
  mode: "add" | "edit" | "view";
  onSave?: (context: {
    definition: MasterDefinition;
    mode: "add" | "edit";
    row?: MasterRecord;
    values: Record<string, MasterFieldValue>;
  }) => void;
}

const remarkField: MasterFieldDefinition = {
  key: "remark",
  label: "Remark",
  type: "text",
};

function hasRemarkField(fields: readonly MasterFieldDefinition[]) {
  return fields.some((field) => {
    const key = field.key.toLowerCase();
    const label = field.label.toLowerCase();

    return key === "remark" || key === "remarks" || label === "remark";
  });
}

function getMasterFormDefinitionForMode(
  definition: MasterDefinition,
  mode: "add" | "edit" | "view",
): MasterDefinition {
  const fields =
    mode === "add"
      ? definition.fields.filter((field) => field.key !== "status")
      : definition.fields;

  return {
    ...definition,
    fields: hasRemarkField(fields) ? fields : [...fields, remarkField],
  };
}

export function MasterFormPage({
  additionalValues,
  afterFields,
  beforeSave,
  cancelTo,
  definition,
  mode,
  onSave,
}: MasterFormPageProps) {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const localDefinition = useMemo(
    () => buildLocalMasterDefinition(definition),
    [definition],
  );
  const paths = getMasterPaths(localDefinition.slug);
  const cancelPath = cancelTo ?? paths.list;
  const permissionKey = getMasterPermissionKey(localDefinition.slug);
  const canCreate = canAccessPermission(permissionKey, "create");
  const canEdit = canAccessPermission(permissionKey, "edit");
  const canView = canAccessPermission(permissionKey, "view");
  const canUseMode =
    (mode === "add" && canCreate) ||
    (mode === "edit" && canEdit) ||
    (mode === "view" && canView);

  const row =
    mode === "add"
      ? undefined
      : localDefinition.rows.find((record) => record.id === params.id);

  const [values, setValues] = useState<Record<string, MasterFieldValue>>(() =>
    buildMasterInitialValues(localDefinition, row),
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const formDefinition = getMasterFormDefinitionForMode(localDefinition, mode);
  const handleCancel = () => {
    navigate(cancelPath, { replace: true });
  };

  useEffect(() => {
    setValues(buildMasterInitialValues(localDefinition, row));
  }, [localDefinition, row]);

  if ((mode === "edit" || mode === "view") && !row) {
    return (
      <MasterPageShell
        breadcrumbs={[
          { label: "Masters", to: "/masters" },
          { label: localDefinition.title, to: paths.list },
          { label: "Not Found" },
        ]}
        title={localDefinition.title}
      >
        <MasterSectionCard>
          <Typography variant="body2" color="text.secondary">
            The requested record could not be found in the mock dataset.
          </Typography>
        </MasterSectionCard>
      </MasterPageShell>
    );
  }

  if (!canUseMode) {
    return (
      <MasterPageShell
        breadcrumbs={[
          { label: "Masters", to: "/masters" },
          { label: localDefinition.title, to: paths.list },
          { label: mode === "add" ? "Add" : mode === "edit" ? "Edit" : "View" },
        ]}
        title={getMasterPageTitle(localDefinition, mode)}
      >
        <Alert severity="warning">
          You do not have permission to {mode} this master record.
        </Alert>
      </MasterPageShell>
    );
  }

  const handleSave = () => {
    if (mode === "view") {
      return;
    }

    setHasSubmitted(true);

    const canSaveAdditionalContent = beforeSave?.() ?? true;

    if (
      hasFormFieldErrors(formDefinition.fields, values) ||
      !canSaveAdditionalContent
    ) {
      return;
    }

    const valuesToSave = {
      ...values,
      ...(additionalValues ?? {}),
      ...(mode === "add" && !values.status ? { status: "Active" } : {}),
    };

    const saveContext = row
      ? {
          definition: localDefinition,
          mode,
          row,
          values: valuesToSave,
        }
      : {
          definition: localDefinition,
          mode,
          values: valuesToSave,
        };

    if (onSave) {
      onSave(saveContext);
    } else if (row) {
      updateLocalMasterRecord(localDefinition, row, valuesToSave);
    } else {
      createLocalMasterRecord(localDefinition, valuesToSave);
    }

    navigate(paths.list);
  };

  const handleFieldChange = (key: string, value: MasterFieldValue) => {
    setValues((current) => {
      const nextValues = {
        ...current,
        [key]: value,
      };

      formDefinition.fields.forEach((field) => {
        const autoFillConfig = field.autoFillFrom;

        if (!autoFillConfig || autoFillConfig.sourceKey !== key) {
          return;
        }

        if (typeof value !== "string") {
          nextValues[field.key] = "";
          return;
        }

        const matchedRow = autoFillConfig.rows.find(
          (row) => String(row[autoFillConfig.sourceMatchKey] ?? "") === value,
        );

        nextValues[field.key] = matchedRow
          ? String(matchedRow[autoFillConfig.sourceValueKey] ?? "")
          : "";
      });

      return nextValues;
    });
  };

  return (
    <MasterPageShell
      breadcrumbs={[
        { label: "Masters", to: "/masters" },
        { label: localDefinition.title, to: paths.list },
        { label: mode === "add" ? "Add" : mode === "edit" ? "Edit" : "View" },
      ]}
      title={getMasterPageTitle(localDefinition, mode)}
    >
      <MasterSectionCard>
        <Stack
          sx={(theme) => ({
            gap: theme.spacing(3),
          })}
        >
          <MasterFormFields
            definition={formDefinition}
            onChange={handleFieldChange}
            readOnly={mode === "view"}
            showRequiredErrors={mode !== "view" && hasSubmitted}
            values={values}
          />

          {afterFields}

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
                  variant="outlined"
                  startIcon={<ChevronLeft size={16} />}
                  onClick={() => navigate(paths.list)}
                  sx={recordViewActionButtonSx}
                >
                  Back
                </Button>

                {canEdit ? (
                  <Button
                    variant="contained"
                    startIcon={<Pencil size={16} />}
                    sx={recordViewActionButtonSx}
                    onClick={() => {
                      if (row) {
                        navigate(paths.edit(row.id));
                      }
                    }}
                  >
                    Edit
                  </Button>
                ) : null}
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleCancel}
                  sx={recordFormActionButtonSx}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  variant="contained"
                  startIcon={<Save size={16} />}
                  onClick={handleSave}
                  sx={recordFormActionButtonSx}
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
