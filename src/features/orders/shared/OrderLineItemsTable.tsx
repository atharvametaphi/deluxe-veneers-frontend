import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { Info, Pencil, Plus, Save, Trash2 } from "lucide-react";

import { ErpSelectField } from "../../../pages/ComponentLibrary/shared/ErpFieldControls";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import type { MasterRecord } from "../../masters/shared";
import { buildLocalMasterDefinition } from "../../masters/shared/localMasterStore";
import {
  itemMasterDefinition,
  itemSubCategoryMasterOptions,
} from "../../masters/shared/masterDefinitions";
import { formatMasterValue } from "../../masters/shared";
import {
  listingToolbarButtonSx,
  recordFormActionButtonSx,
} from "../../shared/buttonStyles";
import {
  gradeOptions,
  productCategoryOptions,
  seriesOptions,
  type OrderCreateVariant,
  type OrderLineItem,
} from "./ordersStore";

type OrderLineItemColumn = {
  dropdownWidth?: number;
  key: keyof Omit<OrderLineItem, "id">;
  label: string;
  minWidth: number;
  numeric?: boolean;
  options?: readonly string[];
  readOnly?: boolean;
  showItemDetails?: boolean;
  type: "select" | "text";
};

const actionsColumnWidth = 120;
const sqmToSqf = 10.7639;

const finishedTypeOptions = [
  "Marquetry",
  "Fluted",
  "Embossed",
  "Decorative",
] as const;

const baseTypeOptions = ["Plywood", "MDF"] as const;

const rawOrderLineItemColumns: readonly OrderLineItemColumn[] = [
  { key: "itemName", label: "Item Name", minWidth: 180, type: "text" },
  {
    key: "productCategory",
    label: "Product Type",
    minWidth: 150,
    options: productCategoryOptions,
    type: "select",
  },
  {
    key: "subCategory",
    label: "Sub Category",
    minWidth: 165,
    options: itemSubCategoryMasterOptions,
    type: "select",
  },
  {
    key: "series",
    label: "Series",
    minWidth: 150,
    options: seriesOptions,
    type: "select",
  },
  {
    key: "grade",
    label: "Grade",
    minWidth: 110,
    options: gradeOptions,
    type: "select",
  },
  { key: "length", label: "Length", minWidth: 120, numeric: true, type: "text" },
  { key: "width", label: "Width", minWidth: 120, numeric: true, type: "text" },
  { key: "thickness", label: "Thickness", minWidth: 120, numeric: true, type: "text" },
  {
    key: "quantitySheets",
    label: "Number of Sheets",
    minWidth: 145,
    numeric: true,
    type: "text",
  },
  { key: "sqm", label: "SQM", minWidth: 130, numeric: true, type: "text" },
  { key: "totalSqm", label: "SQF", minWidth: 130, numeric: true, type: "text" },
  {
    key: "ratePerSqf",
    label: "Rate per SQF",
    minWidth: 140,
    numeric: true,
    type: "text",
  },
  {
    key: "amount",
    label: "Amount",
    minWidth: 130,
    numeric: true,
    readOnly: true,
    type: "text",
  },
  { key: "remark", label: "Remark", minWidth: 200, type: "text" },
] as const;

