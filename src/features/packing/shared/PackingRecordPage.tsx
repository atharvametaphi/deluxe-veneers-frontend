import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { ChevronLeft, Pencil, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import {
  EnterpriseDataTable,
  type EnterpriseTableColumn,
  type EnterpriseTableRow,
} from "../../../components/data-display/EnterpriseDataTable";
import {
  MasterFormFields,
  MasterPageShell,
  MasterSectionCard,
  hasRequiredFieldErrors,
  type MasterFieldDefinition,
  type MasterFieldValue,
} from "../../masters/shared";
import {
  getOrderLineItems,
  getOrderVariantFromType,
  type OrderRecord,
  useOrderRecords,
} from "../../orders/shared/ordersStore";
import { canAccessPermission } from "../../permissions";
import {
  createPackingEntry,
  getPackingPaths,
  packingOrderTypeOptions,
  type PackingRecord,
  updatePackingRecord,
  usePackingRecords,
} from "./packingStore";

const packingRecordFields: readonly MasterFieldDefinition[] = [
  { key: "issuedFrom", label: "Issued From", type: "text" },
  { key: "orderNo", label: "Order No", type: "text" },
  { key: "customerName", label: "Customer Name", type: "text" },
  { key: "orderType", label: "Order Type", type: "text" },
  { key: "productCategory", label: "Product Category", type: "text" },
  { key: "itemName", label: "Item Name", type: "text" },
  { key: "length", label: "Length", type: "text" },
  { key: "width", label: "Width", type: "text" },
  { key: "thickness", label: "Thickness", type: "text" },
  { key: "series", label: "Series", type: "text" },
  { key: "grade", label: "Grade", type: "text" },
  { key: "amount", label: "Amount", type: "text" },
  { key: "remark", label: "Remark", type: "text" },
  { key: "packingDate", label: "Packing Date", type: "date" },
  { key: "dispatchDate", label: "Dispatch Date", type: "date" },
  { key: "createdBy", label: "Created By", type: "text" },
  { key: "updatedBy", label: "Updated By", type: "text" },
  { key: "createdDate", label: "Created Date", type: "date" },
  { key: "updatedDate", label: "Updated Date", type: "date" },
];

interface PackingSourceRow extends EnterpriseTableRow {
  sourceOrderId: string;
  customerName: string;
  orderNo: string;
  orderItemNo: string;
  orderType: string;
  productCategory: string;
  itemName: string;
  groupNo: string;
  photoNo: string;
  length: string;
  width: string;
  thickness: string;
  noOfSheets: string;
  sqm: string;
  amount: string;
}

const packingSourceColumns: readonly EnterpriseTableColumn<PackingSourceRow>[] =
  [
    { key: "orderNo", label: "Order No" },
    { key: "orderItemNo", label: "Order Item No" },
    { key: "productCategory", label: "Product Category" },
    { key: "itemName", label: "Item Name" },
    { key: "groupNo", label: "Group No" },
    { key: "photoNo", label: "Photo No" },
    { key: "length", label: "Length" },
    { key: "width", label: "Width" },
    { key: "noOfSheets", label: "No of Sheets" },
    { key: "sqm", label: "SQM" },
    { key: "amount", label: "Amount" },
  ];

interface PackingRecordPageProps {
  mode: "add" | "edit" | "view";
}

export function PackingRecordPage({ mode }: PackingRecordPageProps) {
  const packingRecords = usePackingRecords();
  const orderRecords = useOrderRecords();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const paths = getPackingPaths();
  const record = useMemo(
    () => packingRecords.find((entry) => entry.id === id),
    [id, packingRecords],
  );
  const packingSourceRows = useMemo(
    () => buildPackingSourceRows(orderRecords),
    [orderRecords],
  );
  const customerOptions = useMemo(
    () =>
      uniqueStringValues([
        ...orderRecords.map((entry) => entry.customerName),
        ...packingRecords.map((entry) => entry.customerName),
      ]),
    [orderRecords, packingRecords],
  );
  const productCategoryOptions = useMemo(
    () =>
      uniqueStringValues([
        ...packingSourceRows.map((entry) => entry.productCategory),
        ...packingRecords.map((entry) => entry.productCategory),
      ]),
    [packingRecords, packingSourceRows],
  );
  const createPackingFields = useMemo<readonly MasterFieldDefinition[]>(
    () => [
      {
        key: "packingDate",
        label: "Packing Date",
        type: "date",
      },
      {
        key: "customerName",
        label: "Customer Name",
        type: "select",
        options: customerOptions,
        placeholder: "Select Customer Name",
      },
      {
        key: "orderType",
        label: "Order Type",
        type: "select",
        options: [...packingOrderTypeOptions],
        placeholder: "Select Order Type",
      },
      {
        key: "productCategory",
        label: "Product Category",
        type: "select",
        options: productCategoryOptions,
        placeholder: "Select Product Category",
      },
      {
        key: "remark",
        label: "Remark",
        type: "text",
        placeholder: "Enter Remark",
      },
    ],
    [customerOptions, productCategoryOptions],
  );
  const activeFields = mode === "add" ? createPackingFields : packingRecordFields;
  const [values, setValues] = useState<Record<string, MasterFieldValue>>(() =>
    buildPackingInitialValues(activeFields, record, mode),
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [selectedSourceRowIds, setSelectedSourceRowIds] = useState<string[]>([]);
  const canCreate = canAccessPermission("packing", "create");
  const canEdit = canAccessPermission("packing", "edit");
  const canView = canAccessPermission("packing", "view");
  const canUseMode =
    mode === "add" ? canCreate : mode === "edit" ? canEdit : canView;

  useEffect(() => {
    setValues(buildPackingInitialValues(activeFields, record, mode));
  }, [activeFields, mode, record]);

  const selectedCustomerName =
    typeof values.customerName === "string" ? values.customerName.trim() : "";
  const selectedOrderType =
    typeof values.orderType === "string" ? values.orderType.trim() : "";
  const selectedProductCategory =
    typeof values.productCategory === "string"
      ? values.productCategory.trim()
      : "";
  const showOrderSourceTable =
    mode === "add" &&
    !record &&
    selectedOrderType.length > 0 &&
    selectedProductCategory.length > 0;
  const filteredSourceRows = useMemo(() => {
    if (!showOrderSourceTable) {
      return [];
    }

    return packingSourceRows.filter((row) => {
      if (!matchesPackingOrderType(row.orderType, selectedOrderType)) {
        return false;
      }

      if (selectedProductCategory && row.productCategory !== selectedProductCategory) {
        return false;
      }

      if (selectedCustomerName && row.customerName !== selectedCustomerName) {
        return false;
      }

      return true;
    });
  }, [
    packingSourceRows,
    selectedCustomerName,
    selectedOrderType,
    selectedProductCategory,
    showOrderSourceTable,
  ]);
  const selectedSourceRows = useMemo(
    () =>
      filteredSourceRows.filter((row) => selectedSourceRowIds.includes(row.id)),
    [filteredSourceRows, selectedSourceRowIds],
  );

  useEffect(() => {
    setSelectedSourceRowIds((current) =>
      current.filter((rowId) =>
        filteredSourceRows.some((row) => row.id === rowId),
      ),
    );
  }, [filteredSourceRows]);

  if ((mode === "edit" || mode === "view") && !record) {
    return (
      <MasterPageShell
        breadcrumbs={[
          { label: "Packing", to: paths.list },
          { label: "Not Found" },
        ]}
        title="Packing"
      >
        <MasterSectionCard>
          <Typography variant="body2" color="text.secondary">
            The requested packing record could not be found.
          </Typography>
        </MasterSectionCard>
      </MasterPageShell>
    );
  }

  if (!canUseMode) {
    return (
      <MasterPageShell
        breadcrumbs={[
          { label: "Packing", to: paths.list },
          {
            label:
              mode === "add"
                ? "Create Packing"
                : mode === "edit"
                  ? "Edit Packing"
                  : "View Packing",
          },
        ]}
        title="Packing"
      >
        <MasterSectionCard>
          <Alert severity="warning">
            You do not have permission to access this packing action.
          </Alert>
        </MasterSectionCard>
      </MasterPageShell>
    );
  }

  return (
    <MasterPageShell
      breadcrumbs={[
        { label: "Packing", to: paths.list },
        {
          label:
            mode === "add"
              ? "Create Packing"
              : mode === "edit"
                ? "Edit Packing"
                : "View Packing",
        },
      ]}
      title={
        mode === "add"
          ? "Create Packing"
          : mode === "edit"
            ? "Edit Packing"
            : "View Packing"
      }
    >
      <MasterSectionCard>
        <Stack
          sx={(theme) => ({
            gap: theme.spacing(3),
          })}
        >
          <MasterFormFields
            definition={{
              fields: activeFields,
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

          {showOrderSourceTable ? (
            <EnterpriseDataTable
              actionColumnLabel="Action"
              actionColumnWidth={120}
              columns={packingSourceColumns}
              defaultRowsPerPage={10}
              emptyStateLabel="No order items match the selected filters."
              maxBodyHeight={420}
              renderActionCell={(row) => {
                const isSelected = selectedSourceRowIds.includes(row.id);

                return (
                  <Button
                    onClick={() =>
                      setSelectedSourceRowIds((current) =>
                        current.includes(row.id)
                          ? current.filter((entryId) => entryId !== row.id)
                          : [...current, row.id],
                      )
                    }
                    size="small"
                    variant={isSelected ? "outlined" : "contained"}
                  >
                    {isSelected ? "Added" : "Create"}
                  </Button>
                );
              }}
              rows={filteredSourceRows}
            />
          ) : null}

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

                {canEdit ? (
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
                ) : null}
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

                    if (mode === "add") {
                      const packingDate =
                        values.packingDate instanceof Date
                          ? values.packingDate
                          : null;
                      const remark =
                        typeof values.remark === "string" ? values.remark : "";

                      if (showOrderSourceTable && selectedSourceRows.length > 0) {
                        selectedSourceRows.forEach((row) => {
                          createPackingEntry(undefined, {
                            amount: row.amount,
                            customerName: selectedCustomerName || row.customerName,
                            issuedFrom: "Orders",
                            itemName: row.itemName,
                            length: row.length,
                            orderNo: row.orderNo,
                            orderType: normalizePackingOrderType(row.orderType),
                            packingDate,
                            productCategory:
                              selectedProductCategory || row.productCategory,
                            remark,
                            thickness: row.thickness,
                            width: row.width,
                          });
                        });
                      } else {
                        createPackingEntry(record?.id, {
                          packingDate,
                          ...(typeof values.customerName === "string"
                            ? { customerName: values.customerName }
                            : {}),
                          ...(typeof values.orderType === "string"
                            ? { orderType: values.orderType }
                            : {}),
                          ...(typeof values.productCategory === "string"
                            ? { productCategory: values.productCategory }
                            : {}),
                          ...(typeof values.remark === "string"
                            ? { remark: values.remark }
                            : {}),
                        });
                      }
                    } else if (record) {
                      updatePackingRecord(
                        record.id,
                        buildPackingUpdatePayload(values),
                      );
                    }

                    navigate(paths.list);
                  }}
                  startIcon={<Save size={16} />}
                  variant="contained"
                >
                  {mode === "add" ? "Submit" : "Save"}
                </Button>
              </>
            )}
          </Box>
        </Stack>
      </MasterSectionCard>
    </MasterPageShell>
  );
}

