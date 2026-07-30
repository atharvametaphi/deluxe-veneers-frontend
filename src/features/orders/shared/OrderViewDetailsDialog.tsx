import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";

import { formatMasterValue } from "../../masters/shared";
import { recordFormActionButtonSx } from "../../shared/buttonStyles";
import {
  getOrderLineItems,
  getOrderVariantFromType,
  type OrderCreateVariant,
  type OrderLineItem,
  type OrderRecord,
} from "./ordersStore";
import { Pencil } from "lucide-react";

type DetailColumn<TRow> = {
  getValue: (row: TRow) => unknown;
  label: string;
  minWidth?: number;
};

const orderDetailColumns: readonly DetailColumn<OrderRecord>[] = [
  { label: "Order No", minWidth: 120, getValue: (row) => row.orderNo },
  { label: "Order Date", minWidth: 130, getValue: (row) => row.orderDate },
  { label: "Customer Name", minWidth: 220, getValue: (row) => row.customerName },
  { label: "Order Type", minWidth: 150, getValue: (row) => row.orderType },
  { label: "Priority", minWidth: 120, getValue: (row) => row.priority },
  { label: "Product Category", minWidth: 160, getValue: (row) => row.productCategory },
  { label: "Sales Coordinator", minWidth: 180, getValue: (row) => row.salesCoordinator },
  { label: "Status", minWidth: 130, getValue: (row) => row.status },
  { label: "Created Date", minWidth: 130, getValue: (row) => row.createdDate },
  { label: "Updated Date", minWidth: 130, getValue: (row) => row.updatedDate },
  { label: "Created By", minWidth: 130, getValue: (row) => row.createdBy },
  { label: "Updated By", minWidth: 130, getValue: (row) => row.updatedBy },
];

const rawItemDetailColumns: readonly DetailColumn<OrderLineItem>[] = [
  { label: "Item Sub Category", minWidth: 160, getValue: (row) => row.subCategory },
  { label: "Item Name", minWidth: 180, getValue: (row) => row.itemName },
  { label: "Series", minWidth: 130, getValue: (row) => row.series },
  { label: "Grade", minWidth: 110, getValue: (row) => row.grade },
  { label: "Length", minWidth: 120, getValue: (row) => row.length },
  { label: "Width", minWidth: 120, getValue: (row) => row.width },
  { label: "Thickness", minWidth: 120, getValue: (row) => row.thickness },
  { label: "No. of Sheets", minWidth: 130, getValue: (row) => row.quantitySheets },
  { label: "SQM", minWidth: 120, getValue: (row) => row.sqm },
  { label: "SQF", minWidth: 130, getValue: (row) => row.totalSqm },
  { label: "Rate per SQF", minWidth: 140, getValue: (row) => row.ratePerSqf },
  { label: "Amount", minWidth: 130, getValue: (row) => row.amount },
];

const finishedItemDetailColumns: readonly DetailColumn<OrderLineItem>[] = [
  { label: "Finished Type", minWidth: 150, getValue: (row) => row.finishedType },
  { label: "Sales Item Name", minWidth: 190, getValue: (row) => row.salesItemName },
  { label: "Item Name", minWidth: 180, getValue: (row) => row.itemName },
  { label: "Length", minWidth: 120, getValue: (row) => row.length },
  { label: "Width", minWidth: 120, getValue: (row) => row.width },
  { label: "Thickness", minWidth: 120, getValue: (row) => row.thickness },
  { label: "No. of Sheets", minWidth: 130, getValue: (row) => row.quantitySheets },
  { label: "SQM", minWidth: 120, getValue: (row) => row.sqm },
  { label: "SQF", minWidth: 120, getValue: (row) => row.totalSqm },
  { label: "Base Type", minWidth: 130, getValue: (row) => row.baseType },
  { label: "Base Name", minWidth: 160, getValue: (row) => row.baseName },
  { label: "Base Length", minWidth: 130, getValue: (row) => row.baseLength },
  { label: "Base Width", minWidth: 130, getValue: (row) => row.baseWidth },
  { label: "Base Thickness", minWidth: 150, getValue: (row) => row.baseThickness },
  { label: "Amount", minWidth: 130, getValue: (row) => row.amount },
  { label: "Remark", minWidth: 200, getValue: (row) => row.remark },
];

