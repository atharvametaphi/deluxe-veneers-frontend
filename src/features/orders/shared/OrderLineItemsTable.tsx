import { useEffect, useMemo, useRef, useState } from "react";
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
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";

import { ErpSelectField } from "../../../pages/ComponentLibrary/shared/ErpFieldControls";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import { itemSubCategoryMasterOptions } from "../../masters/shared/masterDefinitions";
import {
  gradeOptions,
  seriesOptions,
  type OrderLineItem,
} from "./ordersStore";

type OrderLineItemColumn = {
  key: keyof Omit<OrderLineItem, "id">;
  label: string;
  minWidth: number;
  options?: readonly string[];
  placeholder: string;
  type: "select" | "text";
};

const serialColumnWidth = 56;
const actionsColumnWidth = 120;

const orderLineItemColumns: readonly OrderLineItemColumn[] = [
  {
    key: "itemName",
    label: "Item Name",
    minWidth: 180,
    placeholder: "Enter Item Name",
    type: "text",
  },
  {
    key: "subCategory",
    label: "Sub Category",
    minWidth: 165,
    options: itemSubCategoryMasterOptions,
    placeholder: "Select Sub Category",
    type: "select",
  },
  {
    key: "series",
    label: "Series",
    minWidth: 150,
    options: seriesOptions,
    placeholder: "Select Series",
    type: "select",
  },
  {
    key: "grade",
    label: "Grade",
    minWidth: 110,
    options: gradeOptions,
    placeholder: "Select Grade",
    type: "select",
  },
  {
    key: "length",
    label: "Length",
    minWidth: 120,
    placeholder: "Enter Length",
    type: "text",
  },
  {
    key: "width",
    label: "Width",
    minWidth: 120,
    placeholder: "Enter Width",
    type: "text",
  },
  {
    key: "thickness",
    label: "Thickness",
    minWidth: 120,
    placeholder: "Enter Thickness",
    type: "text",
  },
  {
    key: "quantitySheets",
    label: "Number of Sheets",
    minWidth: 145,
    placeholder: "Enter Number of Sheets",
    type: "text",
  },
  {
    key: "sqm",
    label: "SQM",
    minWidth: 130,
    placeholder: "Enter SQM",
    type: "text",
  },
  {
    key: "totalSqm",
    label: "SQF",
    minWidth: 130,
    placeholder: "Enter SQF",
    type: "text",
  },
  {
    key: "ratePerSqf",
    label: "Rate per SQF",
    minWidth: 140,
    placeholder: "Enter Rate per SQF",
    type: "text",
  },
  {
    key: "amount",
    label: "Amount",
    minWidth: 130,
    placeholder: "Enter Amount",
    type: "text",
  },
] as const;

