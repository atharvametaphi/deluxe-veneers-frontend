import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { ChevronLeft, Pencil, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import {
  MasterFormFields,
  MasterPageShell,
  MasterSectionCard,
  hasRequiredFieldErrors,
  type MasterFieldDefinition,
  type MasterFieldValue,
} from "../../masters/shared";
import { transporterMasterOptions } from "../../masters/shared/masterDefinitions";
import {
  createDispatchEntry,
  type PackingRecord,
  usePackingRecords,
} from "../../packing/shared/packingStore";
import { canAccessPermission } from "../../permissions";
import { orderTypeOptions } from "../../orders/shared/ordersStore";

interface DispatchItemRow {
  id: string;
  srNo: string;
  orderNo: string;
  salesItemName: string;
  alternateSalesItemName: string;
  orderItemNo: string;
  groupNo: string;
  photoNo: string;
  logNo: string;
  itemName: string;
  itemSubCategory: string;
}

interface DispatchRecordPageProps {
  mode?: "add" | "edit" | "view";
}

export function DispatchCreatePage({
  mode = "add",
}: DispatchRecordPageProps) {
  const records = usePackingRecords();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const sourceRecord = useMemo(
    () => records.find((entry) => entry.id === id),
    [id, records],
  );
  const dispatchItems = useMemo<readonly DispatchItemRow[]>(
    () =>
      sourceRecord
        ? [
            {
              id: `${sourceRecord.id}-dispatch-item`,
              srNo: "1",
              orderNo: sourceRecord.orderNo,
              salesItemName: sourceRecord.itemName,
              alternateSalesItemName: "-",
              orderItemNo: "1",
              groupNo: sourceRecord.series || "-",
              photoNo: "-",
              logNo: "-",
              itemName: sourceRecord.itemName,
              itemSubCategory: "-",
            },
          ]
        : [],
    [sourceRecord],
  );
  const activeFields = useMemo<readonly MasterFieldDefinition[]>(
    () => [
      {
        key: "invoiceNo",
        label: "Invoice No",
        type: "text",
        placeholder: "Enter Invoice No",
      },
      {
        key: "invoiceDateTime",
        label: "Invoice Date & Time",
        type: "date",
      },
      {
        key: "removalDateTime",
        label: "Date/Time of Removal of goods",
        type: "date",
      },
      {
        key: "transDocDate",
        label: "Trans Doc Date",
        type: "date",
      },
      {
        key: "transDocNo",
        label: "Trans Doc No",
        type: "text",
        placeholder: "Enter Trans Doc No",
      },
      {
        key: "customerName",
        label: "Customer Name",
        type: "select",
        options: uniqueDispatchOptions(records, "customerName"),
        placeholder: "Select Customer Name",
      },
      {
        key: "orderType",
        label: "Order Category",
        type: "select",
        options: [...orderTypeOptions],
        placeholder: "Select Order Category",
      },
      {
        key: "packingList",
        label: "Packing List",
        type: "select",
        options: uniqueDispatchOptions(records, "orderNo"),
        placeholder: "Select Packing List",
      },
      {
        key: "suppType",
        label: "Supp Type",
        type: "select",
        options: ["B2B", "B2C", "SEZ", "Export"],
        placeholder: "Select Supp Type",
      },
      {
        key: "transactionType",
        label: "Transaction Type",
        type: "select",
        options: [
          "Regular",
          "Bill To Ship To And Bill From Dispatch From",
          "Export",
          "Job Work",
        ],
        placeholder: "Select Transaction Type",
      },
      {
        key: "buyerAddress",
        label: "Address of Buyer",
        type: "select",
        options: [
          "At Bhatpore",
          "Corporate Office, SG Highway",
          "Factory Billing Address",
        ],
        placeholder: "Select Address of Buyer",
      },
      {
        key: "sellerAddress",
        label: "Address of Seller",
        type: "select",
        options: [
          "Plot No 317 325, Vill Karoli",
          "Deluxe Veneers Factory",
          "Deluxe Veneers Warehouse",
        ],
        placeholder: "Select Address of Seller",
      },
      {
        key: "transporter",
        label: "Transporter",
        type: "select",
        options: transporterMasterOptions,
        placeholder: "Select Transporter",
      },
      {
        key: "transportMode",
        label: "Transport Mode",
        type: "select",
        options: ["Road", "Air", "Rail", "Ship"],
        placeholder: "Select Transport Mode",
      },
      {
        key: "remark",
        label: "Remark",
        type: "text",
        placeholder: "Enter Remark",
      },
    ],
    [records],
  );
  const [values, setValues] = useState<Record<string, MasterFieldValue>>(() =>
    buildDispatchInitialValues(activeFields, sourceRecord, mode),
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const canCreate = canAccessPermission("dispatch", "create");
  const canEdit = canAccessPermission("dispatch", "edit");
  const canView = canAccessPermission("dispatch", "view");
  const canUseMode =
    mode === "add" ? canCreate : mode === "edit" ? canEdit : canView;
  const pageLabel =
    mode === "add"
      ? "Create Dispatch"
      : mode === "edit"
        ? "Edit Dispatch"
        : "View Dispatch";

  useEffect(() => {
    setValues(buildDispatchInitialValues(activeFields, sourceRecord, mode));
  }, [activeFields, mode, sourceRecord]);

  if (!sourceRecord) {
    return (
      <MasterPageShell
        breadcrumbs={[
          { label: "Dispatch", to: "/dispatch" },
          { label: "Not Found" },
        ]}
        title="Dispatch"
      >
        <MasterSectionCard>
          <Typography variant="body2" color="text.secondary">
            The requested dispatch source record could not be found.
          </Typography>
        </MasterSectionCard>
      </MasterPageShell>
    );
  }

  if (!canUseMode) {
    return (
      <MasterPageShell
        breadcrumbs={[
          { label: "Dispatch", to: "/dispatch" },
          { label: pageLabel },
        ]}
        title={pageLabel}
      >
        <MasterSectionCard>
          <Alert severity="warning">
            You do not have permission to access this dispatch action.
          </Alert>
        </MasterSectionCard>
      </MasterPageShell>
    );
  }

  return (
    <MasterPageShell
      breadcrumbs={[
        { label: "Dispatch", to: "/dispatch" },
        { label: pageLabel },
      ]}
      title={pageLabel}
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

          <TableContainer
            sx={(theme) => ({
              border: `1px solid ${theme.customTokens.borders.default}`,
              borderRadius: `${theme.customTokens.radius.md}px`,
              overflowX: "auto",
              overflowY: "hidden",
            })}
          >
            <Table sx={{ minWidth: 1200 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={(theme) => getHeaderCellSx(theme, 88)}>
                    Sr. No
                  </TableCell>
                  <TableCell sx={(theme) => getHeaderCellSx(theme, 120)}>
                    Order No
                  </TableCell>
                  <TableCell sx={(theme) => getHeaderCellSx(theme, 200)}>
                    Sales Item Name
                  </TableCell>
                  <TableCell sx={(theme) => getHeaderCellSx(theme, 220)}>
                    Alternate Sales Item Name
                  </TableCell>
                  <TableCell sx={(theme) => getHeaderCellSx(theme, 120)}>
                    Order Item No
                  </TableCell>
                  <TableCell sx={(theme) => getHeaderCellSx(theme, 120)}>
                    Group No
                  </TableCell>
                  <TableCell sx={(theme) => getHeaderCellSx(theme, 120)}>
                    Photo No
                  </TableCell>
                  <TableCell sx={(theme) => getHeaderCellSx(theme, 120)}>
                    Log No.
                  </TableCell>
                  <TableCell sx={(theme) => getHeaderCellSx(theme, 160)}>
                    Item Name
                  </TableCell>
                  <TableCell sx={(theme) => getHeaderCellSx(theme, 160)}>
                    Item Sub Category
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {dispatchItems.length > 0 ? (
                  dispatchItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell sx={(theme) => getBodyCellSx(theme)}>
                        {item.srNo}
                      </TableCell>
                      <TableCell sx={(theme) => getBodyCellSx(theme)}>
                        {item.orderNo}
                      </TableCell>
                      <TableCell sx={(theme) => getBodyCellSx(theme)}>
                        {item.salesItemName}
                      </TableCell>
                      <TableCell sx={(theme) => getBodyCellSx(theme)}>
                        {item.alternateSalesItemName}
                      </TableCell>
                      <TableCell sx={(theme) => getBodyCellSx(theme)}>
                        {item.orderItemNo}
                      </TableCell>
                      <TableCell sx={(theme) => getBodyCellSx(theme)}>
                        {item.groupNo}
                      </TableCell>
                      <TableCell sx={(theme) => getBodyCellSx(theme)}>
                        {item.photoNo}
                      </TableCell>
                      <TableCell sx={(theme) => getBodyCellSx(theme)}>
                        {item.logNo}
                      </TableCell>
                      <TableCell sx={(theme) => getBodyCellSx(theme)}>
                        {item.itemName}
                      </TableCell>
                      <TableCell sx={(theme) => getBodyCellSx(theme)}>
                        {item.itemSubCategory}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      sx={(theme) => ({
                        ...getBodyCellSx(theme),
                        textAlign: "center",
                        color: theme.customTokens.text.secondary,
                      })}
                    >
                      No dispatch item is available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

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
                  onClick={() => navigate("/dispatch")}
                  startIcon={<ChevronLeft size={16} />}
                  variant="outlined"
                >
                  Back
                </Button>

                {canEdit ? (
                  <Button
                    onClick={() => navigate(`/dispatch/edit/${sourceRecord.id}`)}
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
                  onClick={() => navigate("/dispatch")}
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

                    createDispatchEntry(sourceRecord.id, {
                      dispatchDate:
                        values.removalDateTime instanceof Date
                          ? values.removalDateTime
                          : null,
                      ...(typeof values.customerName === "string"
                        ? { customerName: values.customerName }
                        : {}),
                      ...(typeof values.orderType === "string"
                        ? { orderType: values.orderType }
                        : {}),
                      ...(typeof values.remark === "string"
                        ? { remark: values.remark }
                        : {}),
                    });
                    navigate("/dispatch");
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

export function DispatchEditPage() {
  return <DispatchCreatePage mode="edit" />;
}

export function DispatchViewPage() {
  return <DispatchCreatePage mode="view" />;
}

function buildDispatchInitialValues(
  fields: readonly MasterFieldDefinition[],
  record: PackingRecord | undefined,
  mode: "add" | "edit" | "view",
) {
  return fields.reduce<Record<string, MasterFieldValue>>(
    (accumulator, field) => {
      if (field.type === "date") {
        if (mode === "add") {
          accumulator[field.key] = new Date();
          return accumulator;
        }

        const value =
          field.key === "invoiceDateTime" ||
          field.key === "removalDateTime" ||
          field.key === "transDocDate"
            ? record?.dispatchDate
            : record?.[field.key as keyof PackingRecord];

        accumulator[field.key] = value instanceof Date ? value : null;
        return accumulator;
      }

      const value = getDispatchInitialStringValue(field.key, record);
      accumulator[field.key] = typeof value === "string" ? value : "";
      return accumulator;
    },
    {},
  );
}

function uniqueDispatchOptions(
  records: readonly PackingRecord[],
  key: "customerName" | "orderNo" | "orderType",
) {
  return Array.from(new Set(records.map((record) => record[key]).filter(Boolean)));
}

function getDispatchInitialStringValue(
  key: string,
  record: PackingRecord | undefined,
) {
  if (!record) {
    return "";
  }

  const initialValueByKey: Record<string, string> = {
    buyerAddress: "",
    customerName: record.customerName,
    invoiceNo: record.orderNo,
    orderType: normalizeDispatchOrderCategory(record.orderType),
    packingList: record.orderNo,
    remark: record.remark,
    sellerAddress: "",
    suppType: "B2B",
    transDocNo: "",
    transactionType: "Regular",
    transporter: "",
    transportMode: "",
  };

  return initialValueByKey[key] ?? "";
}

function normalizeDispatchOrderCategory(orderType: string) {
  return orderType.trim().toLowerCase() === "marquetry"
    ? "Marquetry Order"
    : orderType;
}

function getHeaderCellSx(theme: Theme, minWidth: number) {
  return {
    minWidth,
    borderRight: `1px solid ${theme.customTokens.brand.primaryScale[800]}`,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontSize: "0.8125rem",
    fontWeight: 600,
    px: theme.spacing(1.5),
    py: theme.spacing(1.25),
    whiteSpace: "nowrap",
    "&:last-of-type": {
      borderRight: "none",
    },
  };
}

function getBodyCellSx(theme: Theme) {
  return {
    borderBottom: `1px solid ${theme.customTokens.borders.default}`,
    borderRight: `1px solid ${theme.customTokens.borders.default}`,
    color: theme.customTokens.text.primary,
    fontSize: "0.8125rem",
    px: theme.spacing(1.5),
    py: theme.spacing(1.25),
    whiteSpace: "nowrap",
    "&:last-of-type": {
      borderRight: "none",
    },
  };
}
