import { useEffect, useMemo, useState } from "react";
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
import type { Theme } from "@mui/material/styles";
import { ChevronLeft, Pencil, Save } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router";

import {
  MasterFormFields,
  MasterPageShell,
  MasterSectionCard,
  formatMasterValue,
  hasRequiredFieldErrors,
  type MasterFieldDefinition,
  type MasterFieldValue,
} from "../../masters/shared";
import { canAccessPermission } from "../../permissions";
import {
  createOrderRecord,
  getCreateOrderFormFields,
  getOrderLineItems,
  getOrdersPaths,
  getOrderCreateVariant,
  getOrderVariantFromType,
  getOrderVariantLabel,
  orderFormFields,
  orderViewFields,
  type OrderDraft,
  type OrderCreateVariant,
  type OrderLineItem,
  type OrderRecord,
  updateOrderRecord,
  useOrderRecords,
} from "./ordersStore";
import { OrderLineItemsTable } from "./OrderLineItemsTable";

interface OrderRecordPageProps {
  mode: "add" | "edit" | "view";
}

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
  { label: "Product Category", minWidth: 160, getValue: (row) => row.productCategory },
  { label: "Sales Coordinator", minWidth: 180, getValue: (row) => row.salesCoordinator },
  { label: "Status", minWidth: 130, getValue: (row) => row.status },
  { label: "Created Date", minWidth: 130, getValue: (row) => row.createdDate },
  { label: "Updated Date", minWidth: 130, getValue: (row) => row.updatedDate },
  { label: "Created By", minWidth: 130, getValue: (row) => row.createdBy },
  { label: "Updated By", minWidth: 130, getValue: (row) => row.updatedBy },
];