function buildPackingInitialValues(
  fields: readonly MasterFieldDefinition[],
  record: PackingRecord | undefined,
  mode: "add" | "edit" | "view",
) {
  return fields.reduce<Record<string, MasterFieldValue>>(
    (accumulator, field) => {
      const value = record?.[field.key as keyof PackingRecord];

      if (field.type === "date") {
        if (mode === "add" && field.key === "packingDate") {
          accumulator[field.key] = new Date();
          return accumulator;
        }

        accumulator[field.key] = value instanceof Date ? value : null;
        return accumulator;
      }

      accumulator[field.key] = typeof value === "string" ? value : "";
      return accumulator;
    },
    {},
  );
}

function buildPackingUpdatePayload(values: Record<string, MasterFieldValue>) {
  return packingRecordFields.reduce<Partial<PackingRecord>>(
    (accumulator, field) => {
      const value = values[field.key];

      if (field.type === "date") {
        accumulator[field.key as keyof PackingRecord] =
          (value instanceof Date ? value : null) as PackingRecord[keyof PackingRecord];
        return accumulator;
      }

      if (typeof value === "string") {
        accumulator[field.key as keyof PackingRecord] =
          value as PackingRecord[keyof PackingRecord];
      }

      return accumulator;
    },
    {},
  );
}

