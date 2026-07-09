import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
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

import { getCompactFieldSx } from "../../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import {
  ErpDatePickerField,
  ErpSelectField,
} from "../../../../pages/ComponentLibrary/shared/ErpFieldControls";
import {
  FactoryPageShell,
  getFactoryPaths,
  slicingDefinition,
} from "../../shared";

type SourceRow = {
  id: string;
  [key: string]: unknown;
};

type SlicingLocationState = {
  sourceRow?: SourceRow;
  sourceRows?: SourceRow[];
};

type HeaderColumn = {
  key: keyof SlicingSourceSummary;
  label: string;
  minWidth: number;
};

type LineItemColumn = {
  key: keyof SlicingLineItemValues;
  label: string;
  minWidth: number;
  options?: readonly string[];
  placeholder: string;
  type: "select" | "text";
};

type SlicingSourceSummary = {
  amount: string;
  cmt: string;
  color: string;
  flitchCode: string;
  height: string;
  itemName: string;
  itemSubCategory: string;
  length: string;
  logNoCode: string;
  remark: string;
  srNo: string;
  width: string;
};

type SlicingFormValues = {
  noOfTotalHours: string;
  noOfWorkers: string;
  noOfWorkingHours: string;
  shift: string;
  slicingDate: Date | null;
};

type SlicingLineItemValues = {
  character: string;
  color: string;
  flitchSide: string;
  grade: string;
  itemName: string;
  logNo: string;
  noOfLeaves: string;
  pattern: string;
  remark: string;
  series: string;
  thickness: string;
};

type SlicingLineItem = {
  id: string;
  values: SlicingLineItemValues;
};

const sourceHeaderColumns: readonly HeaderColumn[] = [
  { key: "srNo", label: "Sr No.", minWidth: 72 },
  { key: "itemSubCategory", label: "Item Sub Category", minWidth: 170 },
  { key: "itemName", label: "Item Name", minWidth: 170 },
  { key: "color", label: "Color", minWidth: 150 },
  { key: "logNoCode", label: "Log No Code", minWidth: 150 },
  { key: "flitchCode", label: "Flitch Code", minWidth: 140 },
  { key: "length", label: "Length", minWidth: 120 },
  { key: "width", label: "Width", minWidth: 120 },
  { key: "height", label: "Height", minWidth: 120 },
  { key: "cmt", label: "CMT", minWidth: 120 },
  { key: "amount", label: "Amount", minWidth: 140 },
  { key: "remark", label: "Remark", minWidth: 200 },
] as const;

const lineItemColumns: readonly LineItemColumn[] = [
  {
    key: "itemName",
    label: "Item Name",
    minWidth: 160,
    placeholder: "Enter Item Name",
    type: "text",
  },
  {
    key: "color",
    label: "Color",
    minWidth: 140,
    placeholder: "Enter Color",
    type: "text",
  },
  {
    key: "logNo",
    label: "Log No.",
    minWidth: 150,
    placeholder: "Enter Log No.",
    type: "text",
  },
  {
    key: "flitchSide",
    label: "Flitch Side",
    minWidth: 140,
    options: ["1", "2", "3", "4"],
    placeholder: "Select Flitch Side",
    type: "select",
  },
  {
    key: "thickness",
    label: "Thickness",
    minWidth: 135,
    options: ["3.2", "4.0", "4.6", "5.0"],
    placeholder: "Select Thickness",
    type: "select",
  },
  {
    key: "noOfLeaves",
    label: "No of Leaves",
    minWidth: 145,
    placeholder: "Enter No of Leaves",
    type: "text",
  },
  {
    key: "character",
    label: "Character",
    minWidth: 150,
    options: ["Olive", "Curly", "Flaky", "Pomelle"],
    placeholder: "Select Character",
    type: "select",
  },
  {
    key: "pattern",
    label: "Pattern",
    minWidth: 150,
    options: ["Multi Colour", "Natural", "Quarter Cut", "Crown Cut"],
    placeholder: "Select Pattern",
    type: "select",
  },
  {
    key: "series",
    label: "Series",
    minWidth: 145,
    options: ["ACCO", "Reganto", "Marvel", "Canvas"],
    placeholder: "Select Series",
    type: "select",
  },
  {
    key: "grade",
    label: "Grade",
    minWidth: 120,
    options: ["A", "B", "C", "Premium"],
    placeholder: "Select Grade",
    type: "select",
  },
  {
    key: "remark",
    label: "Remark",
    minWidth: 180,
    placeholder: "Enter Remark",
    type: "text",
  },
] as const;

