import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { gstMasterOptions } from "../../masters/shared/masterDefinitions";
import {
  ErpDatePickerField,
  ErpSelectField,
} from "../../../pages/ComponentLibrary/shared/ErpFieldControls";
import { getCompactFieldSx } from "../../../pages/ComponentLibrary/sections/inputs/components/inputFieldStyles";
import {
  WarehouseAAddStockLineItems,
  type WarehouseAAddStockLineItemsHandle,
  type WarehouseAAddStockSlug,
} from "./WarehouseAAddStockLineItems";

export type AddStockWorkspaceTab = "item-details" | "invoice-details";

type InvoiceDetailValues = {
  additionalCharges: string;
  cgstPercentage: string;
  gstPercentage: string;
  gstValue: string;
  invoiceDate: Date | null;
  invoiceValue: string;
  remark: string;
  sgstPercentage: string;
  totalItemAmount: string;
};

const workspaceTabs = [
  { label: "Item Details", value: "item-details" },
  { label: "Invoice Details", value: "invoice-details" },
] as const satisfies readonly { label: string; value: AddStockWorkspaceTab }[];

const defaultInvoiceDetailValues: InvoiceDetailValues = {
  additionalCharges: "",
  cgstPercentage: "",
  gstPercentage: "",
  gstValue: "",
  invoiceDate: new Date(),
  invoiceValue: "",
  remark: "",
  sgstPercentage: "",
  totalItemAmount: "",
};

export interface WarehouseAAddStockWorkspaceHandle {
  validate: () => boolean;
}

export const WarehouseAAddStockWorkspace = forwardRef<
  WarehouseAAddStockWorkspaceHandle,
  {
    activeTab?: AddStockWorkspaceTab;
    onTabChange?: (tab: AddStockWorkspaceTab) => void;
    slug: WarehouseAAddStockSlug;
  }