const finishedOrderLineItemColumns: readonly OrderLineItemColumn[] = [
  {
    key: "finishedType",
    label: "Finished Type",
    minWidth: 155,
    options: finishedTypeOptions,
    type: "select",
  },
  {
    key: "salesItemName",
    label: "Sales Item Name",
    minWidth: 190,
    type: "text",
  },
  {
    key: "itemName",
    label: "Item Name",
    dropdownWidth: 340,
    minWidth: 320,
    showItemDetails: true,
    type: "select",
  },
  { key: "length", label: "Length", minWidth: 120, numeric: true, type: "text" },
  { key: "width", label: "Width", minWidth: 120, numeric: true, type: "text" },
  { key: "thickness", label: "Thickness", minWidth: 120, numeric: true, type: "text" },
  {
    key: "quantitySheets",
    label: "Number of Sheets",
    minWidth: 145,
    numeric: true,
    type: "text",
  },
  {
    key: "sqm",
    label: "SQM",
    minWidth: 120,
    numeric: true,
    readOnly: true,
    type: "text",
  },
  {
    key: "totalSqm",
    label: "SQF",
    minWidth: 120,
    numeric: true,
    readOnly: true,
    type: "text",
  },
  {
    key: "ratePerSqf",
    label: "Rate per SQF",
    minWidth: 140,
    numeric: true,
    type: "text",
  },
  {
    key: "baseType",
    label: "Base Type",
    minWidth: 140,
    options: baseTypeOptions,
    type: "select",
  },
  {
    key: "baseName",
    label: "Base Name",
    dropdownWidth: 300,
    minWidth: 240,
    type: "select",
  },
  { key: "baseLength", label: "Base Length", minWidth: 140, numeric: true, type: "text" },
  { key: "baseWidth", label: "Base Width", minWidth: 140, numeric: true, type: "text" },
  {
    key: "baseThickness",
    label: "Base Thickness",
    minWidth: 150,
    numeric: true,
    type: "text",
  },
  {
    key: "amount",
    label: "Amount",
    minWidth: 130,
    numeric: true,
    readOnly: true,
    type: "text",
  },
  { key: "remark", label: "Remark", minWidth: 200, type: "text" },
] as const;

const itemDetailColumns = [
  { key: "itemName", label: "Item Name", minWidth: 180 },
  { key: "itemCode", label: "Item Code", minWidth: 130 },
  { key: "category", label: "Category", minWidth: 150 },
  { key: "subCategory", label: "Sub Category", minWidth: 160 },
  { key: "color", label: "Color", minWidth: 130 },
  { key: "hsn", label: "HSN Code", minWidth: 130 },
  { key: "gst", label: "GST No", minWidth: 120 },
  { key: "remark", label: "Remark", minWidth: 220 },
] as const;

export interface OrderLineItemsTableHandle {
  validate: () => boolean;
}

export const OrderLineItemsTable = forwardRef<
  OrderLineItemsTableHandle,
  {
    items: readonly OrderLineItem[];
    onChange: (items: OrderLineItem[]) => void;
    readOnly?: boolean;
    variant?: OrderCreateVariant | null;
  }
