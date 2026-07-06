import { useEffect, useMemo, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Save } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import {
  MasterFormFields,
  MasterPageShell,
  MasterSectionCard,
  type MasterFieldDefinition,
  type MasterFieldValue,
} from "../../masters/shared";
import {
  createDispatchEntry,
  type PackingRecord,
  usePackingRecords,
} from "../../packing/shared/packingStore";

export function DispatchCreatePage() {
  const records = usePackingRecords();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const sourceRecord = useMemo(
    () => records.find((entry) => entry.id === id),
    [id, records],
  );
  const activeFields = useMemo<readonly MasterFieldDefinition[]>(
    () => [
      {
        key: "dispatchDate",
        label: "Dispatch Date",
        type: "date",
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
        label: "Order Type",
        type: "select",
        options: uniqueDispatchOptions(records, "orderType"),
        placeholder: "Select Order Type",
      },
      {
        key: "productCategory",
        label: "Product Category",
        type: "select",
        options: uniqueDispatchOptions(records, "productCategory"),
        placeholder: "Select Product Category",
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
    buildDispatchInitialValues(activeFields, sourceRecord),
  );

  useEffect(() => {
    setValues(buildDispatchInitialValues(activeFields, sourceRecord));
  }, [activeFields, sourceRecord]);

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

  return (
    <MasterPageShell
      breadcrumbs={[
        { label: "Dispatch", to: "/dispatch" },
        { label: "Create Dispatch" },
      ]}
      title="Create Dispatch"
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
            values={values}
          />

          <Box
            sx={(theme) => ({
              display: "flex",
              justifyContent: "center",
              gap: theme.spacing(1.5),
              flexWrap: "wrap",
            })}
          >
            <Button
              onClick={() => navigate("/dispatch")}
              variant="outlined"
            >
              Cancel
            </Button>

            <Button
              onClick={() => {
                createDispatchEntry(sourceRecord.id, {
                  dispatchDate:
                    values.dispatchDate instanceof Date
                      ? values.dispatchDate
                      : null,
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
                navigate("/dispatch");
              }}
              startIcon={<Save size={16} />}
              variant="contained"
            >
              Submit
            </Button>
          </Box>
        </Stack>
      </MasterSectionCard>
    </MasterPageShell>
  );
}

function buildDispatchInitialValues(
  fields: readonly MasterFieldDefinition[],
  record?: PackingRecord,
) {
  return fields.reduce<Record<string, MasterFieldValue>>(
    (accumulator, field) => {
      if (field.type === "date") {
        accumulator[field.key] = new Date();
        return accumulator;
      }

      const value = record?.[field.key as keyof PackingRecord];
      accumulator[field.key] = typeof value === "string" ? value : "";
      return accumulator;
    },
    {},
  );
}

function uniqueDispatchOptions(
  records: readonly PackingRecord[],
  key: "customerName" | "orderType" | "productCategory",
) {
  return Array.from(new Set(records.map((record) => record[key]).filter(Boolean)));
}