>(function WarehouseAAddStockWorkspace({
  activeTab: controlledActiveTab,
  onTabChange,
  slug,
}, ref) {
  const theme = useTheme();
  const lineItemsRef = useRef<WarehouseAAddStockLineItemsHandle>(null);
  const [internalActiveTab, setInternalActiveTab] =
    useState<AddStockWorkspaceTab>("item-details");
  const activeTab = controlledActiveTab ?? internalActiveTab;
  const [lineItemsAmountTotal, setLineItemsAmountTotal] = useState(0);
  const [invoiceDetailValues, setInvoiceDetailValues] =
    useState<InvoiceDetailValues>(defaultInvoiceDetailValues);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleTabChange = (nextTab: AddStockWorkspaceTab) => {
    setInternalActiveTab(nextTab);
    onTabChange?.(nextTab);
  };

  const formattedLineItemsAmount = useMemo(
    () => formatAmount(lineItemsAmountTotal),
    [lineItemsAmountTotal],
  );
  const effectiveTotalItemAmount =
    invoiceDetailValues.totalItemAmount.trim().length > 0
      ? invoiceDetailValues.totalItemAmount
      : formattedLineItemsAmount;

  const handleInvoiceFieldChange = (
    key: keyof InvoiceDetailValues,
    value: Date | string | null,
  ) => {
    setInvoiceDetailValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleGstPercentageChange = (value: string) => {
    const gstPercentage = parseNumber(value);
    const halfGstPercentage = gstPercentage / 2;

    setInvoiceDetailValues((current) => ({
      ...current,
      cgstPercentage: value ? formatPercentage(halfGstPercentage) : "",
      gstPercentage: value,
      gstValue: "",
      invoiceValue: "",
      sgstPercentage: value ? formatPercentage(halfGstPercentage) : "",
    }));
  };

  const handleCalculateInvoice = () => {
    const additionalCharges = parseNumber(invoiceDetailValues.additionalCharges);
    const totalItemAmount = parseNumber(effectiveTotalItemAmount);
    const gstPercentage = parseNumber(invoiceDetailValues.gstPercentage);
    const effectiveGstPercentage = gstPercentage > 0 ? gstPercentage : 0;
    const gstValue = totalItemAmount * (effectiveGstPercentage / 100);
    const invoiceValue = totalItemAmount + gstValue + additionalCharges;

    setInvoiceDetailValues((current) => ({
      ...current,
      gstValue: formatAmount(gstValue),
      invoiceValue: formatAmount(invoiceValue),
    }));
  };

  useImperativeHandle(
    ref,
    () => ({
      validate: () => {
        setHasSubmitted(true);

        const lineItemsValid = lineItemsRef.current?.validate() ?? true;
        const invoiceValid = !hasInvoiceRequiredErrors(invoiceDetailValues);

        if (!lineItemsValid) {
          handleTabChange("item-details");
          return false;
        }

        if (!invoiceValid) {
          handleTabChange("invoice-details");
          return false;
        }

        return true;
      },
    }),
    [invoiceDetailValues],
  );

  return (
    <Stack
      sx={{
        gap: theme.spacing(2),
      }}
    >
      <ModuleProcessTabs
        onChange={handleTabChange}
        tabs={workspaceTabs}
        value={activeTab}
      />

      <Box
        sx={{
          display: activeTab === "item-details" ? "block" : "none",
        }}
      >
        <WarehouseAAddStockLineItems
          ref={lineItemsRef}
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
          <InvoiceField
            error={hasSubmitted && !invoiceDetailValues.invoiceDate}
            label="Invoice Date"
            required
          >
            <ErpDatePickerField
              onChange={(value) => handleInvoiceFieldChange("invoiceDate", value)}
              state={
                hasSubmitted && !invoiceDetailValues.invoiceDate
                  ? "error"
                  : "default"
              }
              value={invoiceDetailValues.invoiceDate}
            />
          </InvoiceField>

          <InvoiceField label="Total Item Amount">
            <TextField
              fullWidth
              value={effectiveTotalItemAmount}
              onChange={(event) =>
                handleInvoiceFieldChange("totalItemAmount", event.target.value)
              }
              sx={getCompactFieldSx(theme)}
            />
          </InvoiceField>

          <InvoiceField
            error={hasSubmitted && isBlank(invoiceDetailValues.gstPercentage)}
            label="GST Percentage"
            required
          >
            <ErpSelectField
              onChange={handleGstPercentageChange}
              options={gstMasterOptions}
              state={
                hasSubmitted && isBlank(invoiceDetailValues.gstPercentage)
                  ? "error"
                  : "default"
              }
              value={invoiceDetailValues.gstPercentage}
            />
          </InvoiceField>

          <InvoiceField
            error={hasSubmitted && isBlank(invoiceDetailValues.sgstPercentage)}
            label="SGST Percentage"
            required
          >
            <TextField
              fullWidth
              value={invoiceDetailValues.sgstPercentage}
              sx={getCompactFieldSx(
                theme,
                hasSubmitted && isBlank(invoiceDetailValues.sgstPercentage)
                  ? "error"
                  : "readOnly",
              )}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />
          </InvoiceField>

          <InvoiceField
            error={hasSubmitted && isBlank(invoiceDetailValues.cgstPercentage)}
            label="CGST Percentage"
            required
          >
            <TextField
              fullWidth
              value={invoiceDetailValues.cgstPercentage}
              sx={getCompactFieldSx(
                theme,
                hasSubmitted && isBlank(invoiceDetailValues.cgstPercentage)
                  ? "error"
                  : "readOnly",
              )}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
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

          <InvoiceField label="Additional Charges">
            <TextField
              fullWidth
              value={invoiceDetailValues.additionalCharges}
              onChange={(event) =>
                handleInvoiceFieldChange("additionalCharges", event.target.value)
              }
              sx={getCompactFieldSx(theme)}
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
                          minWidth: theme.spacing(8),
                          my: theme.spacing(0.375),
                          px: theme.spacing(1),
                          py: theme.spacing(0.375),
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
});

function InvoiceField({
  children,
  error = false,
  label,
  required = false,
}: {
  children: ReactNode;
  error?: boolean;
  label: string;
  required?: boolean;
}) {
  return (
    <Stack spacing={0.75}>
      <Typography variant="subtitle2" color="text.primary">
        {label}
        {required ? (
          <Typography
            component="span"
            sx={(theme) => ({
              color: theme.palette.error.main,
              ml: theme.spacing(0.25),
            })}
          >
            *
          </Typography>
        ) : null}
      </Typography>
      {children}
      {error ? (
        <Typography variant="caption" color="error">
          {label} is required.
        </Typography>
      ) : null}
    </Stack>
  );
}

function hasInvoiceRequiredErrors(values: InvoiceDetailValues) {
  return (
    !values.invoiceDate ||
    isBlank(values.gstPercentage) ||
    isBlank(values.sgstPercentage) ||
    isBlank(values.cgstPercentage)
  );
}

function isBlank(value: string) {
  return value.trim().length === 0;
}

function parseNumber(value: string) {
  const numericValue = Number(value.replace(/,/g, "").replace(/%/g, "").trim());
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercentage(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }

  return `${Number.isInteger(value) ? String(value) : value.toFixed(2)}%`;
}