export function SlicingCreatePage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const paths = getFactoryPaths("slicing");
  const nextRowId = useRef(1);
  const locationState = location.state as SlicingLocationState | null;
  const defaultSourceRow = slicingDefinition.rows[0] as SourceRow | undefined;
  const sourceRow =
    locationState?.sourceRow ??
    locationState?.sourceRows?.[0] ??
    defaultSourceRow;
  const sourceSummary = useMemo(
    () => buildSourceSummary(sourceRow),
    [sourceRow],
  );
  const [formValues, setFormValues] = useState<SlicingFormValues>({
    slicingDate: new Date(),
    shift: "Day",
    noOfWorkers: "",
    noOfWorkingHours: "",
    noOfTotalHours: "",
  });
  const [draftValues, setDraftValues] = useState<SlicingLineItemValues>(() =>
    createDefaultLineItemValues(sourceSummary, sourceRow),
  );
  const [lineItems, setLineItems] = useState<SlicingLineItem[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<SlicingLineItemValues>(() =>
    createEmptyLineItemValues(),
  );

  const sourceTableWidth = useMemo(
    () =>
      sourceHeaderColumns.reduce((total, column) => total + column.minWidth, 0),
    [],
  );
  const lineItemsTableWidth = useMemo(
    () =>
      lineItemColumns.reduce((total, column) => total + column.minWidth, 84),
    [],
  );

  const handleAddLineItem = () => {
    if (allLineItemValuesEmpty(draftValues)) {
      return;
    }

    const nextId = `slicing-line-item-${nextRowId.current}`;
    nextRowId.current += 1;

    setLineItems((current) => [
      ...current,
      {
        id: nextId,
        values: { ...draftValues },
      },
    ]);
    setDraftValues(createDefaultLineItemValues(sourceSummary, sourceRow));
  };

  const handleDeleteLineItem = (rowId: string) => {
    setLineItems((current) => current.filter((row) => row.id !== rowId));

    if (editingRowId === rowId) {
      setEditingRowId(null);
      setEditingValues(createEmptyLineItemValues());
    }
  };

  const handleStartEdit = (row: SlicingLineItem) => {
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
    setEditingValues(createEmptyLineItemValues());
  };

  return (
    <FactoryPageShell
      breadcrumbs={[
        { label: "Factory", to: "/factory" },
        { label: "Slicing", to: paths.list },
        { label: "Create Slicing" },
      ]}
      title="Create Slicing"
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
              sx={{ minWidth: sourceTableWidth, tableLayout: "auto" }}
            >
              <TableHead>
                <TableRow>
                  {sourceHeaderColumns.map((column) => (
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
                  {sourceHeaderColumns.map((column) => (
                    <TableCell key={column.key} sx={getBodyCellSx(theme)}>
                      {renderReadOnlyCell(
                        sourceSummary[column.key],
                        theme,
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Box>

        <Box
          sx={(currentTheme) => ({
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(1, minmax(0, 1fr))",
              md: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(5, minmax(0, 1fr))",
            },
            gap: currentTheme.spacing(2),
          })}
        >
          <FieldWrapper label="Slicing Date*">
            <ErpDatePickerField
              onChange={(value) =>
                setFormValues((current) => ({
                  ...current,
                  slicingDate: value,
                }))
              }
              placeholder="Select Slicing Date"
              value={formValues.slicingDate}
            />
          </FieldWrapper>

          <FieldWrapper label="Shift*">
            <ErpSelectField
              onChange={(value) =>
                setFormValues((current) => ({
                  ...current,
                  shift: value,
                }))
              }
              options={["Day", "General", "Evening", "Night"]}
              placeholder="Select Shift"
              value={formValues.shift}
            />
          </FieldWrapper>

          <FieldWrapper label="No. of Workers*">
            <TextField
              fullWidth
              placeholder="Enter No. of Workers"
              size="small"
              value={formValues.noOfWorkers}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  noOfWorkers: event.target.value,
                }))
              }
              sx={getCompactFieldSx(theme)}
            />
          </FieldWrapper>

          <FieldWrapper label="No. of Working Hours*">
            <TextField
              fullWidth
              placeholder="Enter No. of Working Hours"
              size="small"
              value={formValues.noOfWorkingHours}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  noOfWorkingHours: event.target.value,
                }))
              }
              sx={getCompactFieldSx(theme)}
            />
          </FieldWrapper>

          <FieldWrapper label="No. of Total Hours*">
            <TextField
              fullWidth
              placeholder="Enter No. of Total Hours"
              size="small"
              value={formValues.noOfTotalHours}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  noOfTotalHours: event.target.value,
                }))
              }
              sx={getCompactFieldSx(theme)}
            />
          </FieldWrapper>
        </Box>

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
              <Table size="small" sx={{ minWidth: lineItemsTableWidth, tableLayout: "auto" }}>
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
                          value: draftValues[column.key],
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
                  sx={{ minWidth: lineItemsTableWidth + 120, tableLayout: "auto" }}
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
                                    value: editingValues[column.key],
                                  })
                                : renderReadOnlyCell(
                                    row.values[column.key],
                                    theme,
                                  )}
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

          <Button variant="contained" onClick={() => navigate(paths.list)}>
            Submit
          </Button>
        </Box>
      </Stack>
    </FactoryPageShell>
  );
}

