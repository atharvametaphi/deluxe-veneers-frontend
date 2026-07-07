import { useEffect, useMemo, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { ChevronLeft, Pencil, Save } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router";

import {
  MasterFormFields,
  MasterPageShell,
  MasterSectionCard,
  type MasterFieldDefinition,
  type MasterFieldValue,
} from "../../masters/shared";
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
  const activeFields =
    mode === "view"
      ? orderViewFields
      : activeVariant
        ? getCreateOrderFormFields(activeVariant)
        : orderFormFields;
  const pageTitle = getOrderPageTitle(mode, activeVariant);
  const [values, setValues] = useState<Record<string, MasterFieldValue>>(() =>
    buildOrderInitialValues(activeFields, record, activeVariant),
  );
  const [lineItems, setLineItems] = useState<OrderLineItem[]>(() =>
    record ? getOrderLineItems(record.id) : [],
  );

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
                    const payload = buildOrderPayload(values, lineItems);

                    if (mode === "add") {
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
