import { Box, Stack, Typography } from "@mui/material";

import { formSectionCardSx } from "../../shared/formSectionStyles";
import { formatQuantityDisplay } from "./factoryQuantityAllocation";

export function FactoryProcessBalanceSummary({
  balanceQuantity,
  errorText,
  processedQuantity,
  sourceQuantity,
  unitLabel,
}: {
  balanceQuantity: number;
  errorText?: string;
  processedQuantity: number;
  sourceQuantity: number;
  unitLabel: string;
}) {
  return (
    <Box
      sx={(theme) => ({
        ...formSectionCardSx(theme),
      })}
    >
      <Stack spacing={1}>
        <Box
          sx={(theme) => ({
            display: "grid",
            gap: theme.spacing(1.5),
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, minmax(0, 1fr))",
            },
          })}
        >
          <BalanceStat
            label="Source Qty"
            value={formatQuantityDisplay(sourceQuantity, unitLabel)}
          />
          <BalanceStat
            label="Processed"
            value={formatQuantityDisplay(processedQuantity, unitLabel)}
          />
          <BalanceStat
            emphasize
            label="Balance"
            value={formatQuantityDisplay(Math.max(0, balanceQuantity), unitLabel)}
          />
        </Box>

        {errorText ? (
          <Typography
            sx={(theme) => ({
              color: theme.palette.error.main,
              fontSize: "0.8125rem",
              fontWeight: 500,
            })}
          >
            {errorText}
          </Typography>
        ) : (
          <Typography
            sx={(theme) => ({
              color: theme.customTokens.text.secondary,
              fontSize: "0.75rem",
            })}
          >
            Balance remains available for later processing. It is not wastage.
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

function BalanceStat({
  emphasize = false,
  label,
  value,
}: {
  emphasize?: boolean;
  label: string;
  value: string;
}) {
  return (
    <Stack spacing={0.4} sx={{ minWidth: 0 }}>
      <Typography
        sx={(theme) => ({
          color: emphasize
            ? theme.customTokens.brand.primary
            : theme.customTokens.text.secondary,
          fontSize: "12px",
          fontWeight: 500,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
        })}
      >
        {label}
      </Typography>
      <Typography
        sx={(theme) => ({
          color: emphasize
            ? theme.customTokens.brand.primary
            : theme.customTokens.text.primary,
          fontSize: "14px",
          fontWeight: 600,
          lineHeight: 1.4,
        })}
      >
        {value}
      </Typography>
    </Stack>
  );
}
