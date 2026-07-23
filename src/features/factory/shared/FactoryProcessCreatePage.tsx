import { useMemo, useRef, useState } from "react";
import type { Theme } from "@mui/material/styles";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router";

import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import { ErpSelectField } from "../../../pages/ComponentLibrary/shared/ErpFieldControls";
import {
  MasterFormFields,
  hasRequiredFieldErrors,
  type MasterFieldDefinition,
  type MasterFieldValue,
} from "../../masters/shared";
import { FactoryPageShell } from "./FactoryPageShell";
import { buildFactoryInitialValues, flattenFactorySections, getFactoryPaths } from "./factoryUtils";
import type { FactoryDefinition, FactoryRecord } from "./types";

type SourceRow = FactoryRecord;

type FactoryCreateLocationState = {
  sourceRow?: SourceRow;
  sourceRows?: SourceRow[];
};

type SourceColumnDefinition = {
  key: string;
  keys: readonly string[];
  label: string;
  minWidth: number;
};

type LineItemColumnDefinition = {
  key: string;
  label: string;
  minWidth: number;
  options?: readonly string[];
  placeholder: string;
  type: "text" | "select";
};

type LineItemRecord = {
  id: string;
  values: Record<string, string>;
};

const sourceColumnDefinitions: readonly SourceColumnDefinition[] = [
  { key: "issueSrNo", keys: ["issueSrNo", "sampleSrNo", "orderNo"], label: "Reference No", minWidth: 150 },
  { key: "issuedFrom", keys: ["issuedFrom", "issuedFor", "process"], label: "Issued From", minWidth: 150 },
  { key: "issuedDate", keys: ["issuedDate", "issueDate", "processDate", "sampleDate"], label: "Date", minWidth: 130 },
  { key: "supplierName", keys: ["supplierName", "customerName"], label: "Source Name", minWidth: 180 },
  { key: "productName", keys: ["productName", "itemName"], label: "Item Name", minWidth: 170 },
  { key: "groupNo", keys: ["groupNo", "palletNo"], label: "Group / Pallet No", minWidth: 150 },
  { key: "itemSubCategory", keys: ["itemSubCategory", "subCategory"], label: "Item Sub Category", minWidth: 170 },
  { key: "color", keys: ["color", "colour", "processColour"], label: "Color", minWidth: 140 },
  { key: "length", keys: ["length"], label: "Length", minWidth: 120 },
  { key: "width", keys: ["width"], label: "Width", minWidth: 120 },
  { key: "thickness", keys: ["thickness", "thickess"], label: "Thickness", minWidth: 120 },
  { key: "noOfSheets", keys: ["noOfSheets", "sampleSheets", "finishedSheets", "issuedLeaves"], label: "Quantity", minWidth: 130 },
  { key: "sqm", keys: ["sqm", "issuedSqm", "finishedSqm"], label: "SQM", minWidth: 120 },
  { key: "amount", keys: ["amount"], label: "Amount", minWidth: 130 },
  { key: "remark", keys: ["remark"], label: "Remark", minWidth: 200 },
] as const;

const metadataKeys = new Set([
  "issueDate",
  "issuedDate",
  "processDate",
  "sampleDate",
  "sampleSrNo",
  "supplierName",
  "customerName",
  "issuedFor",
  "issuedFrom",
  "process",
  "processColour",
  "shift",
  "workers",
  "workingHours",
  "noOfWorkingHours",
  "noOfTotalHours",
  "palletNo",
  "orderNo",
  "orderItemNo",
  "productName",
  "groupNo",
  "purpose",
  "finishType",
  "remark",
]);

const fieldValueAliases: Record<string, readonly string[]> = {
  color: ["color", "colour", "processColour"],
  colour: ["colour", "color", "processColour"],
  itemName: ["itemName", "productName"],
  itemSubCategory: ["itemSubCategory", "subCategory"],
  noOfSheets: ["noOfSheets", "sampleSheets", "finishedSheets", "issuedLeaves"],
  sqm: ["sqm", "issuedSqm", "finishedSqm"],
  thickness: ["thickness", "thickess"],
};

const factoryCreateLineItemPresets: Partial<
  Record<string, readonly MasterFieldDefinition[]>
