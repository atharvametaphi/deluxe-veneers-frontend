import { Box, Stack, Typography, useTheme } from "@mui/material";

export function SpacingScale() {
  const theme = useTheme();

  return (
    <Box
      sx={(theme) => ({
        display: "grid",
        gap: theme.spacing(2),
        gridTemplateColumns: {
          xs: "repeat(1, minmax(0, 1fr))",
          md: "repeat(2, minmax(0, 1fr))",
        },
      })}
    >
      {theme.customTokens.spacingScale.map((token) => (
        <Box
          key={token.tokenName}
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
                height: theme.spacing(6),
                display: "flex",
                alignItems: "center",
                borderRadius: `${theme.customTokens.radius.sm}px`,
                backgroundColor: theme.customTokens.surfaces.paper,
                border: `1px solid ${theme.customTokens.borders.subtle}`,
                px: theme.spacing(2),
              })}
            >
              <Box
                sx={(theme) => ({
                  width: `${token.value}px`,
                  minWidth: `${token.value}px`,
                  height: theme.spacing(1.5),
                  borderRadius: `${theme.customTokens.radius.pill}px`,
                  backgroundColor: theme.palette.primary.main,
                })}
              />
            </Box>

            <Stack
              direction="row"
              justifyContent="space-between"
              sx={(theme) => ({
                gap: theme.spacing(2),
              })}
            >
              <Typography variant="subtitle2" color="text.primary">
                {token.value}px
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {token.tokenName}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      ))}
    </Box>
  );
}