>(function OrderLineItemsTable({
  items,
  onChange,
  readOnly = false,
  variant,
}, ref) {
  const isFinishedOrder = variant === "finished";
  const itemRows = useMemo(() => getItemMasterRows(), []);
  const itemOptions = useMemo(() => getItemMasterOptions(itemRows), [itemRows]);
  const columns = useMemo(
    () =>
      getOrderLineItemColumns(isFinishedOrder).map((column) =>
        column.key === "itemName" && column.type === "select"
          ? { ...column, options: itemOptions }
          : column,
      ),
    [isFinishedOrder, itemOptions],
  );
  const nextRowId = useRef(1);
  const [draftValues, setDraftValues] = useState<Record<string, string>>(() =>
    createEmptyValues(columns),
  );
  const [draftSubmitAttempted, setDraftSubmitAttempted] = useState(false);
  const [lineItems, setLineItems] = useState<OrderLineItem[]>(() => [...items]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>(() =>
    createEmptyValues(columns),
  );
  const [editingSubmitAttempted, setEditingSubmitAttempted] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] =
    useState<MasterRecord | null>(null);

  useEffect(() => {
    setLineItems([...items]);
    const numericIds = items
      .map((item) => Number(String(item.id).split("-").pop()))
      .filter((value) => !Number.isNaN(value));
    nextRowId.current = (numericIds.length > 0 ? Math.max(...numericIds) : 0) + 1;
  }, [items]);

  useEffect(() => {
    setDraftValues(createEmptyValues(columns));
    setEditingValues(createEmptyValues(columns));
    setEditingRowId(null);
    setDraftSubmitAttempted(false);
    setEditingSubmitAttempted(false);
  }, [columns]);

  const tableMinWidth = useMemo(
    () =>
      columns.reduce((total, column) => total + column.minWidth, 0) +
      actionsColumnWidth,
    [columns],
  );

  const commitLineItems = (nextItems: OrderLineItem[]) => {
    setLineItems(nextItems);
    onChange(nextItems);
  };

  const handleAddLineItem = () => {
    if (allValuesEmpty(draftValues)) {
      setDraftSubmitAttempted(true);
      return;
    }

    const validationErrors = getLineItemValidationErrors(
      columns,
      draftValues,
      isFinishedOrder,
    );

    if (hasValidationErrors(validationErrors)) {
      setDraftSubmitAttempted(true);
      return;
    }

    const nextItems = [
      ...lineItems,
      {
        id: `order-line-item-${nextRowId.current}`,
        ...mapValuesToLineItem(draftValues),
      },
    ];
    nextRowId.current += 1;
    commitLineItems(nextItems);
    setDraftValues(createEmptyValues(columns));
    setDraftSubmitAttempted(false);
  };

  const handleDeleteLineItem = (rowId: string) => {
    const nextItems = lineItems.filter((row) => row.id !== rowId);
    commitLineItems(nextItems);

    if (editingRowId === rowId) {
      setEditingRowId(null);
      setEditingValues(createEmptyValues(columns));
    }
  };

  const handleStartEdit = (row: OrderLineItem) => {
    setEditingRowId(row.id);
    setEditingValues(mapLineItemToValues(row));
    setEditingSubmitAttempted(false);
  };

  const handleSaveEdit = (rowId: string) => {
    const validationErrors = getLineItemValidationErrors(
      columns,
      editingValues,
      isFinishedOrder,
    );

    if (hasValidationErrors(validationErrors)) {
      setEditingSubmitAttempted(true);
      return;
    }

    const nextItems = lineItems.map((row) =>
      row.id === rowId
        ? {
            id: row.id,
            ...mapValuesToLineItem(editingValues),
          }
        : row,
    );
    commitLineItems(nextItems);
    setEditingRowId(null);
    setEditingValues(createEmptyValues(columns));
    setEditingSubmitAttempted(false);
  };

  const updateDraftValue = (key: keyof Omit<OrderLineItem, "id">, value: string) => {
    setDraftValues((current) =>
      getNextLineItemValues(current, key, value, isFinishedOrder),
    );
  };

  const updateEditingValue = (
    key: keyof Omit<OrderLineItem, "id">,
    value: string,
  ) => {
    setEditingValues((current) =>
      getNextLineItemValues(current, key, value, isFinishedOrder),
    );
  };

  const openItemDetails = (itemName: string) => {
    const itemDetails = getItemMasterRecord(itemRows, itemName);

    if (itemDetails) {
      setSelectedItemDetails(itemDetails);
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      validate: () => {
        if (readOnly) {
          return true;
        }

        const draftHasValues = !allValuesEmpty(draftValues);
        const draftErrors = getLineItemValidationErrors(
          columns,
          draftValues,
          isFinishedOrder,
        );
        const editingErrors = getLineItemValidationErrors(
          columns,
          editingValues,
          isFinishedOrder,
        );

        if (lineItems.length === 0 || (draftHasValues && hasValidationErrors(draftErrors))) {
          setDraftSubmitAttempted(true);
          return false;
        }

        if (editingRowId && hasValidationErrors(editingErrors)) {
          setEditingSubmitAttempted(true);
          return false;
        }

        return true;
      },
    }),
    [
      columns,
      draftValues,
      editingRowId,
      editingValues,
      isFinishedOrder,
      lineItems.length,
      readOnly,
    ],
  );

  return (
    <Stack sx={{ gap: 2 }}>
      {!readOnly ? (
        <>
          <Box
            sx={(theme) => ({
              border: `1px solid ${theme.customTokens.borders.default}`,
              borderRadius: `${theme.customTokens.radius.md}px`,
              backgroundColor: theme.customTokens.surfaces.surface,
              overflow: "hidden",
            })}
          >
            <Box sx={(theme) => getScrollableTableSx(theme)}>
              <Table size="small" sx={{ minWidth: tableMinWidth, tableLayout: "auto" }}>
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        sx={(theme) => getHeaderCellSx(theme, column.minWidth)}
                      >
                        <ColumnLabel label={column.label} />
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        sx={(theme) => getBodyCellSx(theme)}
                      >
                        {renderField({
                          column,
                          currentValues: draftValues,
                          errorText: draftSubmitAttempted
                            ? getFieldValidationError(
                                column,
                                draftValues,
                                isFinishedOrder,
                              )
                            : "",
                          itemRows,
                          onChange: (value) => updateDraftValue(column.key, value),
                          onOpenItemDetails: openItemDetails,
                          value: draftValues[column.key] ?? "",
                        })}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              disableElevation
              onClick={handleAddLineItem}
              startIcon={<Plus size={14} />}
              sx={listingToolbarButtonSx}
              variant="contained"
            >
              Add Item
            </Button>
          </Box>
        </>
      ) : null}

      {lineItems.length > 0 ? (
        <Box
          sx={(theme) => ({
            border: `1px solid ${theme.customTokens.borders.default}`,
            borderRadius: `${theme.customTokens.radius.md}px`,
            backgroundColor: theme.customTokens.surfaces.surface,
            overflow: "hidden",
          })}
        >
          <Box sx={(theme) => getScrollableTableSx(theme)}>
            <Table
              size="small"
              sx={{
                minWidth: tableMinWidth + (readOnly ? 0 : actionsColumnWidth),
                tableLayout: "auto",
              }}
            >
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      sx={(theme) => getHeaderCellSx(theme, column.minWidth)}
                    >
                      <ColumnLabel label={column.label} />
                    </TableCell>
                  ))}
                  {!readOnly ? (
                    <TableCell
                      sx={(theme) =>
                        getActionHeaderCellSx(theme, actionsColumnWidth)
                      }
                    >
                      Actions
                    </TableCell>
                  ) : null}
                </TableRow>
              </TableHead>
              <TableBody>
                {lineItems.map((row, index) => {
                  const isEditing = editingRowId === row.id;

                  return (
                    <TableRow key={row.id}>
                      {columns.map((column) => (
                        <TableCell
                          key={column.key}
                          sx={(theme) => getBodyCellSx(theme)}
                        >
                          {isEditing
                            ? renderField({
                                column,
                                currentValues: editingValues,
                                errorText: editingSubmitAttempted
                                  ? getFieldValidationError(
                                      column,
                                      editingValues,
                                      isFinishedOrder,
                                    )
                                  : "",
                                itemRows,
                                onChange: (value) =>
                                  updateEditingValue(column.key, value),
                                onOpenItemDetails: openItemDetails,
                                value: editingValues[column.key] ?? "",
                              })
                            : renderDisplayValue({
                                column,
                                itemRows,
                                onOpenItemDetails: openItemDetails,
                                row,
                              })}
                        </TableCell>
                      ))}
                      {!readOnly ? (
                        <TableCell
                          align="center"
                          sx={(theme) =>
                            getActionBodyCellSx(theme, actionsColumnWidth, index)
                          }
                        >
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
                              sx={(theme) => getActionButtonSx(theme)}
                            >
                              {isEditing ? <Save size={16} /> : <Pencil size={16} />}
                            </IconButton>
                            <IconButton
                              aria-label="Delete item"
                              onClick={() => handleDeleteLineItem(row.id)}
                              sx={(theme) => getActionButtonSx(theme)}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        </Box>
      ) : null}

      <ItemDetailsDialog
        item={selectedItemDetails}
        onClose={() => setSelectedItemDetails(null)}
        open={Boolean(selectedItemDetails)}
      />
    </Stack>
  );
});

function getOrderLineItemColumns(isFinishedOrder: boolean) {
  return isFinishedOrder
    ? finishedOrderLineItemColumns
    : rawOrderLineItemColumns;
}

function createEmptyValues(columns: readonly OrderLineItemColumn[]) {
  return columns.reduce<Record<string, string>>((accumulator, column) => {
    accumulator[column.key] = "";
    return accumulator;
  }, {});
}

function allValuesEmpty(values: Record<string, string>) {
  return Object.values(values).every((value) => value.trim().length === 0);
}

function getLineItemValidationErrors(
  columns: readonly OrderLineItemColumn[],
  values: Record<string, string>,
  isFinishedOrder: boolean,
) {
  return columns.reduce<Record<string, string>>((errors, column) => {
    const error = getFieldValidationError(column, values, isFinishedOrder);

    if (error) {
      errors[column.key] = error;
    }

    return errors;
  }, {});
}

function hasValidationErrors(errors: Record<string, string>) {
  return Object.keys(errors).length > 0;
}

function getFieldValidationError(
  column: OrderLineItemColumn,
  values: Record<string, string>,
  _isFinishedOrder: boolean,
) {
  const value = (values[column.key] ?? "").trim();

  if (isLineItemColumnRequired(column) && value.length === 0) {
    return `${column.label} is required`;
  }

  if (column.numeric && value.length > 0 && !isValidDoubleValue(value)) {
    return `${column.label} must be a number`;
  }

  return "";
}

function isLineItemColumnRequired(column: OrderLineItemColumn) {
  return !["remark", "remarks"].includes(String(column.key).toLowerCase());
}

function ColumnLabel({ label }: { label: string }) {
  return (
    <Stack component="span" direction="row" spacing={0.25}>
      <span>{label}</span>
    </Stack>
  );
}

function mapValuesToLineItem(values: Record<string, string>): Omit<OrderLineItem, "id"> {
  return {
    productCategory: values.productCategory ?? "",
    finishedType: values.finishedType ?? "",
    salesItemName: values.salesItemName ?? "",
    itemName: values.itemName ?? "",
    subCategory: values.subCategory ?? "",
    series: values.series ?? "",
    grade: values.grade ?? "",
    length: values.length ?? "",
    width: values.width ?? "",
    thickness: values.thickness ?? "",
    quantitySheets: values.quantitySheets ?? "",
    sqm: values.sqm ?? "",
    totalSqm: values.totalSqm ?? "",
    ratePerSqf: values.ratePerSqf ?? "",
    baseType: values.baseType ?? "",
    baseName: values.baseName ?? "",
    baseLength: values.baseLength ?? "",
    baseWidth: values.baseWidth ?? "",
    baseThickness: values.baseThickness ?? "",
    amount: values.amount ?? "",
    remark: values.remark ?? "",
  };
}

function mapLineItemToValues(lineItem: OrderLineItem) {
  return {
    productCategory: lineItem.productCategory,
    finishedType: lineItem.finishedType,
    salesItemName: lineItem.salesItemName,
    itemName: lineItem.itemName,
    subCategory: lineItem.subCategory,
    series: lineItem.series,
    grade: lineItem.grade,
    length: lineItem.length,
    width: lineItem.width,
    thickness: lineItem.thickness,
    quantitySheets: lineItem.quantitySheets,
    sqm: lineItem.sqm,
    totalSqm: lineItem.totalSqm,
    ratePerSqf: lineItem.ratePerSqf,
    baseType: lineItem.baseType,
    baseName: lineItem.baseName,
    baseLength: lineItem.baseLength,
    baseWidth: lineItem.baseWidth,
    baseThickness: lineItem.baseThickness,
    amount: lineItem.amount,
    remark: lineItem.remark,
  };
}

function getNextLineItemValues(
  currentValues: Record<string, string>,
  key: keyof Omit<OrderLineItem, "id">,
  value: string,
  isFinishedOrder: boolean,
) {
  const nextValue = isNumericLineItemKey(key) ? sanitizeDoubleInput(value) : value;
  const nextValues = {
    ...currentValues,
    [key]: nextValue,
  };

  if (key === "baseType") {
    nextValues.baseName = "";
  }

  return applyLineItemCalculations(nextValues, isFinishedOrder, key);
}

function applyLineItemCalculations(
  values: Record<string, string>,
  isFinishedOrder: boolean,
  changedKey?: keyof Omit<OrderLineItem, "id">,
) {
  const areaValues: Record<string, string> = isFinishedOrder
    ? applyFinishedAreaCalculations(values)
    : { ...values };
  const sqm = parsePositiveNumber(areaValues.sqm);
  const nextValues: Record<string, string> =
    !isFinishedOrder && changedKey === "sqm" && sqm > 0
      ? { ...areaValues, totalSqm: formatAreaValue(sqm * sqmToSqf) }
      : areaValues;
  const sqf = parsePositiveNumber(nextValues.totalSqm);
  const ratePerSqf = parsePositiveNumber(nextValues.ratePerSqf);

  return {
    ...nextValues,
    amount: sqf > 0 && ratePerSqf > 0 ? formatMoneyValue(sqf * ratePerSqf) : "",
  };
}

function applyFinishedAreaCalculations(
  values: Record<string, string>,
): Record<string, string> {
  const length = parseDimensionToMeters(values.length);
  const width = parseDimensionToMeters(values.width);
  const sheets = parsePositiveNumber(values.quantitySheets);

  if (length > 0 && width > 0 && sheets > 0) {
    const sqm = length * width * sheets;

    return {
      ...values,
      sqm: formatAreaValue(sqm),
      totalSqm: formatAreaValue(sqm * sqmToSqf),
    };
  }

  return {
    ...values,
    sqm: "",
    totalSqm: "",
  };
}

function parseDimensionToMeters(value: string | undefined) {
  const numberValue = parsePositiveNumber(value);

  if (numberValue <= 0) {
    return 0;
  }

  return numberValue > 100 ? numberValue / 1000 : numberValue;
}

function parsePositiveNumber(value: string | undefined) {
  if (!value) {
    return 0;
  }

  const numericValue = Number(value.replace(/,/g, ""));

  return Number.isNaN(numericValue) || numericValue < 0 ? 0 : numericValue;
}

function isValidDoubleValue(value: string) {
  return /^\d+(\.\d+)?$/.test(value.replace(/,/g, ""));
}

function sanitizeDoubleInput(value: string) {
  const sanitized = value.replace(/[^0-9.]/g, "");
  const [integerPart = "", ...decimalParts] = sanitized.split(".");

  if (decimalParts.length === 0) {
    return integerPart;
  }

  return `${integerPart}.${decimalParts.join("")}`;
}

function isNumericLineItemKey(key: keyof Omit<OrderLineItem, "id">) {
  return [
    "length",
    "width",
    "thickness",
    "quantitySheets",
    "sqm",
    "totalSqm",
    "ratePerSqf",
    "baseLength",
    "baseWidth",
    "baseThickness",
    "amount",
  ].includes(key);
}

function formatAreaValue(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 3,
    minimumFractionDigits: 3,
  });
}

