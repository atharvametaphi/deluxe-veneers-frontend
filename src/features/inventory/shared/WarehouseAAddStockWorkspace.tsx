import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

import { ModuleProcessTabs } from "../../../components/navigation/ModuleProcessTabs";
import { ErpDatePickerField } from "../../../pages/ComponentLibrary/shared/ErpFieldControls";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import {
  WarehouseAAddStockLineItems,
  type WarehouseAAddStockSlug,
} from "./WarehouseAAddStockLineItems";

type AddStockWorkspaceTab = "item-details" | "invoice-details";

type InvoiceDetailValues = {
  cgstPercentage: string;
  gstPercentage: string;
  gstValue: string;
  invoiceDate: Date | null;
  invoiceValue: string;
  remark: string;
  sgstPercentage: string;
};

const workspaceTabs = [
  { label: "Item Details", value: "item-details" },
  { label: "Invoice Details", value: "invoice-details" },
] as const satisfies readonly { label: string; value: AddStockWorkspaceTab }[];

const defaultInvoiceDetailValues: InvoiceDetailValues = {
  cgstPercentage: "",
  gstPercentage: "",
  gstValue: "",
  invoiceDate: new Date(),
  invoiceValue: "",
  remark: "",
  sgstPercentage: "",
};

export function WarehouseAAddStockWorkspace({
  slug,
}: {
  slug: WarehouseAAddStockSlug;
}) {
  const theme = useTheme();
  const [activeTab, setActiveTab] =
    useState<AddStockWorkspaceTab>("item-details");
  const [lineItemsAmountTotal, setLineItemsAmountTotal] = useState(0);
  const [invoiceDetailValues, setInvoiceDetailValues] =
    useState<InvoiceDetailValues>(defaultInvoiceDetailValues);

  const formattedLineItemsAmount = useMemo(
    () => formatAmount(lineItemsAmountTotal),
    [lineItemsAmountTotal],
  );

  const handleInvoiceFieldChange = (
    key: keyof InvoiceDetailValues,
    value: Date | string | null,
  ) => {
    setInvoiceDetailValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleCalculateInvoice = () => {
    const totalItemAmount = lineItemsAmountTotal;
    const gstPercentage = parseNumber(invoiceDetailValues.gstPercentage);
    const sgstPercentage = parseNumber(invoiceDetailValues.sgstPercentage);
    const cgstPercentage = parseNumber(invoiceDetailValues.cgstPercentage);
    const effectiveGstPercentage =
      gstPercentage > 0 ? gstPercentage : sgstPercentage + cgstPercentage;
    const gstValue = totalItemAmount * (effectiveGstPercentage / 100);
    const invoiceValue = totalItemAmount + gstValue;

    setInvoiceDetailValues((current) => ({
      ...current,
      gstPercentage:
        current.gstPercentage.trim().length > 0
          ? current.gstPercentage
          : effectiveGstPercentage > 0
            ? formatPlainNumber(effectiveGstPercentage)
            : "",
      gstValue: formatAmount(gstValue),
      invoiceValue: formatAmount(invoiceValue),
    }));
  };

  return (
    <Stack
      sx={{
        gap: theme.spacing(2),
      }}
    >
      <ModuleProcessTabs
        onChange={setActiveTab}
        tabs={workspaceTabs}
        value={activeTab}
      />

      <Box
        sx={{
          display: activeTab === "item-details" ? "block" : "none",
        }}
      >
        <WarehouseAAddStockLineItems
          slug={slug}
          onAmountTotalChange={setLineItemsAmountTotal}
        />
      </Box>

      <Box
        sx={{
          display: activeTab === "invoice-details" ? "block" : "none",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gap: theme.spacing(2),
            gridTemplateColumns: {
              xs: "repeat(1, minmax(0, 1fr))",
              md: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
          }}
        >
          <InvoiceField label="Invoice Date*">
            <ErpDatePickerField
              onChange={(value) => handleInvoiceFieldChange("invoiceDate", value)}
              placeholder="Select Invoice Date"
              value={invoiceDetailValues.invoiceDate}
            />
          </InvoiceField>

          <InvoiceField label="Total Item Amount">
            <TextField
              fullWidth
              value={formattedLineItemsAmount}
              sx={getCompactFieldSx(theme, "readOnly")}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />
          </InvoiceField>

          <InvoiceField label="GST Percentage*">
            <TextField
              fullWidth
              placeholder="Enter GST Percentage"
              value={invoiceDetailValues.gstPercentage}
              onChange={(event) =>
                handleInvoiceFieldChange("gstPercentage", event.target.value)
              }
              sx={getCompactFieldSx(theme)}
            />
          </InvoiceField>

          <InvoiceField label="SGST Percentage*">
            <TextField
              fullWidth
              placeholder="Enter SGST Percentage"
              value={invoiceDetailValues.sgstPercentage}
              onChange={(event) =>
                handleInvoiceFieldChange("sgstPercentage", event.target.value)
              }
              sx={getCompactFieldSx(theme)}
            />
          </InvoiceField>

          <InvoiceField label="CGST Percentage*">
            <TextField
              fullWidth
              placeholder="Enter CGST Percentage"
              value={invoiceDetailValues.cgstPercentage}
              onChange={(event) =>
                handleInvoiceFieldChange("cgstPercentage", event.target.value)
              }
              sx={getCompactFieldSx(theme)}
            />
          </InvoiceField>

          <InvoiceField label="GST Value">
            <TextField
              fullWidth
              value={invoiceDetailValues.gstValue}
              sx={getCompactFieldSx(theme, "readOnly")}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />
          </InvoiceField>

          <InvoiceField label="Invoice Value">
            <TextField
              fullWidth
              value={invoiceDetailValues.invoiceValue}
              sx={getCompactFieldSx(theme, "readOnly")}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        disableElevation
                        onClick={handleCalculateInvoice}
                        sx={{
                          minWidth: theme.spacing(10),
                          px: theme.spacing(1.25),
                          py: theme.spacing(0.5),
                        }}
                        variant="contained"
                      >
                        Calculate
                      </Button>
                    </InputAdornment>
                  ),
                  readOnly: true,
                },
              }}
            />
          </InvoiceField>

          <InvoiceField label="Remark">
            <TextField
              fullWidth
              placeholder="Enter Remark"
              value={invoiceDetailValues.remark}
              onChange={(event) =>
                handleInvoiceFieldChange("remark", event.target.value)
              }
              sx={getCompactFieldSx(theme)}
            />
          </InvoiceField>
        </Box>
      </Box>
    </Stack>
  );
}

function InvoiceField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <Stack spacing={0.75}>
      <Typography variant="subtitle2" color="text.primary">
        {label}
      </Typography>
      {children}
    </Stack>
  );
}

function parseNumber(value: string) {
  const numericValue = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPlainNumber(value: number) {
  return Number.isInteger(value) ? String(value) : String(value.toFixed(2));
}
