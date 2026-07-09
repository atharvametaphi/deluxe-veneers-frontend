import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
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
import type { Theme } from "@mui/material/styles";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";

import {
  cutMasterOptions,
  itemSubCategoryMasterOptions,
} from "../../masters/shared/masterDefinitions";
import { ErpSelectField } from "../../../pages/ComponentLibrary/shared/ErpFieldControls";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";

type WarehouseAAddStockSlug =
  | "veneer-blocks"
  | "raw-veneer"
  | "plywood"
  | "mdf";

type DynamicFieldType = "text" | "select";

type DynamicFieldConfig = {
  key: string;
  label: string;
  minWidth: number;
  options?: readonly string[];
  placeholder: string;
  type: DynamicFieldType;
};

type DynamicLineItem = {
  id: string;
  values: Record<string, string>;
};

const veneerItemOptions = [
  "Oak Veneer",
  "Walnut Veneer",
  "Teak Veneer",
  "Ash Veneer",
] as const;

const plywoodColorOptions = [
  "Natural Oak",
  "Walnut Brown",
  "Teak Gold",
  "Ash Grey",
] as const;

const plywoodTypeOptions = [
  "MR Grade",
  "BWR Grade",
  "Marine Grade",
  "Flexi Plywood",
] as const;

const mdfTypeOptions = [
  "Plain MDF",
  "Moisture Resistant MDF",
  "Pre-Laminated MDF",
  "High Density MDF",
] as const;

const warehouseAAddStockTableConfigs: Record<
  WarehouseAAddStockSlug,
  readonly DynamicFieldConfig[]