> = {
  drying: [
    { key: "itemName", label: "Item Name", type: "text" },
    { key: "itemSubCategory", label: "Item Sub Category", type: "text" },
    { key: "processColour", label: "Process Colour", type: "text" },
    { key: "palletNo", label: "Pallet No", type: "text" },
    { key: "noOfBundle", label: "No of Bundle", type: "text" },
    { key: "length", label: "Length", type: "text" },
    { key: "width", label: "Width", type: "text" },
    { key: "thickness", label: "Thickness", type: "text" },
    { key: "remark", label: "Remark", type: "text" },
  ],
};

export function FactoryProcessCreatePage<Row extends FactoryRecord>({
  definition,
}: {
  definition: FactoryDefinition<Row>;
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const paths = getFactoryPaths(definition.slug);
  const nextRowId = useRef(1);
  const locationState = location.state as FactoryCreateLocationState | null;
  const sourceRow =
    (locationState?.sourceRow as Row | undefined) ??
    (locationState?.sourceRows?.[0] as Row | undefined) ??
    (definition.rows[0] as Row | undefined);
  const allFields = useMemo(
    () => flattenFactorySections(definition.formSections),
    [definition.formSections],
  );
  const metadataFields = useMemo(
    () => allFields.filter((field) => metadataKeys.has(field.key)),
    [allFields],
  );
  const lineItemFields = useMemo(
    () => buildLineItemFields(definition.slug, allFields, sourceRow),
    [allFields, definition.slug, sourceRow],
  );
  const sourceColumns = useMemo(
    () => buildSourceColumns(sourceRow, definition.slug),
    [definition.slug, sourceRow],
  );
  const sourceTableWidth = useMemo(
    () => sourceColumns.reduce((total, column) => total + column.minWidth, 0),
    [sourceColumns],
  );
  const lineItemColumns = useMemo(
    () => lineItemFields.map((field) => mapFieldToColumn(field)),
    [lineItemFields],
  );
  const lineItemsTableWidth = useMemo(
    () => lineItemColumns.reduce((total, column) => total + column.minWidth, 0),
    [lineItemColumns],
  );
  const [formValues, setFormValues] = useState<Record<string, MasterFieldValue>>(
    () => buildFactoryInitialValues([{ title: "Create", fields: metadataFields }], sourceRow),
  );
  const [draftValues, setDraftValues] = useState<Record<string, string>>(() =>
    buildDefaultLineItemValues(lineItemFields, sourceRow),
  );
  const [lineItems, setLineItems] = useState<LineItemRecord[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [editingValues, setEditingValues] = useState<Record<string, string>>(() =>
    createEmptyLineItemValues(lineItemFields),
  );

  const handleAddLineItem = () => {
    if (allValuesEmpty(draftValues)) {
      return;
    }

    const nextId = `${definition.slug}-line-item-${nextRowId.current}`;
    nextRowId.current += 1;

    setLineItems((current) => [
      ...current,
      {
        id: nextId,
        values: { ...draftValues },
      },
    ]);
    setDraftValues(buildDefaultLineItemValues(lineItemFields, sourceRow));
  };

  const handleDeleteLineItem = (rowId: string) => {
    setLineItems((current) => current.filter((row) => row.id !== rowId));

    if (editingRowId === rowId) {
      setEditingRowId(null);
      setEditingValues(createEmptyLineItemValues(lineItemFields));
    }
  };

  const handleStartEdit = (row: LineItemRecord) => {
    setEditingRowId(row.id);
    setEditingValues({ ...row.values });
  };

  const handleSaveEdit = (rowId: string) => {
    setLineItems((current) =>
      current.map((row) =>
        row.id === rowId
          ? {
              ...row,
              values: { ...editingValues },
            }
          : row,
      ),
    );
    setEditingRowId(null);
    setEditingValues(createEmptyLineItemValues(lineItemFields));
  };

  return (
    <FactoryPageShell
      breadcrumbs={[
        { label: "Factory", to: "/factory" },
        { label: definition.title, to: paths.list },
        { label: `Create ${definition.title}` },
      ]}
      title={`Create ${definition.title}`}
    >
      <Stack
        sx={(currentTheme) => ({
          gap: currentTheme.spacing(3),
        })}
      >
        <Box
          sx={(currentTheme) => ({
            border: `1px solid ${currentTheme.customTokens.borders.default}`,
            borderRadius: `${currentTheme.customTokens.radius.md}px`,
            backgroundColor: currentTheme.customTokens.surfaces.surface,
            overflow: "hidden",
          })}
        >
          <Box sx={getScrollableTableSx(theme)}>
            <Table
              size="small"
              sx={{ minWidth: Math.max(sourceTableWidth, 720), tableLayout: "auto" }}
            >
              <TableHead>
                <TableRow>
                  {sourceColumns.map((column) => (
                    <TableCell
                      key={column.key}
                      sx={getHeaderCellSx(theme, column.minWidth)}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {sourceColumns.map((column) => (
                    <TableCell key={column.key} sx={getBodyCellSx(theme)}>
                      {renderReadOnlyCell(
                        formatSourceValue(getSourceValue(sourceRow, column.keys)),
                        theme,
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Box>

        {metadataFields.length > 0 ? (
          <MasterFormFields
            definition={{
              fields: metadataFields,
              gridColumns: metadataFields.length >= 5 ? 5 : 4,
            }}
            onChange={(key, value) =>
              setFormValues((current) => ({
                ...current,
                [key]: value,
              }))
            }
            showRequiredErrors={hasSubmitted}
            values={formValues}
          />
        ) : null}

        <Stack sx={{ gap: theme.spacing(2) }}>
          <Box
            sx={{
              border: `1px solid ${theme.customTokens.borders.default}`,
              borderRadius: `${theme.customTokens.radius.md}px`,
              backgroundColor: theme.customTokens.surfaces.surface,
              overflow: "hidden",
            }}
          >
            <Box sx={getScrollableTableSx(theme)}>
              <Table
                size="small"
                sx={{ minWidth: Math.max(lineItemsTableWidth, 640), tableLayout: "auto" }}
              >
                <TableHead>
                  <TableRow>
                    {lineItemColumns.map((column) => (
                      <TableCell
                        key={column.key}
                        sx={getHeaderCellSx(theme, column.minWidth)}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    {lineItemColumns.map((column) => (
                      <TableCell key={column.key} sx={getBodyCellSx(theme)}>
                        {renderEditableField({
                          column,
                          onChange: (value) =>
                            setDraftValues((current) => ({
                              ...current,
                              [column.key]: value,
                            })),
                          theme,
                          value: draftValues[column.key] ?? "",
                        })}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              disableElevation
              onClick={handleAddLineItem}
              startIcon={<Plus size={16} />}
              variant="contained"
            >
              Add New Item
            </Button>
          </Box>

          {lineItems.length > 0 ? (
            <Box
              sx={{
                border: `1px solid ${theme.customTokens.borders.default}`,
                borderRadius: `${theme.customTokens.radius.md}px`,
                backgroundColor: theme.customTokens.surfaces.surface,
                overflow: "hidden",
              }}
            >
              <Box sx={getScrollableTableSx(theme)}>
                <Table
                  size="small"
                  sx={{ minWidth: Math.max(lineItemsTableWidth + 120, 760), tableLayout: "auto" }}
                >
                  <TableHead>
                    <TableRow>
                      {lineItemColumns.map((column) => (
                        <TableCell
                          key={column.key}
                          sx={getHeaderCellSx(theme, column.minWidth)}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                      <TableCell sx={getHeaderCellSx(theme, 120)}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lineItems.map((row) => {
                      const isEditing = editingRowId === row.id;

                      return (
                        <TableRow
                          key={row.id}
                          sx={{
                            "&:nth-of-type(even)": {
                              backgroundColor: theme.customTokens.surfaces.alt,
                            },
                          }}
                        >
                          {lineItemColumns.map((column) => (
                            <TableCell key={column.key} sx={getBodyCellSx(theme)}>
                              {isEditing
                                ? renderEditableField({
                                    column,
                                    onChange: (value) =>
                                      setEditingValues((current) => ({
                                        ...current,
                                        [column.key]: value,
                                      })),
                                    theme,
                                    value: editingValues[column.key] ?? "",
                                  })
                                : renderReadOnlyCell(row.values[column.key] ?? "", theme)}
                            </TableCell>
                          ))}
                          <TableCell align="center" sx={getBodyCellSx(theme)}>
                            <Stack
                              direction="row"
                              justifyContent="center"
                              spacing={0.5}
                            >
                              <IconButton
                                aria-label={isEditing ? "Save item" : "Edit item"}
                                onClick={() =>
                                  isEditing
                                    ? handleSaveEdit(row.id)
                                    : handleStartEdit(row)
                                }
                                sx={getActionButtonSx(theme)}
                              >
                                {isEditing ? <Save size={16} /> : <Pencil size={16} />}
                              </IconButton>

                              <IconButton
                                aria-label="Delete item"
                                onClick={() => handleDeleteLineItem(row.id)}
                                sx={getActionButtonSx(theme)}
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            </Box>
          ) : null}
        </Stack>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: theme.spacing(1.5),
            flexWrap: "wrap",
          }}
        >
          <Button variant="outlined" onClick={() => navigate(paths.list)}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              setHasSubmitted(true);
              if (hasRequiredFieldErrors(metadataFields, formValues)) {
                return;
              }
              navigate(paths.list);
            }}
          >
            Submit
          </Button>
        </Box>
      </Stack>
    </FactoryPageShell>
  );
}

function buildSourceColumns(sourceRow?: SourceRow, slug?: string) {
  const visibleColumns = sourceColumnDefinitions.filter((column) => {
    if (slug === "drying" && column.key === "remark") {
      return false;
    }

    const value = getSourceValue(sourceRow, column.keys);
    return value !== null && typeof value !== "undefined" && String(value).trim().length > 0;
  });

  return visibleColumns.length > 0
    ? visibleColumns
    : sourceColumnDefinitions.slice(0, 6);
}

function buildLineItemFields(
  slug: string,
  fields: readonly MasterFieldDefinition[],
  sourceRow?: SourceRow,
) {
  const presetFields = factoryCreateLineItemPresets[slug];

  if (presetFields) {
    return presetFields;
  }

  const relevantFields = dedupeFields(
    fields.filter((field) => {
      if (field.key === "remark") {
        return true;
      }

      return !metadataKeys.has(field.key);
    }),
  ).map((field) =>
    field.type === "textarea"
      ? {
          ...field,
          type: "text" as const,
        }
      : field,
  );

  if (relevantFields.length > 0) {
    return relevantFields;
  }

  const fallbackFields: MasterFieldDefinition[] = [
    { key: "itemName", label: "Item Name", type: "text" },
    { key: "itemSubCategory", label: "Item Sub Category", type: "text" },
    { key: "color", label: "Color", type: "text" },
    { key: "length", label: "Length", type: "text" },
    { key: "width", label: "Width", type: "text" },
    { key: "thickness", label: "Thickness", type: "text" },
    { key: "remark", label: "Remark", type: "text" },
  ];

  return fallbackFields.filter((field) => {
    const value = getPreferredFieldValue(sourceRow, field.key);
    return typeof value === "string" && value.trim().length > 0;
  });
}

function dedupeFields(fields: readonly MasterFieldDefinition[]) {
  const seen = new Set<string>();
  return fields.filter((field) => {
    if (seen.has(field.key)) {
      return false;
    }

    seen.add(field.key);
    return true;
  });
}

function buildDefaultLineItemValues(
  fields: readonly MasterFieldDefinition[],
  sourceRow?: SourceRow,
) {
  return fields.reduce<Record<string, string>>((accumulator, field) => {
    if (field.key === "remark") {
      accumulator[field.key] = "";
      return accumulator;
    }

    const value = getPreferredFieldValue(sourceRow, field.key);
    accumulator[field.key] = typeof value === "string" ? value : "";
    return accumulator;
  }, {});
}

function createEmptyLineItemValues(fields: readonly MasterFieldDefinition[]) {
  return fields.reduce<Record<string, string>>((accumulator, field) => {
    accumulator[field.key] = "";
    return accumulator;
  }, {});
}

function allValuesEmpty(values: Record<string, string>) {
  return Object.values(values).every((value) => value.trim().length === 0);
}

function getPreferredFieldValue(sourceRow: SourceRow | undefined, key: string) {
  const candidateKeys = fieldValueAliases[key] ?? [key];

  for (const candidateKey of candidateKeys) {
    const value = sourceRow?.[candidateKey];

    if (value instanceof Date) {
      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(value);
    }

    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return "";
}

function getSourceValue(sourceRow: SourceRow | undefined, keys: readonly string[]) {
  for (const key of keys) {
    const value = sourceRow?.[key];

    if (value instanceof Date) {
      return value;
    }

    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return "";
}

function formatSourceValue(value: unknown) {
  if (value instanceof Date) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(value);
  }

  return typeof value === "string" ? value : "";
}

function mapFieldToColumn(field: MasterFieldDefinition): LineItemColumnDefinition {
  return {
    key: field.key,
    label: field.label,
    minWidth: Math.max(120, Math.min(220, field.label.length * 10 + 48)),
    placeholder: field.placeholder ?? getDefaultPlaceholder(field),
    type: field.type === "select" ? "select" : "text",
    ...(field.options ? { options: field.options } : {}),
  };
}

function getDefaultPlaceholder(field: MasterFieldDefinition) {
  return field.type === "select" ? `Select ${field.label}` : `Enter ${field.label}`;
}

function renderEditableField({
  column,
  onChange,
  theme,
  value,
}: {
  column: LineItemColumnDefinition;
  onChange: (value: string) => void;
  theme: Theme;
  value: string;
}) {
  if (column.type === "select") {
    return (
      <ErpSelectField
        onChange={onChange}
        options={column.options ?? []}
        placeholder={column.placeholder}
        value={value}
      />
    );
  }

  return (
    <TextField
      fullWidth
      placeholder={column.placeholder}
      size="small"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onWheel={(event) => {
        if (!isWheelAdjustableMeasurementField(column.key)) {
          return;
        }

        event.preventDefault();
        onChange(getNextMeasurementValue(value, event.deltaY));
      }}
      sx={getCompactFieldSx(theme)}
    />
  );
}

function isWheelAdjustableMeasurementField(key: string) {
  return key === "length" || key === "width" || key === "thickness";
}

function getNextMeasurementValue(value: string, deltaY: number) {
  const numericValue = Number.parseFloat(value);
  const currentValue = Number.isFinite(numericValue) ? numericValue : 0;
  const decimalPlaces = getDecimalPlaces(value);
  const step = decimalPlaces > 0 ? 1 / 10 ** decimalPlaces : 1;
  const nextValue = Math.max(
    0,
    currentValue + (deltaY < 0 ? step : -step),
  );

  if (decimalPlaces > 0) {
    return nextValue.toFixed(decimalPlaces);
  }

  return String(Math.round(nextValue));
}

function getDecimalPlaces(value: string) {
  const decimalPart = value.split(".")[1];
  return decimalPart ? decimalPart.length : 0;
}

function renderReadOnlyCell(value: string, theme: Theme) {
  return (
    <Typography
      variant="body2"
      color="text.primary"
      sx={{
        minHeight: theme.spacing(4.5),
        display: "flex",
        alignItems: "center",
      }}
    >
      {value || "-"}
    </Typography>
  );
}

function getHeaderCellSx(theme: Theme, minWidth: number) {
  return {
    minWidth,
    backgroundColor: theme.customTokens.brand.primary,
    borderBottom: `1px solid ${theme.customTokens.brand.primaryScale[800]}`,
    borderRight: `1px solid ${theme.customTokens.brand.primaryScale[800]}`,
    color: theme.customTokens.text.inverse,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 700,
    py: theme.spacing(1.5),
    whiteSpace: "nowrap",
  } as const;
}

function getBodyCellSx(theme: Theme) {
  return {
    borderBottom: `1px solid ${theme.customTokens.borders.default}`,
    borderRight: `1px solid ${theme.customTokens.borders.default}`,
    py: theme.spacing(1),
    verticalAlign: "top",
    whiteSpace: "nowrap",
  } as const;
}

function getScrollableTableSx(theme: Theme) {
  return {
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
  } as const;
}

function getActionButtonSx(theme: Theme) {
  return {
    color: theme.customTokens.navigation.activeText,
    "&:hover": {
      backgroundColor: theme.customTokens.navigation.hoverBackground,
    },
  } as const;
}
