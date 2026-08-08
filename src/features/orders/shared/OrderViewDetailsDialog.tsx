import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { Pencil } from "lucide-react";

import { formatMasterValue } from "../../masters/shared";
import { recordFormActionButtonSx } from "../../shared/buttonStyles";
import {
  getOrderLineItems,
  getOrderVariantFromType,
  type OrderCreateVariant,
  type OrderLineItem,
  type OrderRecord,
} from "./ordersStore";

type DetailColumn<TRow> = {
  getValue: (row: TRow) => unknown;
  label: string;
};

const orderDetailColumns: readonly DetailColumn<OrderRecord>[] = [
  { label: "Order No", getValue: (row) => row.orderNo },
  { label: "Order Date", getValue: (row) => row.orderDate },
  { label: "Customer Name", getValue: (row) => row.customerName },
  { label: "Order Type", getValue: (row) => row.orderType },
  { label: "Priority", getValue: (row) => row.priority },
  { label: "Status", getValue: (row) => row.status },
  { label: "Remark", getValue: (row) => row.remark },
  { label: "Created Date", getValue: (row) => row.createdDate },
  { label: "Updated Date", getValue: (row) => row.updatedDate },
  { label: "Created By", getValue: (row) => row.createdBy },
  { label: "Updated By", getValue: (row) => row.updatedBy },
];

const rawItemDetailColumns: readonly DetailColumn<OrderLineItem>[] = [
  { label: "Product Type", getValue: (row) => row.productCategory },
  { label: "Item Name", getValue: (row) => row.itemName },
  { label: "Sub Category", getValue: (row) => row.subCategory },
  { label: "Series", getValue: (row) => row.series },
  { label: "Grade", getValue: (row) => row.grade },
  { label: "Length", getValue: (row) => row.length },
  { label: "Width", getValue: (row) => row.width },
  { label: "Thickness", getValue: (row) => row.thickness },
  { label: "No. of Sheets", getValue: (row) => row.quantitySheets },
  { label: "SQM", getValue: (row) => row.sqm },
  { label: "SQF", getValue: (row) => row.totalSqm },
  { label: "Rate per SQF", getValue: (row) => row.ratePerSqf },
  { label: "Amount", getValue: (row) => row.amount },
  { label: "Remark", getValue: (row) => row.remark },
];