function formatMoneyValue(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function renderField({
  column,
  currentValues,
  errorText,
  itemRows,
  onChange,
  onOpenItemDetails,
  value,
}: {
  column: OrderLineItemColumn;
  currentValues: Record<string, string>;
  errorText?: string;
  itemRows: readonly MasterRecord[];
  onChange: (value: string) => void;
  onOpenItemDetails: (itemName: string) => void;
  value: string;
}) {
  const selectOptions = getColumnOptions(column, itemRows, currentValues);
  const control =
    column.type === "select" ? (
      <ErpSelectField
        dropdownWidth={column.dropdownWidth}
        helperText={errorText}
        onChange={onChange}
        options={selectOptions}
        state={errorText ? "error" : column.readOnly ? "readOnly" : "default"}
        value={value}
      />
    ) : (
      <TextField
        error={Boolean(errorText)}
        fullWidth
        helperText={errorText}
        size="small"
        value={value}
        onChange={(event) =>
          onChange(column.numeric ? sanitizeDoubleInput(event.target.value) : event.target.value)
        }
        slotProps={{
          input: {
            inputMode: column.numeric ? "decimal" : undefined,
            readOnly: column.readOnly,
          },
        }}
        sx={(theme) => ({
          ...getCompactFieldSx(
            theme,
            errorText ? "error" : column.readOnly ? "readOnly" : "default",
          ),
          ...(column.readOnly
            ? {
                "& .MuiInputBase-root": {
                  backgroundColor: theme.customTokens.surfaces.alt,
                },
              }
            : {}),
        })}
      />
    );

  if (!column.showItemDetails) {
    return control;
  }

  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Box sx={{ minWidth: 0, flex: 1 }}>{control}</Box>
      <IconButton
        aria-label="View item details"
        disabled={!getItemMasterRecord(itemRows, value)}
        onClick={() => onOpenItemDetails(value)}
        size="small"
        sx={(theme) => ({
          color: theme.customTokens.navigation.activeText,
          height: theme.spacing(4),
          width: theme.spacing(4),
          "&.Mui-disabled": {
            color: theme.palette.text.disabled,
          },
          "&:hover": {
            backgroundColor: theme.customTokens.navigation.hoverBackground,
          },
        })}
      >
        <Info size={14} />
      </IconButton>
    </Stack>
  );
}

