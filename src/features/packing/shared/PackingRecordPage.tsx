import { useEffect, useMemo, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { ChevronLeft, Pencil, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router";

import {
  MasterFormFields,
  MasterPageShell,
  MasterSectionCard,
  type MasterFieldDefinition,
  type MasterFieldValue,
} from "../../masters/shared";
import {
  getPackingPaths,
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
  { key: "createdBy", label: "Created By", type: "text" },
  { key: "updatedBy", label: "Updated By", type: "text" },
  { key: "createdDate", label: "Created Date", type: "date" },
  { key: "updatedDate", label: "Updated Date", type: "date" },
];

interface PackingRecordPageProps {
  mode: "edit" | "view";
}

export function PackingRecordPage({ mode }: PackingRecordPageProps) {
  const records = usePackingRecords();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const paths = getPackingPaths();
  const record = useMemo(
    () => records.find((entry) => entry.id === id),
    [id, records],
  );
  const [values, setValues] = useState<Record<string, MasterFieldValue>>(() =>
    buildPackingInitialValues(record),
  );

  useEffect(() => {
    setValues(buildPackingInitialValues(record));
  }, [record]);

  if (!record) {
    return (
      <MasterPageShell
        breadcrumbs={[{ label: "Packing" }, { label: "Not Found" }]}
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

  return (
    <MasterPageShell
      breadcrumbs={[
        { label: "Packing" },
        { label: mode === "edit" ? "Edit Packing" : "View Packing" },
      ]}
      title={mode === "edit" ? "Edit Packing" : "View Packing"}
    >
      <MasterSectionCard>
        <Stack
          sx={(theme) => ({
            gap: theme.spacing(3),
          })}
        >
          <MasterFormFields
            definition={{
              fields: packingRecordFields,
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
                  onClick={() => navigate(paths.edit(record.id))}
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
                    updatePackingRecord(record.id, buildPackingUpdatePayload(values));
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

function buildPackingInitialValues(record?: PackingRecord) {
  return packingRecordFields.reduce<Record<string, MasterFieldValue>>(
    (accumulator, field) => {
      const value = record?.[field.key as keyof PackingRecord];

      if (field.type === "date") {
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
        if (value instanceof Date) {
          accumulator[field.key as keyof PackingRecord] =
            value as PackingRecord[keyof PackingRecord];
        }

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