const finishedItemDetailColumns: readonly DetailColumn<OrderLineItem>[] = [
  { label: "Finished Type", getValue: (row) => row.finishedType },
  { label: "Sales Item Name", getValue: (row) => row.salesItemName },
  { label: "Item Name", getValue: (row) => row.itemName },
  { label: "Length", getValue: (row) => row.length },
  { label: "Width", getValue: (row) => row.width },
  { label: "Thickness", getValue: (row) => row.thickness },
  { label: "No. of Sheets", getValue: (row) => row.quantitySheets },
  { label: "SQM", getValue: (row) => row.sqm },
  { label: "SQF", getValue: (row) => row.totalSqm },
  { label: "Rate per SQF", getValue: (row) => row.ratePerSqf },
  { label: "Base Type", getValue: (row) => row.baseType },
  { label: "Base Name", getValue: (row) => row.baseName },
  { label: "Base Length", getValue: (row) => row.baseLength },
  { label: "Base Width", getValue: (row) => row.baseWidth },
  { label: "Base Thickness", getValue: (row) => row.baseThickness },
  { label: "Amount", getValue: (row) => row.amount },
  { label: "Remark", getValue: (row) => row.remark },
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
  const variant = getOrderVariantFromType(record?.orderType);
  const itemColumns = getItemDetailColumns(variant);
  const isFinished = variant === "finished";

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      onClose={onClose}
      open={open}
      slotProps={{
        paper: {
          sx: (theme) => ({
            borderRadius: `${theme.customTokens.radius.md}px`,
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.18)",
            maxHeight: "calc(100vh - 32px)",
            outline: "none",
            width: "min(920px, calc(100vw - 32px))",
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
          py: theme.spacing(1.75),
        })}
      >
        {isFinished ? "Finished Order Details" : "Raw Order Details"}
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
            <Box
              sx={(theme) => ({
                border: `1px solid ${
                  isFinished
                    ? theme.customTokens.brand.primaryScale[200]
                    : theme.customTokens.borders.default
                }`,
                borderRadius: `${theme.customTokens.radius.md}px`,
                backgroundColor: isFinished
                  ? theme.customTokens.brand.primaryScale[50]
                  : theme.customTokens.surfaces.alt,
                px: theme.spacing(1.5),
                py: theme.spacing(1),
              })}
            >
              <Typography
                sx={(theme) => ({
                  color: isFinished
                    ? theme.customTokens.brand.primary
                    : theme.customTokens.text.primary,
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                })}
              >
                {isFinished
                  ? "Finished Order — may require Factory processing linked to Order No + Order Item No."
                  : "Raw Order — raw / non-finished material demand."}
              </Typography>
            </Box>

            <Stack spacing={1}>
              <SectionLabel title="Order Summary" />
              <LabelValueGrid
                items={orderDetailColumns.map((column) => ({
                  label: column.label,
                  value: formatDialogValue(column.getValue(record)),
                }))}
              />
            </Stack>

            <Stack spacing={1.25}>
              <SectionLabel
                title={isFinished ? "Finished Order Items" : "Raw Order Items"}
              />
              {lineItems.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No order items are available.
                </Typography>
              ) : (
                lineItems.map((item, index) => (
                  <Box
                    key={item.id}
                    sx={(theme) => ({
                      border: `1px solid ${theme.customTokens.borders.default}`,
                      borderRadius: `${theme.customTokens.radius.md}px`,
                      px: theme.spacing(1.5),
                      py: theme.spacing(1.25),
                    })}
                  >
                    <Typography
                      sx={(theme) => ({
                        color: theme.customTokens.brand.primary,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        mb: 1,
                      })}
                      title={item.id}
                    >
                      {isFinished
                        ? `Order Item No ${formatOrderItemNo(item.id, index)}`
                        : `Item ${index + 1}`}
                    </Typography>
                    <LabelValueGrid
                      items={itemColumns.map((column) => ({
                        label: column.label,
                        value: formatDialogValue(column.getValue(item)),
                      }))}
                    />
                  </Box>
                ))
              )}
            </Stack>

            <Box
              sx={(theme) => ({
                display: "flex",
                gap: theme.spacing(1.25),
                justifyContent: "flex-end",
                pt: theme.spacing(0.5),
              })}
            >
              <Button
                disableElevation
                onClick={onClose}
                sx={recordFormActionButtonSx}
                variant="outlined"
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

function SectionLabel({ title }: { title: string }) {
  return (
    <Typography
      sx={(theme) => ({
        color: theme.customTokens.text.secondary,
        fontSize: "0.75rem",
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      })}
    >
      {title}
    </Typography>
  );
}

function LabelValueGrid({
  items,
}: {
  items: readonly { label: string; value: string }[];
}) {
  const visibleItems = items.filter((item) => {
    const value = item.value.trim();
    return value.length > 0 && value !== "-";
  });

  return (
    <Box
      sx={(theme) => ({
        display: "grid",
        gap: theme.spacing(1.25),
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          md: "repeat(3, minmax(0, 1fr))",
        },
      })}
    >
      {visibleItems.map((item) => (
        <Stack key={item.label} spacing={0.35} sx={{ minWidth: 0 }}>
          <Typography
            sx={(theme) => ({
              color: theme.customTokens.text.secondary,
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.02em",
            })}
          >
            {item.label}
          </Typography>
          <Typography
            sx={(theme) => ({
              color: theme.customTokens.text.primary,
              fontSize: "0.8125rem",
              fontWeight: 600,
              lineHeight: 1.35,
              wordBreak: "break-word",
            })}
          >
            {item.value}
          </Typography>
        </Stack>
      ))}
    </Box>
  );
}

function formatOrderItemNo(itemId: string, index: number) {
  const numericTail = String(itemId).match(/(\d+)$/)?.[1];
  const sequence = numericTail
    ? Number.parseInt(numericTail, 10)
    : index + 1;

  return `OI-${String(Number.isFinite(sequence) ? sequence : index + 1).padStart(3, "0")}`;
}

function getItemDetailColumns(variant: OrderCreateVariant | null) {
  return variant === "finished" ? finishedItemDetailColumns : rawItemDetailColumns;
}

function formatDialogValue(value: unknown) {
  if (value instanceof Date) {
    return formatMasterValue(value);
  }

  if (value === null || typeof value === "undefined") {
    return "-";
  }

  const text = String(value).trim();

  return text.length > 0 ? text : "-";
}