function renderDisplayValue({
  column,
  itemRows,
  onOpenItemDetails,
  row,
}: {
  column: OrderLineItemColumn;
  itemRows: readonly MasterRecord[];
  onOpenItemDetails: (itemName: string) => void;
  row: OrderLineItem;
}) {
  const value = row[column.key];

  if (!column.showItemDetails) {
    return (
      <Typography
        variant="body2"
        color="text.primary"
        sx={(theme) => ({
          minHeight: theme.spacing(4.5),
          display: "flex",
          alignItems: "center",
        })}
      >
        {value}
      </Typography>
    );
  }

  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Typography
        variant="body2"
        color="text.primary"
        sx={(theme) => ({
          minHeight: theme.spacing(4.5),
          display: "flex",
          alignItems: "center",
          flex: 1,
        })}
      >
        {value}
      </Typography>
      <IconButton
        aria-label="View item details"
        disabled={!getItemMasterRecord(itemRows, value)}
        onClick={() => onOpenItemDetails(value)}
        size="small"
        sx={(theme) => ({
          color: theme.customTokens.navigation.activeText,
          height: theme.spacing(4),
          width: theme.spacing(4),
          "&.Mui-disabled": {
            color: theme.palette.text.disabled,
          },
          "&:hover": {
            backgroundColor: theme.customTokens.navigation.hoverBackground,
          },
        })}
      >
        <Info size={14} />
      </IconButton>
    </Stack>
  );
}