function FieldWrapper({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <Stack sx={{ gap: 0.75 }}>
      <Typography variant="subtitle2" color="text.primary">
        {label}
      </Typography>
      {children}
    </Stack>
  );
}

function buildSourceSummary(sourceRow?: SourceRow): SlicingSourceSummary {
  const reference =
    getStringValue(sourceRow, [
      "itemSrNo",
      "veneerSrNo",
      "issueSrNo",
      "inwardSrNo",
      "palletNo",
    ]) || "LOG-001";
  const length = getStringValue(sourceRow, ["length"]) || "3.20";
  const width = getStringValue(sourceRow, ["width"]) || "0.45";
  const height = getStringValue(sourceRow, ["thickness", "height"]) || "0.40";

  return {
    srNo:
      getStringValue(sourceRow, ["srNo", "issueSrNo", "itemSrNo"]) || "1",
    itemSubCategory:
      getStringValue(sourceRow, ["subCategory", "itemSubCategory"]) || "Natural",
    itemName: getStringValue(sourceRow, ["itemName"]) || "Oak Veneer",
    color:
      getStringValue(sourceRow, ["color", "timberColor", "colour"]) || "Natural",
    logNoCode: reference,
    flitchCode: `FC${extractDigits(reference).slice(-3) || "13"}`,
    length,
    width,
    height,
    cmt:
      getStringValue(sourceRow, ["issuedSqm", "totalSqm", "availableSqm"]) ||
      calculateCmt(length, width, height),
    amount: getStringValue(sourceRow, ["amount"]) || "0.00",
    remark: getStringValue(sourceRow, ["remark"]) || "",
  };
}

function createDefaultLineItemValues(
  sourceSummary: SlicingSourceSummary,
  sourceRow?: SourceRow,
): SlicingLineItemValues {
  return {
    itemName: sourceSummary.itemName,
    color: sourceSummary.color,
    logNo: sourceSummary.logNoCode,
    flitchSide: "2",
    thickness:
      getStringValue(sourceRow, ["thickness", "height"]) || sourceSummary.height,
    noOfLeaves:
      getStringValue(sourceRow, [
        "issuedLeaves",
        "noOfLeaves",
        "noOfLeavesSheets",
        "totalNoOfSheets",
      ]) || "2",
    character: "",
    pattern: "",
    series: "",
    grade: "",
    remark: "",
  };
}

function createEmptyLineItemValues(): SlicingLineItemValues {
  return {
    itemName: "",
    color: "",
    logNo: "",
    flitchSide: "",
    thickness: "",
    noOfLeaves: "",
    character: "",
    pattern: "",
    series: "",
    grade: "",
    remark: "",
  };
}

function allLineItemValuesEmpty(values: SlicingLineItemValues) {
  return Object.values(values).every((value) => value.trim().length === 0);
}

function getStringValue(sourceRow: SourceRow | undefined, keys: readonly string[]) {
  if (!sourceRow) {
    return "";
  }

  for (const key of keys) {
    const value = sourceRow[key];

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

    if (typeof value === "number") {
      return String(value);
    }
  }

  return "";
}

function extractDigits(value: string) {
  return value.replace(/\D+/g, "");
}

function calculateCmt(length: string, width: string, height: string) {
  const lengthValue = Number.parseFloat(length.replace(/[^\d.]/g, "")) || 0;
  const widthValue = Number.parseFloat(width.replace(/[^\d.]/g, "")) || 0;
  const heightValue = Number.parseFloat(height.replace(/[^\d.]/g, "")) || 0;

  if (!lengthValue || !widthValue || !heightValue) {
    return "0.000";
  }

  return ((lengthValue * widthValue * heightValue) / 1000).toFixed(3);
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

function renderEditableField({
  column,
  onChange,
  theme,
  value,
}: {
  column: LineItemColumn;
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