const itemDetailColumns: readonly DetailColumn<OrderLineItem>[] = [
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

export function OrderRecordPage({ mode }: OrderRecordPageProps) {
  const records = useOrderRecords();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const paths = getOrdersPaths();
  const record = useMemo(
    () => records.find((entry) => entry.id === id),
    [id, records],
  );
  const createVariant = useMemo<OrderCreateVariant>(
    () => getOrderCreateVariant(searchParams.get("type")),
    [searchParams],
  );
  const recordVariant = useMemo(
    () => getOrderVariantFromType(record?.orderType),
    [record?.orderType],
  );
  const activeVariant = mode === "add" ? createVariant : recordVariant;
  const activeFields = useMemo(
    () =>
      mode === "view"
        ? orderViewFields
        : activeVariant
          ? getCreateOrderFormFields(activeVariant)
          : orderFormFields,
    [activeVariant, mode],
  );
  const pageTitle = getOrderPageTitle(mode, activeVariant);
  const [values, setValues] = useState<Record<string, MasterFieldValue>>(() =>
    buildOrderInitialValues(activeFields, record, activeVariant),
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [lineItems, setLineItems] = useState<OrderLineItem[]>(() =>
    record ? getOrderLineItems(record.id) : [],
  );
  const canCreate = canAccessPermission("placeOrder", "create");
  const canEdit = canAccessPermission("placeOrder", "edit");
  const canView = canAccessPermission("placeOrder", "view");
  const canUseMode =
    mode === "add" ? canCreate : mode === "edit" ? canEdit : canView;

  useEffect(() => {
    setValues(buildOrderInitialValues(activeFields, record, activeVariant));
  }, [activeFields, activeVariant, record]);

  useEffect(() => {
    setLineItems(record ? getOrderLineItems(record.id) : []);
  }, [record]);

  if ((mode === "edit" || mode === "view") && !record) {
    return (
      <MasterPageShell
        breadcrumbs={[
          { label: "Orders", to: paths.list },
          { label: "Not Found" },
        ]}
        title="Orders"
      >
        <MasterSectionCard>
          <Typography variant="body2" color="text.secondary">
            The requested order could not be found in the mock dataset.
          </Typography>
        </MasterSectionCard>
      </MasterPageShell>
    );
  }

  if (!canUseMode) {
    return (
      <MasterPageShell
        breadcrumbs={[
          { label: "Orders", to: paths.list },
          { label: pageTitle },
        ]}
        title={pageTitle}
      >
        <MasterSectionCard>
          <Alert severity="warning">
            You do not have permission to access this order action.
          </Alert>
        </MasterSectionCard>
      </MasterPageShell>
    );
  }

  if (mode === "view" && record) {
    return (
      <MasterPageShell
        breadcrumbs={[
          { label: "Orders", to: paths.list },
          { label: pageTitle },
        ]}
        title={pageTitle}
      >
        <MasterSectionCard>
          <Stack
            sx={(theme) => ({
              gap: theme.spacing(2),
            })}
          >
            <Typography variant="h3" color="text.primary">
              View Details
            </Typography>

            <Box
              sx={(theme) => ({
                borderBottom: `1px solid ${theme.customTokens.borders.default}`,
              })}
            />

            <OrderDetailTable
              columns={orderDetailColumns}
              rows={[record]}
              title="Order Details"
            />

            <OrderDetailTable
              columns={itemDetailColumns}
              emptyLabel="No order items are available."
              rows={lineItems}
              title="Item Details"
            />

            <Box
              sx={(theme) => ({
                display: "flex",
                justifyContent: "center",
                pt: theme.spacing(1),
              })}
            >
              <Button onClick={() => navigate(paths.list)} variant="contained">
                Close
              </Button>
            </Box>
          </Stack>
        </MasterSectionCard>
      </MasterPageShell>
    );
  }

  return (
      <MasterPageShell
        breadcrumbs={[
          { label: "Orders", to: paths.list },
          { label: pageTitle },
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
              fields: activeFields as MasterFieldDefinition[],
              gridColumns: 4,
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

          <OrderLineItemsTable
            items={lineItems}
            onChange={setLineItems}
            readOnly={mode === "view"}
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

                <Button
                  onClick={() => {
                    if (record) {
                      navigate(paths.edit(record.id));
                    }
                  }}
                  startIcon={<Pencil size={16} />}
                  variant="contained"
                >
                  Edit
                </Button>
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
                  onClick={() => {
                    if (!canUseMode) {
                      return;
                    }

                    setHasSubmitted(true);

                    if (
                      mode === "add" &&
                      hasRequiredFieldErrors(activeFields, values)
                    ) {
                      return;
                    }

                    const payload = buildOrderPayload(values, lineItems);

                    if (mode === "add") {
                      if (activeVariant) {
                        payload.orderType = getOrderVariantLabel(activeVariant);
                      }

                      createOrderRecord(payload);
                    } else if (record) {
                      updateOrderRecord(record.id, payload);
                    }

                    navigate(paths.list);
                  }}
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
                  <TableCell colSpan={columns.length} sx={(theme) => getDetailBodyCellSx(theme)}>
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

function buildOrderInitialValues(
  fields: readonly MasterFieldDefinition[],
  record?: OrderRecord,
  variant?: OrderCreateVariant | null,
) {
  return fields.reduce<Record<string, MasterFieldValue>>((accumulator, field) => {
    const value = record?.[field.key as keyof OrderRecord];

    if (!record && variant && field.key === "orderType") {
      accumulator[field.key] = getOrderVariantLabel(variant);
      return accumulator;
    }

    if (field.type === "date") {
      accumulator[field.key] = value instanceof Date ? value : null;
      return accumulator;
    }

    accumulator[field.key] = typeof value === "string" ? value : "";
    return accumulator;
  }, {});
}

function getOrderPageTitle(
  mode: "add" | "edit" | "view",
  variant?: OrderCreateVariant | null,
) {
  const suffix = variant ? getOrderVariantLabel(variant) : "Order";

  if (mode === "add") {
    return `Create ${suffix}`;
  }

  if (mode === "edit") {
    return `Edit ${suffix}`;
  }

  return `View ${suffix}`;
}

function buildOrderPayload(
  values: Record<string, MasterFieldValue>,
  lineItems: readonly OrderLineItem[],
) {
  const payload: Partial<OrderDraft> = {
    lineItems: [...lineItems],
  };

  assignStringValue(payload, "amount", values.amount);
  assignStringValue(payload, "customerName", values.customerName);
  assignDateValue(payload, "deliveryDate", values.deliveryDate);
  assignStringValue(payload, "grade", values.grade);
  assignStringValue(payload, "itemName", values.itemName);
  assignStringValue(payload, "length", values.length);
  assignDateValue(payload, "orderDate", values.orderDate);
  assignStringValue(payload, "orderNo", values.orderNo);
  assignStringValue(payload, "orderType", values.orderType);
  assignStringValue(payload, "productCategory", values.productCategory);
  assignStringValue(payload, "quantitySheets", values.quantitySheets);
  assignStringValue(payload, "salesCoordinator", values.salesCoordinator);
  assignStringValue(payload, "series", values.series);
  assignStringValue(payload, "status", values.status);
  assignStringValue(payload, "subCategory", values.subCategory);
  assignStringValue(payload, "thickness", values.thickness);
  assignStringValue(payload, "totalSqm", values.totalSqm);
  assignStringValue(payload, "width", values.width);

  return payload;
}

function assignDateValue(
  payload: Partial<OrderDraft>,
  key: keyof OrderDraft,
  value: MasterFieldValue | undefined,
) {
  if (!(value instanceof Date)) {
    return;
  }

  (payload as Record<string, string | Date>)[key] = value;
}

function assignStringValue(
  payload: Partial<OrderDraft>,
  key: keyof OrderDraft,
  value: MasterFieldValue | undefined,
) {
  if (typeof value !== "string") {
    return;
  }

  (payload as Record<string, string | Date>)[key] = value;
}
