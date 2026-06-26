import { Box, Stack, Typography, useTheme } from "@mui/material";

export function ShadowScale() {
  const theme = useTheme();

  const items = [
    {
      label: "None",
      tokenName: "customTokens.elevation.none",
      value: theme.customTokens.elevation.none,
    },
    {
      label: "XS",
      tokenName: "customTokens.elevation.xs",
      value: theme.customTokens.elevation.xs,
    },
    {
      label: "SM",
      tokenName: "customTokens.elevation.sm",
      value: theme.customTokens.elevation.sm,
    },
    {
      label: "MD",
      tokenName: "customTokens.elevation.md",
      value: theme.customTokens.elevation.md,
    },
    {
      label: "LG",
      tokenName: "customTokens.elevation.lg",
      value: theme.customTokens.elevation.lg,
    },
  ] as const;

  return (
    <Box
      sx={(theme) => ({
        display: "grid",
        gap: theme.spacing(2),
        gridTemplateColumns: {
          xs: "repeat(1, minmax(0, 1fr))",
          md: "repeat(2, minmax(0, 1fr))",
          xl: "repeat(5, minmax(0, 1fr))",
        },
      })}
    >
      {items.map((item) => (
        <Box
          key={item.tokenName}
          sx={(theme) => ({
            border: `1px solid ${theme.customTokens.borders.light}`,
            borderRadius: `${theme.customTokens.radius.md}px`,
            backgroundColor: theme.customTokens.surfaces.surface,
            p: theme.spacing(2),
          })}
        >
          <Stack
            sx={(theme) => ({
              gap: theme.spacing(1.5),
            })}
          >
            <Box
              sx={(theme) => ({
                height: theme.spacing(10),
                borderRadius: `${theme.customTokens.radius.md}px`,
                backgroundColor: theme.customTokens.surfaces.paper,
                border: `1px solid ${theme.customTokens.borders.subtle}`,
                boxShadow: item.value,
              })}
            />

            <Stack
              sx={(theme) => ({
                gap: theme.spacing(0.5),
              })}
            >
              <Typography variant="subtitle2" color="text.primary">
                {item.label}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {item.tokenName}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      ))}
    </Box>
  );
}