export function OrderViewDetailsDialog({
  onClose,
  onEdit,
  open,
  record,
}: {
  onClose: () => void;
  onEdit?: (() => void | Promise<void>) | undefined;
  open: boolean;
  record: OrderRecord | undefined;
}) {
  const lineItems = record ? getOrderLineItems(record.id) : [];
  const itemColumns = getItemDetailColumns(getOrderVariantFromType(record?.orderType));

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      onClose={onClose}
      open={open}
      slotProps={{
        paper: {
          sx: (theme) => ({
            borderRadius: `${theme.customTokens.radius.sm}px`,
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.22)",
            maxHeight: "calc(100vh - 32px)",
            outline: "none",
            width: "min(1600px, calc(100vw - 32px))",
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
          color: theme.palette.text.primary,
          fontSize: theme.typography.h3.fontSize,
          fontWeight: 600,
          px: theme.spacing(2),
          py: theme.spacing(2),
        })}
      >
        View Details
      </DialogTitle>

      <DialogContent
        sx={(theme) => ({
          px: theme.spacing(2),
          py: theme.spacing(2),
        })}
      >
        {record ? (
          <Stack
            sx={(theme) => ({
              gap: theme.spacing(2),
            })}
          >
            <OrderDetailTable
              columns={orderDetailColumns}
              rows={[record]}
              title="Order Details"
            />

            <OrderDetailTable
              columns={itemColumns}
              emptyLabel="No order items are available."
              rows={lineItems}
              title="Item Details"
            />

            <Box
              sx={(theme) => ({
                display: "flex",
                gap: theme.spacing(1.5),
                justifyContent: "center",
                pt: theme.spacing(0.5),
              })}
            >
              <Button
                disableElevation
                onClick={onClose}
                sx={recordFormActionButtonSx}
                variant="contained"
              >
                Close
              </Button>
              {onEdit ? (
                <Button
                  disableElevation
                  onClick={onEdit}
                  startIcon={<Pencil size={16} />}
                  sx={recordFormActionButtonSx}
                  variant="contained"
                >
                  Edit
                </Button>
              ) : null}
            </Box>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            The requested order could not be found in the mock dataset.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}

function OrderDetailTable<TRow>({
  columns,
  emptyLabel = "No records are available.",
  rows,
  title,
}: {
  columns: readonly DetailColumn<TRow>[];
  emptyLabel?: string;
  rows: readonly TRow[];
  title: string;
}) {
  return (
    <Stack
      sx={(theme) => ({
        gap: theme.spacing(1),
      })}
    >
      <Typography variant="body1" color="text.primary" fontWeight={600}>
        {title}
      </Typography>

      <Box
        sx={(theme) => ({
          border: `1px solid ${theme.customTokens.borders.default}`,
          borderRadius: `${theme.customTokens.radius.sm}px`,
          overflow: "hidden",
          backgroundColor: theme.customTokens.surfaces.surface,
        })}
      >
        <Box sx={(theme) => getDetailTableScrollSx(theme)}>
          <Table size="small" sx={{ minWidth: getDetailTableMinWidth(columns) }}>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.label}
                    sx={(theme) => getDetailHeaderCellSx(theme, column.minWidth)}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((column) => (
                      <TableCell
                        key={column.label}
                        sx={(theme) => getDetailBodyCellSx(theme)}
                      >
                        {formatDetailValue(column.getValue(row))}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    sx={(theme) => getDetailBodyCellSx(theme)}
                  >
                    {emptyLabel}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Stack>
  );
}

function formatDetailValue(value: unknown) {
  if (value instanceof Date) {
    return formatMasterValue(value);
  }

  if (value === null || typeof value === "undefined") {
    return "-";
  }

  const text = String(value).trim();

  return text.length > 0 ? text : "-";
}

function getItemDetailColumns(variant: OrderCreateVariant | null) {
  return variant === "finished" ? finishedItemDetailColumns : rawItemDetailColumns;
}

function getDetailTableMinWidth<TRow>(columns: readonly DetailColumn<TRow>[]) {
  return columns.reduce((total, column) => total + (column.minWidth ?? 130), 0);
}

function getDetailHeaderCellSx(theme: Theme, minWidth = 130) {
  return {
    minWidth,
    backgroundColor: theme.customTokens.brand.primary,
    borderBottom: `1px solid ${theme.customTokens.brand.primaryScale[800]}`,
    borderRight: `1px solid ${theme.customTokens.brand.primaryScale[600]}`,
    color: theme.customTokens.text.inverse,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 700,
    lineHeight: 1.35,
    py: theme.spacing(1.25),
    textAlign: "center",
    whiteSpace: "nowrap",
  } as const;
}

function getDetailBodyCellSx(theme: Theme) {
  return {
    borderBottom: `1px solid ${theme.customTokens.borders.default}`,
    borderRight: `1px solid ${theme.customTokens.borders.default}`,
    color: theme.palette.text.primary,
    fontSize: theme.typography.caption.fontSize,
    py: theme.spacing(1.25),
    textAlign: "center",
    whiteSpace: "nowrap",
  } as const;
}

function getDetailTableScrollSx(theme: Theme) {
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
