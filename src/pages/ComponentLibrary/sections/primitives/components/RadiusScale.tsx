import { Box, Stack, Typography, useTheme } from "@mui/material";

export function RadiusScale() {
  const theme = useTheme();

  const items = [
    {
      label: "Small",
      tokenName: "customTokens.radius.sm",
      value: theme.customTokens.radius.sm,
    },
    {
      label: "Medium",
      tokenName: "customTokens.radius.md",
      value: theme.customTokens.radius.md,
    },
    {
      label: "Large",
      tokenName: "customTokens.radius.lg",
      value: theme.customTokens.radius.lg,
    },
    {
      label: "Extra Large",
      tokenName: "customTokens.radius.xl",
      value: theme.customTokens.radius.xl,
    },
    {
      label: "Pill",
      tokenName: "customTokens.radius.pill",
      value: theme.customTokens.radius.pill,
    },
  ] as const;

  return (
    <Box
      sx={(theme) => ({
        display: "grid",
        gap: theme.spacing(2),
        gridTemplateColumns: {
          xs: "repeat(1, minmax(0, 1fr))",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(5, minmax(0, 1fr))",
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
                height: theme.spacing(7),
                borderRadius: `${item.value}px`,
                backgroundColor: theme.customTokens.surfaces.paper,
                border: `1px solid ${theme.customTokens.borders.strong}`,
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

              <Typography variant="body2" color="text.secondary">
                {item.value}px
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