function ItemDetailsDialog({
  item,
  onClose,
  open,
}: {
  item: MasterRecord | null;
  onClose: () => void;
  open: boolean;
}) {
  return (
    <Dialog
      fullWidth
      maxWidth="lg"
      onClose={onClose}
      open={open}
      slotProps={{
        paper: {
          sx: (theme) => ({
            borderRadius: `${theme.customTokens.radius.md}px`,
            boxShadow: theme.customTokens.elevation.md,
            outline: "none",
            "&:focus, &:focus-visible": {
              outline: "none",
            },
          }),
        },
      }}
    >
      <DialogTitle
        sx={(theme) => ({
          borderBottom: `1px solid ${theme.customTokens.borders.default}`,
          fontSize: theme.typography.h3.fontSize,
          fontWeight: 700,
          px: theme.spacing(2),
          py: theme.spacing(1.5),
        })}
      >
        Item Details
      </DialogTitle>

      <DialogContent
        sx={(theme) => ({
          px: theme.spacing(2),
          py: theme.spacing(2),
        })}
      >
        <Stack sx={(theme) => ({ gap: theme.spacing(2) })}>
          <Box
            sx={(theme) => ({
              border: `1px solid ${theme.customTokens.borders.default}`,
              borderRadius: `${theme.customTokens.radius.sm}px`,
              overflow: "hidden",
              backgroundColor: theme.customTokens.surfaces.surface,
            })}
          >
            <Box sx={(theme) => getScrollableTableSx(theme)}>
              <Table
                size="small"
                sx={{
                  minWidth: itemDetailColumns.reduce(
                    (total, column) => total + column.minWidth,
                    0,
                  ),
                }}
              >
                <TableHead>
                  <TableRow>
                    {itemDetailColumns.map((column) => (
                      <TableCell
                        key={column.key}
                        sx={(theme) => getHeaderCellSx(theme, column.minWidth)}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    {itemDetailColumns.map((column) => (
                      <TableCell
                        key={column.key}
                        sx={(theme) => getBodyCellSx(theme)}
                      >
                        {formatMasterValue(item?.[column.key])}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              disableElevation
              onClick={onClose}
              sx={recordFormActionButtonSx}
              variant="contained"
            >
              Close
            </Button>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function getItemMasterRows() {
  return buildLocalMasterDefinition(itemMasterDefinition).rows;
}

function getItemMasterOptions(rows: readonly MasterRecord[]) {
  return Array.from(
    new Set(
      rows
        .filter(
          (row) => String(row.status ?? "Active").toLowerCase() !== "inactive",
        )
        .map((row) => String(row.itemName ?? "").trim())
        .filter(Boolean),
    ),
  );
}

function getColumnOptions(
  column: OrderLineItemColumn,
  itemRows: readonly MasterRecord[],
  values: Record<string, string>,
) {
  if (column.key === "baseName") {
    return getBaseNameOptions(itemRows, values.baseType);
  }

  return column.options ?? [];
}

function getBaseNameOptions(rows: readonly MasterRecord[], baseType: string | undefined) {
  const normalizedBaseType = String(baseType ?? "").trim().toLowerCase();

  if (!normalizedBaseType) {
    return [];
  }

  return Array.from(
    new Set(
      rows
        .filter(
          (row) => String(row.status ?? "Active").toLowerCase() !== "inactive",
        )
        .filter((row) =>
          [row.category, row.subCategory, row.itemName].some((fieldValue) =>
            String(fieldValue ?? "").toLowerCase().includes(normalizedBaseType),
          ),
        )
        .map((row) => String(row.itemName ?? "").trim())
        .filter(Boolean),
    ),
  );
}

function getItemMasterRecord(rows: readonly MasterRecord[], itemName: string) {
  const normalizedName = itemName.trim().toLowerCase();

  if (!normalizedName) {
    return undefined;
  }

  return rows.find(
    (row) => String(row.itemName ?? "").trim().toLowerCase() === normalizedName,
  );
}

function getHeaderCellSx(
  theme: Theme,
  minWidth: number,
  textAlign: "left" | "center" = "left",
) {
  return {
    minWidth,
    backgroundColor: theme.customTokens.brand.primary,
    borderBottom: `1px solid ${theme.customTokens.brand.primaryScale[800]}`,
    color: theme.customTokens.text.inverse,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 700,
    py: theme.spacing(1.5),
    px: textAlign === "center" ? theme.spacing(0.75) : theme.spacing(1.5),
    textAlign,
    whiteSpace: "nowrap",
  } as const;
}

function getBodyCellSx(theme: Theme, textAlign: "left" | "center" = "left") {
  return {
    borderBottom: `1px solid ${theme.customTokens.borders.default}`,
    py: theme.spacing(1),
    px: textAlign === "center" ? theme.spacing(0.75) : theme.spacing(1.5),
    textAlign,
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  } as const;
}

function getActionHeaderCellSx(theme: Theme, minWidth: number) {
  return {
    ...getHeaderCellSx(theme, minWidth, "center"),
    position: "sticky" as const,
    right: 0,
    zIndex: 3,
    boxShadow: `-1px 0 0 ${theme.customTokens.brand.primaryScale[800]}`,
  } as const;
}

function getActionBodyCellSx(
  theme: Theme,
  minWidth: number,
  rowIndex: number,
) {
  return {
    ...getBodyCellSx(theme, "center"),
    position: "sticky" as const,
    right: 0,
    zIndex: 1,
    minWidth,
    backgroundColor:
      rowIndex % 2 === 0
        ? theme.customTokens.surfaces.surface
        : theme.customTokens.surfaces.alt,
    boxShadow: `-1px 0 0 ${theme.customTokens.borders.default}`,
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