function buildPackingSourceRows(orderRecords: readonly OrderRecord[]) {
  return orderRecords.flatMap<PackingSourceRow>((record) => {
    const lineItems = getOrderLineItems(record.id);
    const normalizedLineItems =
      lineItems.length > 0
        ? lineItems
        : [
            {
              id: `${record.id}-line-1`,
              productCategory: record.productCategory,
              itemName: record.itemName,
              subCategory: record.subCategory,
              series: record.series,
              grade: record.grade,
              length: record.length,
              width: record.width,
              thickness: record.thickness,
              quantitySheets: record.quantitySheets,
              totalSqm: record.totalSqm,
              amount: record.amount,
            },
          ];

    return normalizedLineItems.map((item, index) => ({
      id: `${record.id}-${item.id}`,
      sourceOrderId: record.id,
      customerName: record.customerName,
      orderNo: record.orderNo,
      orderItemNo: String(index + 1),
      orderType: record.orderType,
      productCategory: item.productCategory,
      itemName: item.itemName,
      groupNo: item.series || "-",
      photoNo: "-",
      length: item.length,
      width: item.width,
      thickness: item.thickness,
      noOfSheets: item.quantitySheets,
      sqm: item.totalSqm,
      amount: item.amount,
    }));
  });
}

function uniqueStringValues(values: readonly (string | null | undefined)[]) {
  return Array.from(new Set(values.filter(isNonEmptyString)));
}

function isNonEmptyString(
  value: string | null | undefined,
): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function matchesPackingOrderType(
  rowOrderType: string,
  selectedOrderType: string,
) {
  if (!selectedOrderType) {
    return false;
  }

  const rowVariant = getOrderVariantFromType(rowOrderType);
  const selectedVariant = getOrderVariantFromType(selectedOrderType);

  if (rowVariant && selectedVariant) {
    return rowVariant === selectedVariant;
  }

  return (
    rowOrderType.trim().toLowerCase() ===
    selectedOrderType.trim().toLowerCase()
  );
}

function normalizePackingOrderType(orderType: string) {
  return getOrderVariantFromType(orderType) === "marquetry"
    ? "Marquetry"
    : "Raw Order";
}