export function OrderLineItemsTable({
  items,
  onChange,
  readOnly = false,
}: {
  items: readonly OrderLineItem[];
  onChange: (items: OrderLineItem[]) => void;
  readOnly?: boolean;
}) {
  const nextRowId = useRef(1);
  const [draftValues, setDraftValues] = useState<Record<string, string>>(() =>
    createEmptyValues(),
  );
  const [lineItems, setLineItems] = useState<OrderLineItem[]>(() => [...items]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>(() =>
    createEmptyValues(),
  );

  useEffect(() => {
    setLineItems([...items]);
    const numericIds = items
      .map((item) => Number(String(item.id).split("-").pop()))
      .filter((value) => !Number.isNaN(value));
    nextRowId.current = (numericIds.length > 0 ? Math.max(...numericIds) : 0) + 1;
  }, [items]);

  const tableMinWidth = useMemo(
    () =>
      orderLineItemColumns.reduce(
        (total, column) => total + column.minWidth,
        serialColumnWidth,
      ) + actionsColumnWidth,
    [],
  );

  const commitLineItems = (nextItems: OrderLineItem[]) => {
    setLineItems(nextItems);
    onChange(nextItems);
  };

  const handleAddLineItem = () => {
    if (allValuesEmpty(draftValues)) {
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
    setDraftValues(createEmptyValues());
  };

  const handleDeleteLineItem = (rowId: string) => {
    const nextItems = lineItems.filter((row) => row.id !== rowId);
    commitLineItems(nextItems);

    if (editingRowId === rowId) {
      setEditingRowId(null);
      setEditingValues(createEmptyValues());
    }
  };

  const handleStartEdit = (row: OrderLineItem) => {
    setEditingRowId(row.id);
    setEditingValues(mapLineItemToValues(row));
  };

  const handleSaveEdit = (rowId: string) => {
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
    setEditingValues(createEmptyValues());
  };

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
                    <TableCell sx={(theme) => getHeaderCellSx(theme, serialColumnWidth, "center")}>
                      Sr No
                    </TableCell>
                    {orderLineItemColumns.map((column) => (
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
                    <TableCell sx={(theme) => getBodyCellSx(theme, "center")}>
                      <Typography variant="body2" color="text.primary">
                        1
                      </Typography>
                    </TableCell>
                    {orderLineItemColumns.map((column) => (
                      <TableCell
                        key={column.key}
                        sx={(theme) => getBodyCellSx(theme)}
                      >
                        {renderField({
                          column,
                          onChange: (value) =>
                            setDraftValues((current) => ({
                              ...current,
                              [column.key]: value,
                            })),
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
              startIcon={<Plus size={16} />}
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
              sx={{ minWidth: tableMinWidth + (readOnly ? 0 : 120), tableLayout: "auto" }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={(theme) => getHeaderCellSx(theme, serialColumnWidth, "center")}>
                    Sr No
                  </TableCell>
                  {orderLineItemColumns.map((column) => (
                    <TableCell
                      key={column.key}
                      sx={(theme) => getHeaderCellSx(theme, column.minWidth)}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                  {!readOnly ? (
                    <TableCell sx={(theme) => getHeaderCellSx(theme, actionsColumnWidth, "center")}>
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
                      <TableCell sx={(theme) => getBodyCellSx(theme, "center")}>
                        <Typography variant="body2" color="text.primary">
                          {index + 1}
                        </Typography>
                      </TableCell>
                      {orderLineItemColumns.map((column) => (
                        <TableCell
                          key={column.key}
                          sx={(theme) => getBodyCellSx(theme)}
                        >
                          {isEditing
                            ? renderField({
                                column,
                                onChange: (value) =>
                                  setEditingValues((current) => ({
                                    ...current,
                                    [column.key]: value,
                                  })),
                                value: editingValues[column.key] ?? "",
                              })
                            : (
                              <Typography
                                variant="body2"
                                color="text.primary"
                                sx={(theme) => ({
                                  minHeight: theme.spacing(4.5),
                                  display: "flex",
                                  alignItems: "center",
                                })}
                              >
                                {row[column.key]}
                              </Typography>
                            )}
                        </TableCell>
                      ))}
                      {!readOnly ? (
                        <TableCell align="center" sx={(theme) => getBodyCellSx(theme)}>
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
    </Stack>
  );
}

function createEmptyValues() {
  return orderLineItemColumns.reduce<Record<string, string>>((accumulator, column) => {
    accumulator[column.key] = "";
    return accumulator;
  }, {});
}

function allValuesEmpty(values: Record<string, string>) {
  return Object.values(values).every((value) => value.trim().length === 0);
}

function mapValuesToLineItem(values: Record<string, string>): Omit<OrderLineItem, "id"> {
  return {
    productCategory: values.productCategory ?? "",
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
    amount: values.amount ?? "",
  };
}

function mapLineItemToValues(lineItem: OrderLineItem) {
  return {
    productCategory: lineItem.productCategory,
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
    amount: lineItem.amount,
  };
}

function renderField({
  column,
  onChange,
  value,
}: {
  column: OrderLineItemColumn;
  onChange: (value: string) => void;
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
      sx={(theme) => getCompactFieldSx(theme)}
    />
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