> = {
  "veneer-blocks": [
    {
      key: "supplierItemName",
      label: "Supplier Item Name",
      minWidth: 190,
      placeholder: "Enter Supplier Item Name",
      type: "text",
    },
    {
      key: "supplierCode",
      label: "Supplier Code",
      minWidth: 150,
      placeholder: "Enter Supplier Code",
      type: "text",
    },
    {
      key: "itemSubCategory",
      label: "Item Sub Category",
      minWidth: 170,
      options: itemSubCategoryMasterOptions,
      placeholder: "Select Item Sub Category",
      type: "select",
    },
    {
      key: "itemName",
      label: "Item Name",
      minWidth: 170,
      options: veneerItemOptions,
      placeholder: "Select Item Name",
      type: "select",
    },
    {
      key: "cut",
      label: "Cut",
      minWidth: 150,
      options: cutMasterOptions,
      placeholder: "Select Cut",
      type: "select",
    },
    {
      key: "logCode",
      label: "Log Code",
      minWidth: 140,
      placeholder: "Enter Log Code",
      type: "text",
    },
    {
      key: "bundleNumber",
      label: "Bundle Number",
      minWidth: 150,
      placeholder: "Enter Bundle Number",
      type: "text",
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
      key: "noOfLeaves",
      label: "No of Leaves",
      minWidth: 140,
      placeholder: "Enter No of Leaves",
      type: "text",
    },
    {
      key: "totalSqMeter",
      label: "Total Sq Meter",
      minWidth: 145,
      placeholder: "Enter Total Sq Meter",
      type: "text",
    },
    {
      key: "amount",
      label: "Amount",
      minWidth: 130,
      placeholder: "Enter Amount",
      type: "text",
    },
    {
      key: "remark",
      label: "Remark",
      minWidth: 180,
      placeholder: "Enter Remark",
      type: "text",
    },
  ],
  "raw-veneer": [
    {
      key: "supplierItemName",
      label: "Supplier Item Name",
      minWidth: 190,
      placeholder: "Enter Supplier Item Name",
      type: "text",
    },
    {
      key: "supplierCode",
      label: "Supplier Code",
      minWidth: 150,
      placeholder: "Enter Supplier Code",
      type: "text",
    },
    {
      key: "itemSubCategory",
      label: "Item Sub Category",
      minWidth: 170,
      options: itemSubCategoryMasterOptions,
      placeholder: "Select Item Sub Category",
      type: "select",
    },
    {
      key: "itemName",
      label: "Item Name",
      minWidth: 170,
      options: veneerItemOptions,
      placeholder: "Select Item Name",
      type: "select",
    },
    {
      key: "logCode",
      label: "Log Code",
      minWidth: 140,
      placeholder: "Enter Log Code",
      type: "text",
    },
    {
      key: "bundleNumber",
      label: "Bundle Number",
      minWidth: 150,
      placeholder: "Enter Bundle Number",
      type: "text",
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
      key: "noOfLeaves",
      label: "No of Leaves",
      minWidth: 140,
      placeholder: "Enter No of Leaves",
      type: "text",
    },
    {
      key: "totalSqMeter",
      label: "Total Sq Meter",
      minWidth: 145,
      placeholder: "Enter Total Sq Meter",
      type: "text",
    },
    {
      key: "amount",
      label: "Amount",
      minWidth: 130,
      placeholder: "Enter Amount",
      type: "text",
    },
    {
      key: "remark",
      label: "Remark",
      minWidth: 180,
      placeholder: "Enter Remark",
      type: "text",
    },
  ],
  plywood: [
    {
      key: "supplierItemName",
      label: "Supplier Item Name",
      minWidth: 190,
      placeholder: "Enter Supplier Item Name",
      type: "text",
    },
    {
      key: "itemSubCategory",
      label: "Item Sub Category",
      minWidth: 170,
      options: itemSubCategoryMasterOptions,
      placeholder: "Select Item Sub Category",
      type: "select",
    },
    {
      key: "itemName",
      label: "Item Name",
      minWidth: 170,
      options: [
        "Decorative Plywood",
        "Premium Plywood",
        "Flexi Plywood",
        "Architectural Plywood",
      ],
      placeholder: "Select Item Name",
      type: "select",
    },
    {
      key: "color",
      label: "Color",
      minWidth: 150,
      options: plywoodColorOptions,
      placeholder: "Select Color",
      type: "select",
    },
    {
      key: "plywoodType",
      label: "Plywood Type",
      minWidth: 170,
      options: plywoodTypeOptions,
      placeholder: "Select Plywood Type",
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
      key: "sheets",
      label: "Sheets",
      minWidth: 120,
      placeholder: "Enter Sheets",
      type: "text",
    },
    {
      key: "totalSqMeter",
      label: "Total Sq Meter",
      minWidth: 145,
      placeholder: "Enter Total Sq Meter",
      type: "text",
    },
    {
      key: "amount",
      label: "Amount",
      minWidth: 130,
      placeholder: "Enter Amount",
      type: "text",
    },
    {
      key: "remarks",
      label: "Remarks",
      minWidth: 180,
      placeholder: "Enter Remarks",
      type: "text",
    },
  ],
  mdf: [
    {
      key: "supplierItemName",
      label: "Supplier Item Name",
      minWidth: 190,
      placeholder: "Enter Supplier Item Name",
      type: "text",
    },
    {
      key: "itemSubCategory",
      label: "Item Sub Category",
      minWidth: 170,
      options: itemSubCategoryMasterOptions,
      placeholder: "Select Item Sub Category",
      type: "select",
    },
    {
      key: "itemName",
      label: "Item Name",
      minWidth: 170,
      options: [
        "Plain MDF",
        "Router MDF",
        "Pre-Laminated MDF",
        "High Density MDF",
      ],
      placeholder: "Select Item Name",
      type: "select",
    },
    {
      key: "mdfType",
      label: "MDF Type",
      minWidth: 160,
      options: mdfTypeOptions,
      placeholder: "Select MDF Type",
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
      key: "noOfSheets",
      label: "No of Sheets",
      minWidth: 145,
      placeholder: "Enter No of Sheets",
      type: "text",
    },
    {
      key: "totalSqm",
      label: "Total SQM",
      minWidth: 140,
      placeholder: "Enter Total SQM",
      type: "text",
    },
    {
      key: "amount",
      label: "Amount",
      minWidth: 130,
      placeholder: "Enter Amount",
      type: "text",
    },
    {
      key: "remark",
      label: "Remark",
      minWidth: 180,
      placeholder: "Enter Remark",
      type: "text",
    },
  ],
};

export function isWarehouseAAddStockSlug(
  value: string,
): value is WarehouseAAddStockSlug {
  return value in warehouseAAddStockTableConfigs;
}

