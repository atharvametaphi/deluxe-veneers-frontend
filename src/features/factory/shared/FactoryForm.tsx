import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { ChevronLeft, Pencil, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import {
  MasterFormFields,
  MasterSectionCard,
  hasRequiredFieldErrors,
  type MasterFieldDefinition,
  type MasterFieldValue,
} from "../../masters/shared";
import {
  canAccessPermission,
  getFactoryPermissionKey,
} from "../../permissions";
import {
  recordFormActionButtonSx,
  recordViewActionButtonSx,
} from "../../shared/buttonStyles";
import { FactoryPageShell } from "./FactoryPageShell";
import {
  buildFactoryInitialValues,
  getFactoryPageSubtitle,
  getFactoryPageTitle,
  getFactoryPaths,
} from "./factoryUtils";
import type {
  FactoryDefinition,
  FactoryFormSection,
  FactoryPageMode,
  FactoryRecord,
} from "./types";

interface FactoryFormProps<Row extends FactoryRecord> {
  definition: FactoryDefinition<Row>;
  mode: Exclude<FactoryPageMode, "list">;
}

export function FactoryForm<Row extends FactoryRecord>({
  definition,
  mode,
}: FactoryFormProps<Row>) {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const paths = getFactoryPaths(definition.slug);
  const permissionKey = getFactoryPermissionKey(definition.slug);
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
      : definition.rows.find((record) => record.id === params.id);

  const [values, setValues] = useState<Record<string, MasterFieldValue>>(() =>
    buildFactoryInitialValues(definition.formSections, row),
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    setValues(buildFactoryInitialValues(definition.formSections, row));
  }, [definition.formSections, row]);

  const shouldShowItemTable = mode === "view" || mode === "edit";
  const itemTableFields = shouldShowItemTable ? factoryItemTableFields : [];
  const visibleFormSections =
    shouldShowItemTable
      ? definition.formSections.filter((section) => !isFactoryItemSection(section))
      : definition.formSections;

  if ((mode === "edit" || mode === "view") && !row) {
    return (
      <FactoryPageShell
        breadcrumbs={[
          { label: "Factory", to: "/factory" },
          { label: definition.title, to: paths.list },
          { label: "Not Found" },
        ]}
        title={definition.title}
      >
        <MasterSectionCard>
          <Typography variant="body2" color="text.secondary">
            The requested factory process record could not be found in the mock dataset.
          </Typography>
        </MasterSectionCard>
      </FactoryPageShell>
    );
  }

  if (!canUseMode) {
    return (
      <FactoryPageShell
        breadcrumbs={[
          { label: "Factory", to: "/factory" },
          { label: definition.title, to: paths.list },
          { label: mode === "add" ? "Add" : mode === "edit" ? "Edit" : "View" },
        ]}
        title={getFactoryPageTitle(definition, mode)}
      >
        <Alert severity="warning">
          You do not have permission to {mode} this factory process.
        </Alert>
      </FactoryPageShell>
    );
  }

  const primaryLabel = mode === "add" ? "Save" : "Update";

  return (
    <FactoryPageShell
      breadcrumbs={[
        { label: "Factory", to: "/factory" },
        { label: definition.title, to: paths.list },
        { label: mode === "add" ? "Add" : mode === "edit" ? "Edit" : "View" },
      ]}
      subtitle={getFactoryPageSubtitle(definition, mode)}
      title={getFactoryPageTitle(definition, mode)}
    >
      <MasterSectionCard>
        <Stack
          sx={(theme) => ({
            gap: theme.spacing(4),
          })}
        >
          {visibleFormSections.map((section) => (
            <Stack
              key={section.title}
              sx={(theme) => ({
                gap: theme.spacing(2),
              })}
            >
              <Stack
                sx={(theme) => ({
                  gap: theme.spacing(0.75),
                })}
              >
                <Typography variant="h3" color="text.primary">
                  {section.title}
                </Typography>

                {section.description ? (
                  <Typography variant="body2" color="text.secondary">
                    {section.description}
                  </Typography>
                ) : null}
              </Stack>

              <MasterFormFields
                definition={{
                  gridColumns: 4,
                  fields: section.fields,
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
            </Stack>
          ))}

          {shouldShowItemTable && row && itemTableFields.length > 0 ? (
            <FactoryItemTable fields={itemTableFields} row={row} />
          ) : null}

          <Box
            sx={(theme) => ({
              display: "flex",
              justifyContent: "center",
              gap: theme.spacing(1),
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
                  onClick={() => navigate(paths.list)}
                  sx={recordFormActionButtonSx}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  variant="contained"
                  startIcon={<Save size={16} />}
                  sx={recordFormActionButtonSx}
                  onClick={() => {
                    setHasSubmitted(true);
                    if (
                      mode === "add" &&
                      definition.formSections.some((section) =>
                        hasRequiredFieldErrors(section.fields, values),
                      )
                    ) {
                      return;
                    }
                    navigate(paths.list);
                  }}
                >
                  {primaryLabel}
                </Button>
              </>
            )}
          </Box>
        </Stack>
      </MasterSectionCard>
    </FactoryPageShell>
  );
}

const factoryItemTableFields: readonly MasterFieldDefinition[] = [
  { key: "itemSubCategory", label: "Item Sub Category", type: "text" },
  { key: "itemName", label: "Item Name", type: "text" },
  { key: "color", label: "Color", type: "text" },
  { key: "length", label: "Length", type: "text" },
  { key: "width", label: "Width", type: "text" },
  { key: "thickness", label: "Thickness", type: "text" },
  { key: "cmt", label: "CMT", type: "text" },
  { key: "amount", label: "Amount", type: "text" },
  { key: "remark", label: "Remark", type: "text" },
];

function isFactoryItemSection(section: FactoryFormSection) {
  return section.title.toLowerCase().includes("item");
}

function FactoryItemTable({
  fields,
  row,
}: {
  fields: readonly MasterFieldDefinition[];
  row: FactoryRecord;
}) {
  const tableWidth = fields.reduce(
    (total, field) => total + getFactoryItemColumnWidth(field.label),
    0,
  );

  return (
    <Stack
      sx={(theme) => ({
        gap: theme.spacing(2),
      })}
    >
      <Typography variant="h3" color="text.primary">
        Item Details
      </Typography>

      <Box
        sx={(theme) => ({
          border: `1px solid ${theme.customTokens.borders.default}`,
          borderRadius: `${theme.customTokens.radius.md}px`,
          backgroundColor: theme.customTokens.surfaces.surface,
          overflow: "hidden",
        })}
      >
        <Box
          sx={(theme) => ({
            overflowX: "auto",
            overflowY: "hidden",
            scrollbarWidth: "thin",
            scrollbarColor: `${theme.customTokens.brand.primary} ${theme.customTokens.surfaces.alt}`,
            "&::-webkit-scrollbar": {
              height: 8,
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: theme.customTokens.surfaces.alt,
            },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: 999,
              backgroundColor: theme.customTokens.brand.primary,
            },
          })}
        >
          <Table
            size="small"
            sx={{
              minWidth: Math.max(tableWidth, 720),
              tableLayout: "auto",
            }}
          >
            <TableHead>
              <TableRow>
                {fields.map((field) => (
                  <TableCell
                    key={field.key}
                    sx={(theme) => ({
                      minWidth: getFactoryItemColumnWidth(field.label),
                      backgroundColor: theme.customTokens.brand.primary,
                      borderBottom: `1px solid ${theme.customTokens.brand.primaryScale[800]}`,
                      borderRight: `1px solid ${theme.customTokens.brand.primaryScale[800]}`,
                      color: theme.customTokens.text.inverse,
                      fontSize: theme.typography.caption.fontSize,
                      fontWeight: 700,
                      py: theme.spacing(1.5),
                      whiteSpace: "nowrap",
                    })}
                  >
                    {field.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {fields.map((field) => (
                  <TableCell
                    key={field.key}
                    sx={(theme) => ({
                      borderBottom: `1px solid ${theme.customTokens.borders.default}`,
                      borderRight: `1px solid ${theme.customTokens.borders.default}`,
                      py: theme.spacing(1.25),
                      verticalAlign: "top",
                      whiteSpace: "nowrap",
                    })}
                  >
                    <Typography variant="body2" color="text.primary">
                      {formatFactoryItemValue(row[field.key])}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Stack>
  );
}

function getFactoryItemColumnWidth(label: string) {
  return Math.max(120, Math.min(220, label.length * 10 + 56));
}

function formatFactoryItemValue(value: FactoryRecord[string]) {
  if (value instanceof Date) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (value === null || typeof value === "undefined" || value === "") {
    return "-";
  }

  return String(value);
}