export function WarehouseAAddStockLineItems({
  slug,
}: {
  slug: WarehouseAAddStockSlug;
}) {
  const theme = useTheme();
  const columnConfig = warehouseAAddStockTableConfigs[slug];
  const nextRowId = useRef(1);
  const [draftValues, setDraftValues] = useState<Record<string, string>>(() =>
    createEmptyValues(columnConfig),
  );
  const [lineItems, setLineItems] = useState<DynamicLineItem[]>([]);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>(
    () => createEmptyValues(columnConfig),
  );

  useEffect(() => {
    nextRowId.current = 1;
    setDraftValues(createEmptyValues(columnConfig));
    setEditingRowId(null);
    setEditingValues(createEmptyValues(columnConfig));
    setLineItems([]);
  }, [columnConfig]);

  const tableMinWidth = useMemo(
    () =>
      columnConfig.reduce((total, column) => total + column.minWidth, 84) + 132,
    [columnConfig],
  );

  const handleAddLineItem = () => {
    if (allValuesEmpty(draftValues)) {
      return;
    }

    const nextId = `${slug}-${nextRowId.current}`;
    nextRowId.current += 1;

    setLineItems((current) => [
      ...current,
      {
        id: nextId,
        values: { ...draftValues },
      },
    ]);
    setDraftValues(createEmptyValues(columnConfig));
  };

  const handleDeleteLineItem = (rowId: string) => {
    setLineItems((current) => current.filter((row) => row.id !== rowId));

    if (editingRowId === rowId) {
      setEditingRowId(null);
      setEditingValues(createEmptyValues(columnConfig));
    }
  };

  const handleStartEdit = (row: DynamicLineItem) => {
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
    setEditingValues(createEmptyValues(columnConfig));
  };

  return (
    <Stack
      sx={{
        gap: theme.spacing(2),
      }}
    >
      <Box
        sx={{
          border: `1px solid ${theme.customTokens.borders.default}`,
          borderRadius: `${theme.customTokens.radius.md}px`,
          backgroundColor: theme.customTokens.surfaces.surface,
          overflow: "hidden",
        }}
      >
        <Box sx={getScrollableTableSx(theme)}>
          <Table size="small" sx={{ minWidth: tableMinWidth, tableLayout: "auto" }}>
            <TableHead>
              <TableRow>
                <TableCell sx={getHeaderCellSx(theme, 84)}>Sr No</TableCell>

                {columnConfig.map((column) => (
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
              <TableRow
                sx={{
                  "&:nth-of-type(even)": {
                    backgroundColor: theme.customTokens.surfaces.alt,
                  },
                }}
              >
                <TableCell sx={getBodyCellSx(theme)}>
                  <Typography variant="body2" color="text.primary">
                    1
                  </Typography>
                </TableCell>

                {columnConfig.map((column) => (
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
          Add Item
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
              sx={{ minWidth: tableMinWidth + 120, tableLayout: "auto" }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={getHeaderCellSx(theme, 84)}>Sr No</TableCell>

                  {columnConfig.map((column) => (
                    <TableCell
                      key={column.key}
                      sx={getHeaderCellSx(theme, column.minWidth)}
                    >
                      {column.label}
                    </TableCell>
                  ))}

                  <TableCell sx={getHeaderCellSx(theme, 120)}>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {lineItems.map((row, index) => {
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
                      <TableCell sx={getBodyCellSx(theme)}>
                        <Typography variant="body2" color="text.primary">
                          {index + 1}
                        </Typography>
                      </TableCell>

                      {columnConfig.map((column) => (
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
                            : renderReadOnlyCell(
                                row.values[column.key] ?? "",
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
  );
}

function createEmptyValues(columns: readonly DynamicFieldConfig[]) {
  return columns.reduce<Record<string, string>>((accumulator, column) => {
    accumulator[column.key] = "";
    return accumulator;
  }, {});
}

function allValuesEmpty(values: Record<string, string>) {
  return Object.values(values).every((value) => value.trim().length === 0);
}

function getHeaderCellSx(theme: Theme, minWidth: number) {
  return {
    minWidth,
    backgroundColor: theme.customTokens.brand.primary,
    borderBottom: `1px solid ${theme.customTokens.brand.primaryScale[800]}`,
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
  column: DynamicFieldConfig;
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
      sx={getCompactFieldSx(theme)}
    />
  );
}

function renderReadOnlyCell(
  value: string,
  theme: Theme,
): ReactNode {
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
      {value.trim().length > 0 ? value : "-"}
    </Typography>
  );
}
